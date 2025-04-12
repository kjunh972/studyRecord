package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.CommentDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "댓글 API", description = "공유된 학습 기록의 댓글 관련 API")
@RestController
@RequestMapping("/api/shared_studyrecord/{recordId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 작성", description = "공유된 학습 기록에 댓글을 작성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "학습 기록을 찾을 수 없음")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto.Response> createComment(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long recordId,
            @RequestBody CommentDto.Request request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(commentService.createComment(recordId, userDetails.getId(), request));
    }

    @Operation(summary = "댓글 목록 조회", description = "공유된 학습 기록의 댓글 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "404", description = "학습 기록을 찾을 수 없음")
    })
    @GetMapping
    public ResponseEntity<Page<CommentDto.Response>> getComments(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long recordId,
            Pageable pageable) {
        return ResponseEntity.ok(commentService.getComments(recordId, pageable));
    }

    @Operation(summary = "댓글 수정", description = "작성한 댓글을 수정합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    })
    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto.Response> updateComment(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long recordId,
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @RequestBody CommentDto.Request request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(commentService.updateComment(commentId, userDetails.getId(), request));
    }

    @Operation(summary = "댓글 삭제", description = "작성한 댓글을 삭제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    })
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long recordId,
            @Parameter(description = "댓글 ID") @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        commentService.deleteComment(commentId, userDetails.getId());
        return ResponseEntity.ok().build();
    }
} 