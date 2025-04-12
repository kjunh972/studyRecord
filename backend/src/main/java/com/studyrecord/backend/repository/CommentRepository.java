package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @Query("SELECT c FROM Comment c WHERE c.sharedStudyRecord.id = :recordId AND c.parent IS NULL ORDER BY c.createdAt DESC")
    Page<Comment> findParentCommentsByRecordId(@Param("recordId") Long recordId, Pageable pageable);
    
    @Query("SELECT c FROM Comment c WHERE c.parent.id = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);
    
    List<Comment> findBySharedStudyRecordIdAndParentIsNull(Long recordId);
    
    List<Comment> findByUserId(Long userId);

    Page<Comment> findBySharedStudyRecordIdOrderByCreatedAtDesc(Long recordId, Pageable pageable);
} 