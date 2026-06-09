package com.cvcraft.service;

import com.cvcraft.exception.ApiException;
import com.cvcraft.model.entity.Cv;
import com.cvcraft.model.entity.User;
import com.cvcraft.model.dto.CvDtos;
import com.cvcraft.repository.CvRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAnalysisService {

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-flash-latest}")
    private String model;

    private final CvRepository cvRepository;
    private final CvService cvService;
    private final ObjectMapper objectMapper;
    private final WebClient.Builder webClientBuilder;

    // ─── CV Analizi ───────────────────────────────────────────────────────────

    public Map<String, Object> analyzeCv(Long cvId, String targetJob, String responseLang, User user) {
        requirePremium(user);
        Cv cv = findCv(cvId, user);
        String raw = callApi(buildAnalyzePrompt(cv, targetJob, responseLang));
        return parseJson(raw);
    }

    // ─── PDF'ten CV Oluşturma ─────────────────────────────────────────────────

    public Map<String, Object> parsePdfToCv(String rawText) {
        String prompt = """
                You are an expert CV parser. I will provide you with the raw text extracted from a PDF CV.
                Your task is to parse this text and convert it into a strictly structured JSON format.

                RULES:
                1. Return ONLY valid JSON. No markdown, no explanations, no extra text.
                2. Do not hallucinate. Only use information present in the text.
                3. The JSON must have exactly this structure:
                {
                  "personal": {
                    "name": "First Last",
                    "title": "Job Title",
                    "email": "email@example.com",
                    "phone": "phone number",
                    "location": "City, Country",
                    "linkedin": "linkedin url",
                    "github": "github url"
                  },
                  "summary": "Short professional summary",
                  "experience": [
                    { "company": "Company", "role": "Role", "period": "Start - End", "desc": "Responsibilities" }
                  ],
                  "education": [
                    { "school": "School", "degree": "Degree", "period": "Start - End" }
                  ],
                  "skills": ["Skill 1", "Skill 2"],
                  "languages": [
                    { "name": "Language", "level": "Native/Fluent/etc" }
                  ],
                  "projects": [
                    { "name": "Project Name", "link": "URL", "desc": "Description" }
                  ],
                  "certificates": [
                    { "name": "Cert Name", "issuer": "Issuer", "date": "Date" }
                  ]
                }

                RAW PDF TEXT:
                %s
                """.formatted(rawText);

        return parseJson(callApi(prompt));
    }

    // ─── Dil Çevirisi ─────────────────────────────────────────────────────────

    public Map<String, Object> translateCv(Long cvId, String targetLang, User user) {
        Cv cv = findCv(cvId, user);

        String langName = switch (targetLang.toUpperCase()) {
            case "EN" -> "English";
            case "DE" -> "German (Deutsch)";
            case "FR" -> "French (Français)";
            case "ES" -> "Spanish (Español)";
            default -> targetLang;
        };

        // Fix 1: Removed "dates" from the do-not-translate list so Turkish month
        // names (Oca, Haz, Eyl, Günümüz etc.) and date phrases get translated too.
        String prompt = """
                You are a professional CV translator. Your task is to translate ALL text values in the following JSON into %s.

                STRICT RULES — follow every single one:
                1. Return ONLY valid JSON. No markdown, no explanation, no extra text.
                2. Keep every JSON key exactly as-is. Never translate keys.
                3. Translate ALL string values — including every item in arrays like experience[].desc, experience[].period, education[].degree, education[].period, skills[], languages[], projects[].desc, certificates[].name, summary, title.
                4. Do NOT leave any value untranslated. If a value is already in %s, keep it as-is.
                5. Do NOT translate: email addresses, phone numbers, URLs, company names, school names, person names, technical acronyms.
                6. DO translate: date ranges, period fields (e.g. "Oca 2021 - Günümüz" → "Jan 2021 - Present", "Eyl 2014 - Haz 2018" → "Sep 2014 - Jun 2018").
                7. For the "languages" array: translate language names into %s (e.g. "Türkçe" → "Turkish", "İngilizce" → "English") and keep the level in parentheses.
                8. For the "skills" array: keep technical terms as-is (React, Java, Docker etc.) but translate generic skill descriptions if any.
                9. Return the complete JSON object — same structure, same keys, all values translated.

                INPUT JSON:
                %s

                OUTPUT (valid JSON only, nothing else):
                """
                .formatted(langName, langName, langName, formatData(cv.getData()));

        String raw = callApi(prompt);
        Map<String, Object> translatedData = parseJson(raw);

        // Yeni CV oluştur ve ID'sini döndür
        CvDtos.CvRequest req = new CvDtos.CvRequest();
        req.setTitle(cv.getTitle() + " (" + targetLang.toUpperCase() + ")");
        req.setTheme(cv.getTheme());
        req.setData(translatedData);
        CvDtos.CvResponse newCv = cvService.createCv(req, user);

        return Map.of(
                "cvId", newCv.getId(),
                "title", newCv.getTitle(),
                "message", "Çeviri tamamlandı.",
                "redirectTo", "/editor/" + newCv.getId());
    }

    // ─── Kapak Mektubu ────────────────────────────────────────────────────────

    public Map<String, Object> coverLetter(Long cvId, String role, String company, String responseLang, User user) {
        requirePremium(user);
        Cv cv = findCv(cvId, user);

        // Fix 2: Language-aware cover letter
        boolean isEnglish = "EN".equalsIgnoreCase(responseLang);
        String langInstruction = isEnglish
                ? "Write the cover letter in English."
                : "Kapak mektubunu Türkçe yaz.";
        String roleLabel = isEnglish ? "Position" : "Pozisyon";
        String companyLabel = isEnglish ? "Company" : "Şirket";
        String roleValue = role != null && !role.isBlank() ? role : (isEnglish ? "not specified" : "belirtilmemiş");
        String companyValue = company != null && !company.isBlank() ? company : (isEnglish ? "not specified" : "belirtilmemiş");
        String toneNote = isEnglish
                ? "Use a sincere but professional tone. 3-4 paragraphs."
                : "Samimi ama profesyonel bir ton kullan. 3-4 paragraf.";
        String jsonNote = isEnglish
                ? "Respond in JSON format, no markdown: { \"text\": \"<letter text>\" }"
                : "JSON formatında yanıt ver, markdown yok: { \"text\": \"<mektup metni>\" }";

        String prompt = """
                You are a career advisor. Write a professional cover letter based on the CV below.
                %s: %s
                %s: %s

                CV:
                %s

                %s %s
                %s
                """.formatted(roleLabel, roleValue, companyLabel, companyValue,
                formatData(cv.getData()), langInstruction, toneNote, jsonNote);

        return parseJson(callApi(prompt));
    }

    // ─── İş İlanı Eşleştirme ─────────────────────────────────────────────────

    public Map<String, Object> jobMatch(Long cvId, String jobDescription, String responseLang, User user) {
        requirePremium(user);
        Cv cv = findCv(cvId, user);

        // Fix 2: Language-aware job match — respond in the CV's language
        boolean isEnglish = "EN".equalsIgnoreCase(responseLang);
        String langInstruction = isEnglish
                ? "Respond entirely in English."
                : "Yanıtı tamamen Türkçe ver.";

        String prompt;
        if (isEnglish) {
            prompt = """
                    Compare the CV with the job listing and evaluate in JSON format.
                    %s

                    CV:
                    %s

                    JOB LISTING / POSITION:
                    %s

                    Response format (JSON only, nothing else):
                    {
                      "matchScore": <0-100>,
                      "summary": "<2-3 sentence overall assessment>",
                      "missingSkills": ["missing 1", "missing 2"],
                      "suggestions": ["Add this to your CV...", "Highlight this..."]
                    }
                    """.formatted(langInstruction, formatData(cv.getData()), jobDescription);
        } else {
            prompt = """
                    CV ile iş ilanını karşılaştır ve JSON formatında değerlendir.
                    %s

                    CV:
                    %s

                    İŞ İLANI / POZİSYON:
                    %s

                    Yanıt formatı (sadece JSON, başka hiçbir şey yok):
                    {
                      "matchScore": <0-100>,
                      "summary": "<2-3 cümle genel değerlendirme>",
                      "missingSkills": ["eksik 1", "eksik 2"],
                      "suggestions": ["CV'ne şunu ekle...", "şunu vurgula..."]
                    }
                    """.formatted(langInstruction, formatData(cv.getData()), jobDescription);
        }

        return parseJson(callApi(prompt));
    }

    // ─── Yardımcılar ──────────────────────────────────────────────────────────

    private String buildAnalyzePrompt(Cv cv, String targetJob, String responseLang) {
        boolean isEnglish = "EN".equalsIgnoreCase(responseLang);
        String langInstruction = isEnglish ? "Respond entirely in English." : "Yanıtı tamamen Türkçe ver.";

        if (isEnglish) {
            String target = targetJob != null && !targetJob.isBlank() ? " Target position: " + targetJob + "." : "";
            return """
                    As a career advisor, analyze this CV.%s
                    %s

                    CV:
                    %s

                    Response (JSON only, no markdown):
                    {
                      "score": <0-100 overall score>,
                      "atsScore": <0-100 ATS compliance>,
                      "afterScore": <estimated score after improvements>,
                      "strengths": ["strength 1", "strength 2"],
                      "improvements": ["suggestion 1", "suggestion 2", "suggestion 3"],
                      "jobMatch": "<best fitting position>",
                      "summary": "<2-3 sentences>"
                    }
                    """.formatted(target, langInstruction, formatData(cv.getData()));
        } else {
            String target = targetJob != null && !targetJob.isBlank() ? " Hedef pozisyon: " + targetJob + "." : "";
            return """
                    Kariyer danışmanı olarak bu CV'yi analiz et.%s
                    %s

                    CV:
                    %s

                    Yanıt (sadece JSON, markdown yok):
                    {
                      "score": <0-100 genel puan>,
                      "atsScore": <0-100 ATS uyum>,
                      "afterScore": <öneriler sonrası tahmini puan>,
                      "strengths": ["güçlü yön 1", "güçlü yön 2"],
                      "improvements": ["öneri 1", "öneri 2", "öneri 3"],
                      "jobMatch": "<en uygun pozisyon>",
                      "summary": "<2-3 cümle>"
                    }
                    """.formatted(target, langInstruction, formatData(cv.getData()));
        }
    }

    private String callApi(String prompt) {
        Map<String, Object> parts = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(parts));
        Map<String, Object> body = Map.of("contents", List.of(content));

        String uri = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key="
                + geminiApiKey;

        try {
            String response = webClientBuilder.build()
                    .post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            log.error("Gemini API HTTP Hatası: Kod={}, Detay={}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ApiException("AI servisi şu an kullanılamıyor", HttpStatus.SERVICE_UNAVAILABLE);
        } catch (Exception e) {
            log.error("Gemini API Parse/Bağlantı hatası", e);
            throw new ApiException("AI servisi şu an kullanılamıyor", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String raw) {
        try {
            String clean = raw.replaceAll("(?s)```json\\s*|```", "").trim();
            return objectMapper.readValue(clean, Map.class);
        } catch (Exception e) {
            log.error("AI parse hatası: {}", raw);
            throw new ApiException("AI yanıtı işlenemedi", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String formatData(Map<String, Object> data) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(data);
        } catch (Exception e) {
            return data.toString();
        }
    }

    private Cv findCv(Long cvId, User user) {
        return cvRepository.findByIdAndUserId(cvId, user.getId())
                .orElseThrow(() -> new ApiException("CV bulunamadı", HttpStatus.NOT_FOUND));
    }

    private void requirePremium(User user) {
        if (!user.isPremium())
            throw new ApiException("Bu özellik Premium üyelik gerektirir", HttpStatus.PAYMENT_REQUIRED);
    }
}
