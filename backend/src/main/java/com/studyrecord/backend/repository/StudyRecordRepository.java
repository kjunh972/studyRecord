package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudyRecordRepository extends JpaRepository<StudyRecord, Long> {
    List<StudyRecord> findAllByOrderByCreatedAtDesc();
    List<StudyRecord> findAllByUserUsername(String username);
    void deleteAllByUserId(Long userId);
    List<StudyRecord> findByUser(User user);
    List<StudyRecord> findByUserId(Long userId);
    Page<StudyRecord> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT sr FROM StudyRecord sr WHERE sr.user.id = :userId AND :tag MEMBER OF sr.tags")
    List<StudyRecord> findByUserIdAndTagsContaining(@Param("userId") Long userId, @Param("tag") String tag);

    @Query("SELECT DISTINCT t FROM StudyRecord sr JOIN sr.tags t WHERE sr.user.id = :userId GROUP BY t ORDER BY COUNT(t) DESC")
    List<String> findPopularTagsByUserId(@Param("userId") Long userId);

    @Query("SELECT sr FROM StudyRecord sr WHERE sr.user.id = :userId AND sr.createdAt BETWEEN :startDate AND :endDate")
    List<StudyRecord> findByUserIdAndCreatedAtBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(sr.studyTime) FROM StudyRecord sr WHERE sr.user.id = :userId AND sr.createdAt BETWEEN :startDate AND :endDate")
    Long getTotalStudyTimeForPeriod(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(sr) FROM StudyRecord sr WHERE sr.user.id = :userId AND sr.createdAt BETWEEN :startDate AND :endDate")
    Long getRecordCountForPeriod(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DATE(sr.createdAt) as date, SUM(sr.studyTime) as totalTime " +
           "FROM StudyRecord sr " +
           "WHERE sr.user.id = :userId AND sr.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(sr.createdAt)")
    List<Object[]> getDailyStudyTime(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT MONTH(sr.createdAt) as month, SUM(sr.studyTime) as totalTime " +
           "FROM StudyRecord sr " +
           "WHERE sr.user.id = :userId AND YEAR(sr.createdAt) = :year " +
           "GROUP BY MONTH(sr.createdAt)")
    List<Object[]> getMonthlyStudyTime(
            @Param("userId") Long userId,
            @Param("year") int year);

    @Query("SELECT t, COUNT(t) as count " +
           "FROM StudyRecord sr JOIN sr.tags t " +
           "WHERE sr.user.id = :userId AND sr.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY t " +
           "ORDER BY count DESC")
    List<Object[]> getTagStatisticsForPeriod(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT MIN(sr.createdAt) FROM StudyRecord sr WHERE sr.user.id = :userId")
    LocalDateTime getFirstRecordDate(@Param("userId") Long userId);

    @Query("SELECT MAX(sr.createdAt) FROM StudyRecord sr WHERE sr.user.id = :userId")
    LocalDateTime getLastRecordDate(@Param("userId") Long userId);

    @Query("SELECT AVG(sr.studyTime) FROM StudyRecord sr WHERE sr.user.id = :userId")
    Double getAverageStudyTime(@Param("userId") Long userId);

    @Query("SELECT sr FROM StudyRecord sr WHERE sr.user.id = :userId AND " +
           "(LOWER(sr.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sr.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<StudyRecord> findByUserIdAndKeyword(
            @Param("userId") Long userId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT sr FROM StudyRecord sr WHERE sr.user.id = :userId AND " +
           "(LOWER(sr.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(sr.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           ":tag MEMBER OF sr.tags")
    Page<StudyRecord> findByUserIdAndKeywordAndTag(
            @Param("userId") Long userId,
            @Param("keyword") String keyword,
            @Param("tag") String tag,
            Pageable pageable);

    List<StudyRecord> findByUserIdOrderByCreatedAtDesc(Long userId);
} 