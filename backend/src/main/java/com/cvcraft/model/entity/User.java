package com.cvcraft.model.entity;

import com.cvcraft.model.enums.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    // null for Google OAuth users
    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    private String name;

    // Google OAuth
    @Column(unique = true)
    private String googleId;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionPlan plan = SubscriptionPlan.FREE;

    // Stripe
    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private LocalDateTime subscriptionExpiresAt;

    // PDF download hakkı (tek seferlik ödeme için)
    @Builder.Default
    private Integer pdfCredits = 0;

    @Builder.Default
    private Boolean emailVerified = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Cv> cvs = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean isPremium() {
        return plan == SubscriptionPlan.PREMIUM;
    }

    public boolean canDownloadPdf() {
        return isPremium() || pdfCredits > 0;
    }
}
