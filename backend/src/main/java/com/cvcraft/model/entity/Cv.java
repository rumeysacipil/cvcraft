package com.cvcraft.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cv {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title; // "Benim CV'im", kullanıcının verdiği isim

    @Column(nullable = false)
    @Builder.Default
    private String theme = "minimal"; // minimal, modern, executive, bold

    // CV verisini JSON olarak sakla — esnek yapı
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> data;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(unique = true)
    private String shareToken;

    @Column(name = "is_public", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isPublic = false;
}
