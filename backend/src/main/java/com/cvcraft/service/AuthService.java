package com.cvcraft.service;

import com.cvcraft.exception.ApiException;
import com.cvcraft.model.dto.Dtos.*;
import com.cvcraft.model.dto.UserResponse;
import com.cvcraft.model.entity.User;
import com.cvcraft.model.enums.SubscriptionPlan;
import com.cvcraft.repository.UserRepository;
import com.cvcraft.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Bu e-posta adresi zaten kayıtlı", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .plan(SubscriptionPlan.FREE)
                .build();

        userRepository.save(user);
        log.info("Yeni kullanıcı kaydedildi: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ApiException("E-posta veya şifre hatalı", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        log.info("Kullanıcı giriş yaptı: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String username;
        try {
            username = jwtTokenProvider.extractUsername(request.getRefreshToken());
        } catch (Exception e) {
            throw new ApiException("Geçersiz refresh token", HttpStatus.UNAUTHORIZED);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtTokenProvider.isTokenValid(request.getRefreshToken(), userDetails)) {
            throw new ApiException("Refresh token süresi dolmuş", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    public static UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .plan(user.getPlan())
                .isPremium(user.getPlan() == SubscriptionPlan.PREMIUM)
                .pdfCredits(user.getPdfCredits())
                .subscriptionExpiresAt(user.getSubscriptionExpiresAt())
                .build();
    }
}
