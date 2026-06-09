package com.cvcraft.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

public class Dtos {

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8, message = "Şifre en az 8 karakter olmalı")
        private String password;
        @NotBlank
        private String name;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private UserResponse user;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }
}

// ─── User DTOs ────────────────────────────────────────────────────────────────

// ─── CV DTOs ──────────────────────────────────────────────────────────────────

// ─── Payment DTOs ─────────────────────────────────────────────────────────────

// ─── AI DTOs ─────────────────────────────────────────────────────────────────

