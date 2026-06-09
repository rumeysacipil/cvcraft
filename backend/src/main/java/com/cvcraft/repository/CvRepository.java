package com.cvcraft.repository;

import com.cvcraft.model.entity.Cv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvRepository extends JpaRepository<Cv, Long> {
    List<Cv> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<Cv> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
    Optional<Cv> findByShareTokenAndIsPublicTrue(String shareToken);
}
