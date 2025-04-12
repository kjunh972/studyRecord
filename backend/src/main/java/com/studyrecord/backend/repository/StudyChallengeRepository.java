package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.StudyChallenge;
import com.studyrecord.backend.entity.StudyChallenge.ChallengeStatus;
import com.studyrecord.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudyChallengeRepository extends JpaRepository<StudyChallenge, Long> {
    
    // 사용자가 생성한 챌린지 목록 조회
    List<StudyChallenge> findByCreator(User creator);
    Page<StudyChallenge> findByCreator(User creator, Pageable pageable);
    
    // 태그로 챌린지 검색
    @Query("SELECT sc FROM StudyChallenge sc JOIN sc.tags t WHERE t = :tag")
    Page<StudyChallenge> findByTag(@Param("tag") String tag, Pageable pageable);
    
    // 현재 활성화된 챌린지 목록 조회
    @Query("SELECT sc FROM StudyChallenge sc WHERE sc.status = 'ACTIVE' AND sc.startDate <= :now AND sc.endDate >= :now")
    Page<StudyChallenge> findActiveStudyChallenges(@Param("now") LocalDate now, Pageable pageable);
    
    // 곧 시작될 챌린지 목록 조회
    @Query("SELECT sc FROM StudyChallenge sc WHERE sc.status = 'SCHEDULED' AND sc.startDate > :now AND sc.startDate <= :future")
    Page<StudyChallenge> findUpcomingStudyChallenges(@Param("now") LocalDate now, @Param("future") LocalDate future, Pageable pageable);
    
    // 사용자가 참여 중인 챌린지 목록 조회
    @Query("SELECT DISTINCT sc FROM StudyChallenge sc JOIN sc.participants p WHERE p.user = :user AND p.status = 'JOINED'")
    List<StudyChallenge> findParticipatingChallenges(@Param("user") User user);
    
    // 종료된 챌린지 중 완료율이 높은 순서로 조회
    @Query("SELECT sc FROM StudyChallenge sc WHERE sc.status = 'COMPLETED' " +
           "ORDER BY (SELECT COUNT(p) FROM ChallengeParticipant p WHERE p.challenge = sc AND p.status = 'COMPLETED') DESC")
    Page<StudyChallenge> findCompletedChallengesBySuccessRate(Pageable pageable);

    @Query("SELECT c FROM StudyChallenge c LEFT JOIN FETCH c.creator WHERE c.id = :id")
    Optional<StudyChallenge> findByIdWithCreator(@Param("id") Long id);

    @Query("SELECT c FROM StudyChallenge c WHERE c.creator.id = :userId")
    Page<StudyChallenge> findByCreatorId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT DISTINCT c FROM StudyChallenge c JOIN c.participants p WHERE p.user.id = :userId")
    Page<StudyChallenge> findByParticipantId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM StudyChallenge c WHERE c.status = :status")
    Page<StudyChallenge> findByStatus(@Param("status") ChallengeStatus status, Pageable pageable);

    @Query("SELECT c FROM StudyChallenge c WHERE " +
            "c.status = 'ACTIVE' AND " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<StudyChallenge> searchActiveChallenges(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT c FROM StudyChallenge c JOIN c.tags t " +
            "WHERE c.status = 'ACTIVE' AND LOWER(t) = LOWER(:tag)")
    Page<StudyChallenge> findActiveByTag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT c FROM StudyChallenge c WHERE c.status = 'SCHEDULED' AND c.startDate = :today")
    List<StudyChallenge> findChallengesToStart(@Param("today") LocalDate today);

    @Query("SELECT c FROM StudyChallenge c WHERE c.status = 'ACTIVE' AND c.endDate = :today")
    List<StudyChallenge> findChallengesToComplete(@Param("today") LocalDate today);

    @Query("SELECT COUNT(c) > 0 FROM StudyChallenge c JOIN c.participants p " +
            "WHERE c.id = :challengeId AND p.user.id = :userId")
    boolean existsByIdAndParticipantId(@Param("challengeId") Long challengeId, @Param("userId") Long userId);

    @Query("SELECT p.user FROM StudyChallenge c JOIN c.participants p " +
            "WHERE c.id = :challengeId AND p.status = 'JOINED'")
    List<User> findActiveParticipantsByChallenge(@Param("challengeId") Long challengeId);

    @Query("SELECT c FROM StudyChallenge c " +
            "WHERE c.status = 'ACTIVE' " +
            "AND (SELECT COUNT(p) FROM c.participants p) < :limit")
    Page<StudyChallenge> findActiveWithParticipantsLessThan(@Param("limit") int limit, Pageable pageable);

    @Query(value = "SELECT DISTINCT t FROM StudyChallenge c JOIN c.tags t " +
            "WHERE c.status = 'ACTIVE' " +
            "GROUP BY t ORDER BY COUNT(t) DESC")
    List<String> findPopularChallengeTags(Pageable pageable);
} 