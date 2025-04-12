package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.StudyTimer;
import com.studyrecord.backend.entity.StudyTimer.TimerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudyTimerRepository extends JpaRepository<StudyTimer, Long> {

    @Query("SELECT t FROM StudyTimer t WHERE t.user.id = :userId AND t.status = :status")
    List<StudyTimer> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TimerStatus status);

    @Query("SELECT t FROM StudyTimer t WHERE t.user.id = :userId AND t.status = 'RUNNING'")
    Optional<StudyTimer> findRunningTimerByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM StudyTimer t WHERE t.user.id = :userId")
    List<StudyTimer> findByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.accumulatedTime) FROM StudyTimer t WHERE t.user.id = :userId AND t.createdAt >= :startTime AND t.createdAt <= :endTime")
    Long sumAccumulatedTimeByUserIdAndTimeRange(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(t) FROM StudyTimer t WHERE t.user.id = :userId AND t.createdAt >= :startTime AND t.createdAt <= :endTime")
    Integer countTimersByUserIdAndTimeRange(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT t FROM StudyTimer t WHERE t.user.id = :userId AND t.status <> 'STOPPED' ORDER BY t.createdAt DESC")
    List<StudyTimer> findActiveTimersByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT tags FROM study_timers WHERE user_id = :userId AND tags IS NOT NULL GROUP BY tags ORDER BY COUNT(tags) DESC LIMIT :limit", nativeQuery = true)
    List<String> findMostUsedTags(@Param("userId") Long userId, @Param("limit") int limit);
} 