package com.cvcraft.model.dto;

import com.cvcraft.model.enums.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class PaymentDtos {

    public enum PaymentType {MONTHLY_SUBSCRIPTION, ONE_TIME_PDF}

    @Data
    public static class CheckoutRequest {
        private PaymentType type;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CheckoutResponse {
        private String sessionId;
        private String url;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubscriptionStatus {
        private SubscriptionPlan plan;
        private Boolean isPremium;
        private Integer pdfCredits;
        private LocalDateTime expiresAt;
    }
}
