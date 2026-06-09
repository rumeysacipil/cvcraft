package com.cvcraft.model.dto;

import com.cvcraft.model.enums.SubscriptionPlan;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private SubscriptionPlan plan;
    @com.fasterxml.jackson.annotation.JsonProperty("isPremium")
    private Boolean isPremium;
    private Integer pdfCredits;
    private LocalDateTime subscriptionExpiresAt;
}
