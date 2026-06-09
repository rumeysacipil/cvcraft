package com.cvcraft.service;

import com.cvcraft.exception.ApiException;
import com.cvcraft.model.dto.CvDtos;
import com.cvcraft.model.entity.Cv;
import com.cvcraft.model.entity.User;
import com.cvcraft.repository.CvRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvService {

    // İlk 15 şablon + %100 ATS Pure varyasyonlar ücretsiz
    private static final Set<String> FREE_THEMES = Set.of(
            "minimal-midnight-serif", "minimal-ocean-sans", "minimal-slate-verdana", "minimal-forest-serif", "minimal-teal-verdana", "minimal-indigo-sans", "minimal-violet-sans", "minimal-crimson-serif", "minimal-amber-mono", "minimal-rose-serif", "compact-midnight-verdana", "compact-ocean-sans", "compact-slate-mono", "compact-forest-verdana", "compact-teal-serif", "swe-minimal-slate-mono", "swe-minimal-ocean-sans", "swe-minimal-midnight-verdana", "swe-minimal-indigo-mono", "swe-minimal-teal-sans", "swe-minimal-forest-mono", "swe-compact-slate-sans", "swe-compact-ocean-verdana", "swe-compact-midnight-mono", "swe-compact-indigo-sans", "swe-compact-teal-mono", "swe-compact-forest-verdana", "swe-corporate-slate-verdana", "swe-corporate-ocean-mono", "swe-corporate-midnight-sans", "swe-corporate-indigo-verdana", "swe-corporate-teal-sans", "swe-corporate-forest-mono", "swe-minimal-amber-sans", "swe-minimal-rose-mono", "swe-compact-crimson-verdana", "swe-corporate-violet-sans", "swe-timeline-slate-mono", "swe-timeline-ocean-sans", "swe-timeline-midnight-verdana", "swe-minimal-slate-serif", "swe-compact-ocean-serif", "swe-corporate-midnight-mono", "swe-minimal-indigo-verdana", "swe-compact-teal-sans", "swe-corporate-forest-verdana", "swe-timeline-indigo-mono", "swe-minimal-violet-verdana", "swe-compact-amber-sans", "swe-corporate-rose-mono", "ats-pure-slate-serif", "ats-pure-ocean-sans", "ats-pure-midnight-verdana", "ats-pure-indigo-mono", "ats-pure-teal-sans", "ats-pure-forest-mono", "ats-pure-slate-sans", "ats-pure-ocean-verdana", "ats-pure-midnight-mono", "ats-pure-indigo-sans", "ats-pure-teal-mono", "ats-pure-forest-verdana", "ats-pure-amber-sans", "ats-pure-rose-mono", "ats-pure-crimson-verdana", "ats-pure-violet-sans"
    );
    private static final int FREE_CV_LIMIT = 3; // Ücretsiz kullanıcı 3 CV oluşturabilir

    private final CvRepository cvRepository;

    public List<CvDtos.CvSummary> getUserCvs(User user) {
        return cvRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream().map(this::toSummary).toList();
    }

    public CvDtos.CvResponse getCv(Long cvId, User user) {
        return toResponse(findCvForUser(cvId, user.getId()));
    }

    @Transactional
    public CvDtos.CvResponse createCv(CvDtos.CvRequest request, User user) {
        if (!user.isPremium()) {
            long count = cvRepository.countByUserId(user.getId());
            if (count >= FREE_CV_LIMIT)
                throw new ApiException("Ücretsiz planda en fazla " + FREE_CV_LIMIT + " CV oluşturabilirsiniz.", HttpStatus.PAYMENT_REQUIRED);
        }
        validateThemeAccess(request.getTheme(), user);
        Cv cv = Cv.builder()
                .user(user)
                .title(request.getTitle())
                .theme(request.getTheme() != null ? request.getTheme() : "minimal-midnight-serif")
                .data(request.getData())
                .build();
        cvRepository.save(cv);
        log.info("CV oluşturuldu: id={}, user={}", cv.getId(), user.getEmail());
        return toResponse(cv);
    }

    @Transactional
    public CvDtos.CvResponse updateCv(Long cvId, CvDtos.CvRequest request, User user) {
        Cv cv = findCvForUser(cvId, user.getId());
        if (request.getTheme() != null) { validateThemeAccess(request.getTheme(), user); cv.setTheme(request.getTheme()); }
        if (request.getTitle() != null) cv.setTitle(request.getTitle());
        if (request.getData() != null) cv.setData(request.getData());
        cvRepository.save(cv);
        return toResponse(cv);
    }

    @Transactional
    public void deleteCv(Long cvId, User user) {
        Cv cv = findCvForUser(cvId, user.getId());
        cvRepository.delete(cv);
        log.info("CV silindi: id={}, user={}", cvId, user.getEmail());
    }

    @Transactional
    public CvDtos.CvResponse duplicateCv(Long cvId, User user) {
        if (!user.isPremium()) {
            long count = cvRepository.countByUserId(user.getId());
            if (count >= FREE_CV_LIMIT)
                throw new ApiException("Ücretsiz planda en fazla " + FREE_CV_LIMIT + " CV oluşturabilirsiniz.", HttpStatus.PAYMENT_REQUIRED);
        }
        Cv original = findCvForUser(cvId, user.getId());
        Cv copy = Cv.builder()
                .user(user)
                .title(original.getTitle() + " (Kopya)")
                .theme(original.getTheme())
                .data(original.getData())
                .build();
        cvRepository.save(copy);
        log.info("CV kopyalandı: originalId={}, copyId={}, user={}", cvId, copy.getId(), user.getEmail());
        return toResponse(copy);
    }

    @Transactional
    public byte[] exportPdf(Long cvId, User user) {
        // PDF indirme ücretsiz
        Cv cv = findCvForUser(cvId, user.getId());
        return PdfGeneratorService.generatePdf(cv);
    }

    @Transactional
    public CvDtos.CvResponse toggleShare(Long cvId, User user) {
        Cv cv = findCvForUser(cvId, user.getId());
        cv.setPublic(!cv.isPublic());
        if (cv.isPublic() && cv.getShareToken() == null) {
            cv.setShareToken(UUID.randomUUID().toString());
        }
        cvRepository.save(cv);
        log.info("CV paylaşım durumu değişti: id={}, isPublic={}", cvId, cv.isPublic());
        return toResponse(cv);
    }

    public CvDtos.CvResponse getSharedCv(String shareToken) {
        Cv cv = cvRepository.findByShareTokenAndIsPublicTrue(shareToken)
                .orElseThrow(() -> new ApiException("Paylaşılan CV bulunamadı veya gizli", HttpStatus.NOT_FOUND));
        return toResponse(cv);
    }

    // ─── Yardımcılar ──────────────────────────────────────────────────────────

    private void validateThemeAccess(String theme, User user) {
        if (theme != null && !FREE_THEMES.contains(theme) && !user.isPremium())
            throw new ApiException("Bu şablon Premium üyelik gerektirir", HttpStatus.PAYMENT_REQUIRED);
    }

    private Cv findCvForUser(Long cvId, Long userId) {
        return cvRepository.findByIdAndUserId(cvId, userId)
                .orElseThrow(() -> new ApiException("CV bulunamadı", HttpStatus.NOT_FOUND));
    }

    private CvDtos.CvSummary toSummary(Cv cv) {
        return CvDtos.CvSummary.builder().id(cv.getId()).title(cv.getTitle()).theme(cv.getTheme()).updatedAt(cv.getUpdatedAt()).shareToken(cv.getShareToken()).isPublic(cv.isPublic()).build();
    }

    private CvDtos.CvResponse toResponse(Cv cv) {
        return CvDtos.CvResponse.builder().id(cv.getId()).title(cv.getTitle()).theme(cv.getTheme()).data(cv.getData()).createdAt(cv.getCreatedAt()).updatedAt(cv.getUpdatedAt()).shareToken(cv.getShareToken()).isPublic(cv.isPublic()).build();
    }
}
