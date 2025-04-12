package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.ChallengeParticipant;
import com.studyrecord.backend.entity.ChallengeParticipant.ParticipantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChallengeParticipantRepository extends JpaRepository<ChallengeParticipant, Long> {

    @Query("SELECT p FROM ChallengeParticipant p WHERE p.challenge.id = :challengeId AND p.user.id = :userId")
    Optional<ChallengeParticipant> findByChallengeIdAndUserId(
            @Param("challengeId") Long challengeId, 
            @Param("userId") Long userId);

    @Query("SELECT p FROM ChallengeParticipant p WHERE p.challenge.id = :challengeId")
    List<ChallengeParticipant> findAllByChallengeId(@Param("challengeId") Long challengeId);

    @Query("SELECT p FROM ChallengeParticipant p WHERE p.challenge.id = :challengeId AND p.status = :status")
    List<ChallengeParticipant> findByChallengeIdAndStatus(
            @Param("challengeId") Long challengeId, 
            @Param("status") ParticipantStatus status);

    @Query("SELECT COUNT(p) FROM ChallengeParticipant p WHERE p.challenge.id = :challengeId")
    Integer countParticipants(@Param("challengeId") Long challengeId);

    @Query("SELECT COUNT(p) FROM ChallengeParticipant p WHERE p.challenge.id = :challengeId AND p.status = :status")
    Integer countParticipantsByStatus(
            @Param("challengeId") Long challengeId, 
            @Param("status") ParticipantStatus status);

    @Query("SELECT p FROM ChallengeParticipant p WHERE p.user.id = :userId")
    Page<ChallengeParticipant> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM ChallengeParticipant p WHERE p.user.id = :userId AND p.status = :status")
    Page<ChallengeParticipant> findByUserIdAndStatus(
            @Param("userId") Long userId, 
            @Param("status") ParticipantStatus status, 
            Pageable pageable);

    @Query("SELECT p FROM ChallengeParticipant p WHERE p.user.id = :userId AND p.challenge.status = 'ACTIVE'")
    List<ChallengeParticipant> findActiveChallengesByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM ChallengeParticipant p WHERE " +
            "p.challenge.id = :challengeId " +
            "ORDER BY p.completedStudyTime DESC, p.completedStudyDays DESC")
    Page<ChallengeParticipant> findTopParticipantsByChallenge(
            @Param("challengeId") Long challengeId, 
            Pageable pageable);

    @Query("SELECT SUM(p.completedStudyTime) FROM ChallengeParticipant p WHERE " +
            "p.user.id = :userId AND p.lastActivity >= :since")
    Long getTotalStudyTimeInChallengesSince(
            @Param("userId") Long userId, 
            @Param("since") LocalDateTime since);

    boolean existsByChallengeIdAndUserId(Long challengeId, Long userId);
} 