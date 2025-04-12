package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.SharedStudyRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedStudyRecordRepository extends JpaRepository<SharedStudyRecord, Long> {
    Page<SharedStudyRecord> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
    List<SharedStudyRecord> findByIsPublicTrue();
    List<SharedStudyRecord> findByUserId(Long userId);
    List<SharedStudyRecord> findByUserIdAndIsPublicTrue(Long userId);

    @Query("SELECT DISTINCT s FROM SharedStudyRecord s JOIN s.tags t " +
           "WHERE s.title LIKE %:keyword% AND t IN :tags AND s.isPublic = true")
    Page<SharedStudyRecord> findByTitleContainingAndTagsInAndIsPublicTrue(
            @Param("keyword") String keyword,
            @Param("tags") List<String> tags,
            Pageable pageable);

    Page<SharedStudyRecord> findByTitleContainingAndIsPublicTrue(String title, Pageable pageable);

    @Query("SELECT t, COUNT(t) as cnt FROM SharedStudyRecord s JOIN s.tags t " +
           "WHERE s.isPublic = true GROUP BY t ORDER BY cnt DESC")
    List<Object[]> findTagsWithCount();

    @Query(value = "SELECT t FROM SharedStudyRecord s JOIN s.tags t " +
           "WHERE s.isPublic = true GROUP BY t ORDER BY COUNT(t) DESC LIMIT :limit",
           nativeQuery = true)
    List<String> findPopularTags(@Param("limit") int limit);

    @Query(value = "SELECT DISTINCT t FROM SharedStudyRecord s JOIN s.tags t " +
           "WHERE s.isPublic = true AND LOWER(t) LIKE LOWER(CONCAT(:query, '%')) " +
           "GROUP BY t ORDER BY COUNT(t) DESC LIMIT :limit",
           nativeQuery = true)
    List<String> findTagsByPrefix(@Param("query") String query, @Param("limit") int limit);

    @Query("SELECT sr FROM SharedStudyRecord sr JOIN sr.likedUsers u WHERE u.id = :userId AND sr.isPublic = true")
    List<SharedStudyRecord> findLikedRecordsByUserId(@Param("userId") Long userId);

    Page<SharedStudyRecord> findByIsPublicTrueOrderByLikeCountDesc(Pageable pageable);

    @Query("SELECT sr FROM SharedStudyRecord sr WHERE sr.isPublic = true AND :tag MEMBER OF sr.tags ORDER BY sr.likeCount DESC")
    Page<SharedStudyRecord> findPopularRecordsByTag(@Param("tag") String tag, Pageable pageable);
} 