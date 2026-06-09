package com.cvcraft.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AiDtos {

    @Data
    public static class AnalyzeRequest {
        private Long cvId;
        private String targetJob; // opsiyonel: "Backend Developer"
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalyzeResponse {
        private Integer score;
        private Integer atsScore;
        private Integer afterScore;
        private java.util.List<String> strengths;
        private java.util.List<String> improvements;
        private String jobMatch;
        private String summary;
    }
}
