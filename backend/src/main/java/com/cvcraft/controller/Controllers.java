package com.cvcraft.controller;

import com.cvcraft.model.dto.CvDtos;
import com.cvcraft.model.dto.Dtos.*;
import com.cvcraft.model.dto.HtmlPdfRequest;
import com.cvcraft.model.dto.UserResponse;
import com.cvcraft.model.entity.User;
import com.cvcraft.service.*;
import com.stripe.exception.EventDataObjectDeserializationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.cvcraft.repository.UserRepository;
import com.cvcraft.exception.ApiException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

// ─── Auth Controller ──────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {
    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody java.util.Map<String, String> body) {
        String idToken = body.get("idToken");
        return ResponseEntity.ok(googleAuthService.authenticate(idToken));
    }
}

// ─── User Controller
// ──────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(AuthService.mapToUserResponse(getUser(userDetails, userRepository)));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails, userRepository);
        String newName = body.get("name");
        if (newName != null && !newName.isBlank()) {
            // XSS koruması: HTML etiketlerini temizle
            String sanitized = newName.trim().replaceAll("<[^>]*>", "").replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]",
                    "");
            if (sanitized.length() >= 2 && sanitized.length() <= 100) {
                user.setName(sanitized);
                userRepository.save(user);
            }
        }
        return ResponseEntity.ok(AuthService.mapToUserResponse(user));
    }

    static User getUser(UserDetails userDetails, UserRepository repo) {
        return repo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));
    }
}

// ─── CV Controller
// ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/cvs")
@RequiredArgsConstructor
class CvController {
    private final CvService cvService;
    private final HtmlToPdfService htmlToPdfService;
    private final UserRepository userRepository;
    private final PdfParseService pdfParseService;
    private final AiAnalysisService aiAnalysisService;

    @GetMapping
    public ResponseEntity<List<CvDtos.CvSummary>> getMyCvs(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(cvService.getUserCvs(UserController.getUser(ud, userRepository)));
    }

    @PostMapping
    public ResponseEntity<CvDtos.CvResponse> createCv(@RequestBody CvDtos.CvRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cvService.createCv(request, UserController.getUser(ud, userRepository)));
    }

    @PostMapping("/import")
    public ResponseEntity<CvDtos.CvResponse> importCv(@RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails ud) {
        User user = UserController.getUser(ud, userRepository);
        String text = pdfParseService.extractTextFromPdf(file);
        Map<String, Object> data = aiAnalysisService.parsePdfToCv(text);
        
        CvDtos.CvRequest req = new CvDtos.CvRequest();
        req.setTitle("İçe Aktarılan CV");
        req.setTheme("minimal-midnight-serif");
        req.setData(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(cvService.createCv(req, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CvDtos.CvResponse> getCv(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(cvService.getCv(id, UserController.getUser(ud, userRepository)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CvDtos.CvResponse> updateCv(@PathVariable Long id, @RequestBody CvDtos.CvRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(cvService.updateCv(id, request, UserController.getUser(ud, userRepository)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCv(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails ud) {
        cvService.deleteCv(id, UserController.getUser(ud, userRepository));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<CvDtos.CvResponse> toggleShare(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails ud) {
        return ResponseEntity.ok(cvService.toggleShare(id, UserController.getUser(ud, userRepository)));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<CvDtos.CvResponse> duplicateCv(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cvService.duplicateCv(id, UserController.getUser(ud, userRepository)));
    }

    @PostMapping(value = "/{id}/pdf-html", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdfHtml(@PathVariable Long id, @RequestBody HtmlPdfRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        UserController.getUser(ud, userRepository); // auth check
        if (request == null || request.html() == null || request.html().isBlank())
            return ResponseEntity.badRequest().build();

        byte[] pdf = htmlToPdfService.renderA4Pdf(request.html());
        String fileName = (request.title() == null || request.title().isBlank() ? "cv-" + id : request.title())
                .replaceAll("[\\\\/:*?\"<>|]", "_");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.attachment().filename(fileName + ".pdf", StandardCharsets.UTF_8).build());
        headers.setContentLength(pdf.length);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        User user = UserController.getUser(ud, userRepository);
        byte[] pdf = cvService.exportPdf(id, user);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "cv-" + id + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}

// ─── Payment Controller
// ───────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
class PaymentController {
    private final StripePaymentService stripePaymentService;
    private final UserRepository userRepository;

    @PostMapping("/checkout/subscription")
    public ResponseEntity<Map<String, String>> subscriptionCheckout(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(Map.of("url",
                stripePaymentService.createSubscriptionCheckout(UserController.getUser(ud, userRepository))));
    }

    @PostMapping("/checkout/one-time")
    public ResponseEntity<Map<String, String>> oneTimeCheckout(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(Map.of("url",
                stripePaymentService.createOneTimePdfCheckout(UserController.getUser(ud, userRepository))));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) throws EventDataObjectDeserializationException {
        stripePaymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<UserResponse> getStatus(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(AuthService.mapToUserResponse(UserController.getUser(ud, userRepository)));
    }

    @PostMapping("/verify-session")
    public ResponseEntity<Void> verifySession(@RequestParam String sessionId, @AuthenticationPrincipal UserDetails ud) {
        User user = UserController.getUser(ud, userRepository);
        stripePaymentService.verifySession(sessionId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription(@AuthenticationPrincipal UserDetails ud) {
        stripePaymentService.cancelSubscription(UserController.getUser(ud, userRepository));
        return ResponseEntity.ok().build();
    }
}

// ─── AI Controller
// ────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
class AiController {
    private final AiAnalysisService aiAnalysisService;
    private final UserRepository userRepository;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud) {
        if (body.get("cvId") == null) {
            throw new ApiException("cvId zorunludur", HttpStatus.BAD_REQUEST);
        }
        User user = UserController.getUser(ud, userRepository);
        Long cvId = Long.valueOf(body.get("cvId").toString());
        String targetJob = (String) body.get("targetJob");
        String responseLang = (String) body.getOrDefault("responseLang", "TR");
        return ResponseEntity.ok(aiAnalysisService.analyzeCv(cvId, targetJob, responseLang, user));
    }

    @PostMapping("/translate")
    public ResponseEntity<Map<String, Object>> translate(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud) {
        if (body.get("cvId") == null) {
            throw new ApiException("cvId zorunludur", HttpStatus.BAD_REQUEST);
        }
        User user = UserController.getUser(ud, userRepository);
        Long cvId = Long.valueOf(body.get("cvId").toString());
        String targetLang = (String) body.getOrDefault("targetLang", "EN");
        return ResponseEntity.ok(aiAnalysisService.translateCv(cvId, targetLang, user));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<Map<String, Object>> coverLetter(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud) {
        if (body.get("cvId") == null) {
            throw new ApiException("cvId zorunludur", HttpStatus.BAD_REQUEST);
        }
        User user = UserController.getUser(ud, userRepository);
        Long cvId = Long.valueOf(body.get("cvId").toString());
        String role = (String) body.get("role");
        String company = (String) body.get("company");
        String responseLang = (String) body.getOrDefault("responseLang", "TR");
        return ResponseEntity.ok(aiAnalysisService.coverLetter(cvId, role, company, responseLang, user));
    }

    @PostMapping("/job-match")
    public ResponseEntity<Map<String, Object>> jobMatch(@RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails ud) {
        if (body.get("cvId") == null) {
            throw new ApiException("cvId zorunludur", HttpStatus.BAD_REQUEST);
        }
        User user = UserController.getUser(ud, userRepository);
        Long cvId = Long.valueOf(body.get("cvId").toString());
        String jobDescription = (String) body.get("jobDescription");
        String responseLang = (String) body.getOrDefault("responseLang", "TR");
        return ResponseEntity.ok(aiAnalysisService.jobMatch(cvId, jobDescription, responseLang, user));
    }
}
// ─── Shared CV Controller ──────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/shared")
@RequiredArgsConstructor
class SharedCvController {
    private final CvService cvService;

    @GetMapping("/{token}")
    public ResponseEntity<CvDtos.CvResponse> getSharedCv(@PathVariable String token) {
        return ResponseEntity.ok(cvService.getSharedCv(token));
    }
}
