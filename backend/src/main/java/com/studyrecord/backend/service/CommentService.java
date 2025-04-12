package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.CommentDto;
import com.studyrecord.backend.entity.Comment;
import com.studyrecord.backend.entity.SharedStudyRecord;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.repository.CommentRepository;
import com.studyrecord.backend.repository.SharedStudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final SharedStudyRecordRepository sharedStudyRecordRepository;
    private final UserRepository userRepository;
    
    /**
     * 댓글 생성
     * @param recordId 공유된 학습 기록 ID
     * @param userId 사용자 ID
     * @param request 댓글 정보
     * @return 생성된 댓글 정보
     */
    @Transactional
    public CommentDto.Response createComment(Long recordId, Long userId, CommentDto.Request request) {
        // 사용자 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        // 공유된 학습 기록 확인
        SharedStudyRecord record = sharedStudyRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다."));
        
        // 댓글 생성
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setSharedStudyRecord(record);
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setModifiedAt(LocalDateTime.now());
        
        Comment savedComment = commentRepository.save(comment);
        return CommentDto.Response.from(savedComment);
    }
    
    /**
     * 댓글 목록 조회
     * @param recordId 공유된 학습 기록 ID
     * @param pageable 페이징 정보
     * @return 댓글 목록
     */
    public Page<CommentDto.Response> getComments(Long recordId, Pageable pageable) {
        // 공유된 학습 기록 존재 여부 확인
        if (!sharedStudyRecordRepository.existsById(recordId)) {
            throw new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다.");
        }
        
        // 댓글 목록 조회 (최신순)
        return commentRepository.findBySharedStudyRecordIdOrderByCreatedAtDesc(recordId, pageable)
                .map(CommentDto.Response::from);
    }
    
    /**
     * 댓글 수정
     * @param commentId 댓글 ID
     * @param userId 사용자 ID
     * @param request 수정할 댓글 정보
     * @return 수정된 댓글 정보
     */
    @Transactional
    public CommentDto.Response updateComment(Long commentId, Long userId, CommentDto.Request request) {
        // 댓글 확인
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        
        // 댓글 작성자 확인
        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("댓글을 수정할 권한이 없습니다.");
        }
        
        // 삭제된 댓글인지 확인
        if (comment.isDeleted()) {
            throw new IllegalArgumentException("삭제된 댓글은 수정할 수 없습니다.");
        }
        
        // 댓글 내용 수정
        comment.setContent(request.getContent());
        comment.setModifiedAt(LocalDateTime.now());
        
        return CommentDto.Response.from(comment);
    }
    
    /**
     * 댓글 삭제
     * @param commentId 댓글 ID
     * @param userId 사용자 ID
     */
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        // 댓글 확인
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        
        // 댓글 작성자 확인
        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("댓글을 삭제할 권한이 없습니다.");
        }
        
        // 논리적 삭제 (soft delete)
        comment.setDeleted(true);
        comment.setModifiedAt(LocalDateTime.now());
    }
} 