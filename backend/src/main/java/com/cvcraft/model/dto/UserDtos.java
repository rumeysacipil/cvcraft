package com.cvcraft.model.dto;

import com.cvcraft.model.enums.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserDtos {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private SubscriptionPlan plan;
        private Boolean isPremium;
        private Integer pdfCredits;
        private LocalDateTime subscriptionExpiresAt;
    }
}
