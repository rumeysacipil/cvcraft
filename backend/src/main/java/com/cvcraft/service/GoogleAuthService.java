package com.cvcraft.service;

import com.cvcraft.exception.ApiException;
import com.cvcraft.model.dto.Dtos.AuthResponse;
import com.cvcraft.model.entity.User;
import com.cvcraft.model.enums.SubscriptionPlan;
import com.cvcraft.repository.UserRepository;
import com.cvcraft.security.jwt.JwtTokenProvider;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.google.client-id}")
    private String googleClientId;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        // Build a verifier that checks:
        //  1. Token signature against Google's public keys
        //  2. aud (audience) matches our exact Client ID
        //  3. Token expiry
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    @Transactional
    public AuthResponse authenticate(String idTokenString) {

        // ── 1. Validate token against Google's servers ────────────────────────
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new ApiException("Google ID token eksik", HttpStatus.BAD_REQUEST);
        }

        GoogleIdToken googleIdToken;
        try {
            googleIdToken = verifier.verify(idTokenString);
        } catch (GeneralSecurityException | IOException e) {
            log.warn("Google token doğrulama başarısız: {}", e.getMessage());
            throw new ApiException("Geçersiz Google token", HttpStatus.UNAUTHORIZED);
        }

        if (googleIdToken == null) {
            // null means signature check failed or token is expired
            throw new ApiException("Google token doğrulanamadı veya süresi doldu", HttpStatus.UNAUTHORIZED);
        }

        Payload payload = googleIdToken.getPayload();

        // ── 2. Security checks on the payload ────────────────────────────────
        // Ensure the Google account's email is verified by Google itself
        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ApiException("Google hesabının e-postası doğrulanmamış", HttpStatus.UNAUTHORIZED);
        }

        String googleUserId = payload.getSubject(); // stable Google user ID
        String email        = payload.getEmail();
        String name         = (String) payload.get("name");
        String avatarUrl    = (String) payload.get("picture");

        if (email == null || email.isBlank()) {
            throw new ApiException("Google hesabından e-posta alınamadı", HttpStatus.BAD_REQUEST);
        }

        // ── 3. Find-or-create user ────────────────────────────────────────────
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // New user → create account.
            // Google users have no real password — store a BCrypt-hashed random UUID
            // as a non-null placeholder. It's impossible to reverse-engineer or use
            // for normal email/password login.
            String placeholderPassword = passwordEncoder.encode(UUID.randomUUID().toString());
            user = User.builder()
                    .email(email)
                    .name(name != null ? name : email.split("@")[0])
                    .password(placeholderPassword)
                    .googleId(googleUserId)
                    .avatarUrl(avatarUrl)
                    .plan(SubscriptionPlan.FREE)
                    .emailVerified(true) // Google verified the email
                    .build();
            userRepository.save(user);
            log.info("Yeni Google kullanıcısı kaydedildi: {} (sub={})", email, googleUserId);
        } else {
            // Existing user → update Google fields if not set
            boolean changed = false;
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleUserId);
                changed = true;
            }
            if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
                user.setAvatarUrl(avatarUrl);
                changed = true;
            }
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                user.setEmailVerified(true);
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
            log.info("Mevcut kullanıcı Google ile giriş yaptı: {}", email);
        }

        // ── 4. Issue CVCraft JWT tokens ───────────────────────────────────────
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String accessToken  = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(AuthService.mapToUserResponse(user))
                .build();
    }
}
