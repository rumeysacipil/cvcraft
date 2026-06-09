package com.cvcraft.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

public class CvDtos {

    @Data
    public static class CvRequest {
        @NotBlank
        private String title;
        private String theme;
        private Map<String, Object> data;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CvResponse {
        private Long id;
        private String title;
        private String theme;
        private Map<String, Object> data;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String shareToken;
        private boolean isPublic;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CvSummary {
        private Long id;
        private String title;
        private String theme;
        private LocalDateTime updatedAt;
        private String shareToken;
        private boolean isPublic;
    }
}
