package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.SharedStudyRecordDto;
import com.studyrecord.backend.dto.ShareRequest;
import com.studyrecord.backend.dto.TagStatDto;
import com.studyrecord.backend.service.SharedStudyRecordService;
import com.studyrecord.backend.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;

@Tag(name = "공유된 학습 기록 API", description = "공유된 학습 기록 관련 API")
@RestController
@RequestMapping("/api/shared_studyrecord")
@RequiredArgsConstructor
public class SharedStudyRecordController {
    private final SharedStudyRecordService sharedStudyRecordService;

    @Operation(summary = "공개된 학습 기록 목록 조회", description = "GET /api/shared_studyrecord/public")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/public")
    public ResponseEntity<List<SharedStudyRecordDto>> getPublicSharedStudyRecords() {
        return ResponseEntity.ok(sharedStudyRecordService.getPublicSharedStudyRecords());
    }

    @Operation(summary = "공개된 학습 기록 페이지 조회", description = "GET /api/shared_studyrecord/public/page")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/public/page")
    public ResponseEntity<Page<SharedStudyRecordDto>> getPublicSharedStudyRecordsPage(Pageable pageable) {
        return ResponseEntity.ok(sharedStudyRecordService.getPublicSharedStudyRecords(pageable));
    }

    @Operation(summary = "공개된 학습 기록 검색", description = "GET /api/shared_studyrecord/search")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<SharedStudyRecordDto>> searchPublicSharedStudyRecords(
            @Parameter(description = "검색어") @RequestParam String keyword,
            @Parameter(description = "태그 목록 (쉼표로 구분)") @RequestParam(required = false) String tags,
            Pageable pageable) {
        List<String> tagList = tags != null ? 
            Arrays.asList(tags.split(",")).stream().map(String::trim).collect(Collectors.toList()) : 
            null;
        return ResponseEntity.ok(sharedStudyRecordService.searchPublicSharedStudyRecords(keyword, tagList, pageable));
    }

    @Operation(summary = "특정 사용자의 공개된 학습 기록 목록 조회", description = "GET /api/shared_studyrecord/users/{userId}/public")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/users/{userId}/public")
    public ResponseEntity<List<SharedStudyRecordDto>> getUserPublicSharedStudyRecords(
            @Parameter(description = "사용자 ID") @PathVariable Long userId) {
        return ResponseEntity.ok(sharedStudyRecordService.getPublicSharedStudyRecordsByUserId(userId));
    }

    @Operation(summary = "내가 공유한 학습 기록 목록 조회", description = "GET /api/shared_studyrecord/my")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SharedStudyRecordDto>> getMySharedStudyRecords(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(sharedStudyRecordService.getSharedStudyRecordsByUserId(userDetails.getId()));
    }

    @Operation(summary = "공유된 학습 기록 상세 조회", description = "GET /api/shared_studyrecord/{id}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "404", description = "찾을 수 없음")
    })
    @GetMapping("/{id}")
    public ResponseEntity<SharedStudyRecordDto> getSharedStudyRecord(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long id) {
        return ResponseEntity.ok(sharedStudyRecordService.getSharedStudyRecord(id));
    }

    @Operation(summary = "학습 기록 공유", description = "POST /api/shared_studyrecord/{studyRecordId}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @PostMapping("/{studyRecordId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SharedStudyRecordDto> shareStudyRecord(
            @Parameter(description = "학습 기록 ID") @PathVariable Long studyRecordId,
            @RequestBody ShareRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }

        // 학습 기록의 소유자 확인은 서비스 레이어에서 수행
        return ResponseEntity.ok(sharedStudyRecordService.shareStudyRecord(studyRecordId, request, userDetails.getId()));
    }

    @Operation(summary = "공유된 학습 기록 수정", description = "PUT /api/shared_studyrecord/{id}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "찾을 수 없음")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SharedStudyRecordDto> updateSharedStudyRecord(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long id,
            @RequestBody ShareRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }

        return ResponseEntity.ok(sharedStudyRecordService.updateSharedStudyRecord(id, request, userDetails.getId()));
    }

    @Operation(summary = "공유된 학습 기록 삭제", description = "DELETE /api/shared_studyrecord/{id}")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteSharedStudyRecord(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }

        sharedStudyRecordService.deleteSharedStudyRecord(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "인기 태그 목록 조회", description = "GET /api/shared_studyrecord/tags/popular")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/tags/popular")
    public ResponseEntity<List<String>> getPopularTags(
            @Parameter(description = "조회할 태그 수") @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(sharedStudyRecordService.getPopularTags(limit));
    }

    @Operation(summary = "태그 자동 완성", description = "GET /api/shared_studyrecord/tags/autocomplete")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/tags/autocomplete")
    public ResponseEntity<List<String>> autocompleteTags(
            @Parameter(description = "태그 검색어") @RequestParam String query,
            @Parameter(description = "조회할 태그 수") @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(sharedStudyRecordService.autocompleteTags(query, limit));
    }

    @Operation(summary = "태그 통계 조회", description = "GET /api/shared_studyrecord/tags/stats")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/tags/stats")
    public ResponseEntity<List<TagStatDto>> getTagStats() {
        return ResponseEntity.ok(sharedStudyRecordService.getTagStats());
    }

    @Operation(summary = "공유된 학습 기록 좋아요", description = "POST /api/shared_studyrecord/{id}/like")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "찾을 수 없음")
    })
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SharedStudyRecordDto> likeSharedStudyRecord(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(sharedStudyRecordService.likeSharedStudyRecord(id, userDetails.getId()));
    }

    @Operation(summary = "공유된 학습 기록 좋아요 취소", description = "DELETE /api/shared_studyrecord/{id}/like")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "찾을 수 없음")
    })
    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SharedStudyRecordDto> unlikeSharedStudyRecord(
            @Parameter(description = "공유된 학습 기록 ID") @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(sharedStudyRecordService.unlikeSharedStudyRecord(id, userDetails.getId()));
    }

    @Operation(summary = "내가 좋아요한 학습 기록 목록 조회", description = "GET /api/shared_studyrecord/my/likes")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/my/likes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SharedStudyRecordDto>> getLikedStudyRecords(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(sharedStudyRecordService.getLikedStudyRecords(userDetails.getId()));
    }

    @Operation(summary = "인기 학습 기록 목록 조회", description = "GET /api/shared_studyrecord/popular")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/popular")
    public ResponseEntity<Page<SharedStudyRecordDto>> getPopularStudyRecords(Pageable pageable) {
        return ResponseEntity.ok(sharedStudyRecordService.getPopularStudyRecords(pageable));
    }

    @Operation(summary = "태그별 인기 학습 기록 목록 조회", description = "GET /api/shared_studyrecord/popular/by-tag")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/popular/by-tag")
    public ResponseEntity<Page<SharedStudyRecordDto>> getPopularStudyRecordsByTag(
            @Parameter(description = "태그") @RequestParam String tag,
            Pageable pageable) {
        return ResponseEntity.ok(sharedStudyRecordService.getPopularStudyRecordsByTag(tag, pageable));
    }
} 