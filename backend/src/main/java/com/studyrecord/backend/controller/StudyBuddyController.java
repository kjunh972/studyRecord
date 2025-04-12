package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyBuddyDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyBuddyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "학습 동료", description = "학습 동료 관련 API")
@RestController
@RequestMapping("/api/users/{userId}/buddies")
@RequiredArgsConstructor
public class StudyBuddyController {

    private final StudyBuddyService studyBuddyService;

    private void validateAuthentication(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
    }

    private void validateAuthorization(Long userId, CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 리소스에 접근할 수 없습니다.");
        }
    }

    @Operation(summary = "학습 동료 목록 조회", description = "사용자의 학습 동료 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "사용자 없음")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyBuddyDto.BuddyListResponse> getBuddies(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyBuddyService.getBuddies(userDetails.getId()));
    }

    @Operation(summary = "학습 동료 요청 보내기", description = "다른 사용자에게 학습 동료 요청을 보냅니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "사용자 없음")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyBuddyDto.Response> sendBuddyRequest(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "학습 동료 요청 정보") @RequestBody StudyBuddyDto.Request request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyBuddyService.sendBuddyRequest(userDetails.getId(), request));
    }

    @Operation(summary = "학습 동료 요청 수락", description = "받은 학습 동료 요청을 수락합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "요청 없음")
    })
    @PatchMapping("/requests/{requestId}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyBuddyDto.Response> acceptBuddyRequest(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "요청 ID") @PathVariable Long requestId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyBuddyService.acceptBuddyRequest(userDetails.getId(), requestId));
    }

    @Operation(summary = "학습 동료 요청 거절", description = "받은 학습 동료 요청을 거절합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "요청 없음")
    })
    @PatchMapping("/requests/{requestId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyBuddyDto.Response> rejectBuddyRequest(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "요청 ID") @PathVariable Long requestId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyBuddyService.rejectBuddyRequest(userDetails.getId(), requestId));
    }

    @Operation(summary = "학습 동료 삭제", description = "학습 동료 관계를 삭제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "동료 관계 없음")
    })
    @DeleteMapping("/{buddyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeBuddy(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "동료 ID") @PathVariable Long buddyId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        studyBuddyService.removeBuddy(userDetails.getId(), buddyId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "받은 학습 동료 요청 목록", description = "받은 학습 동료 요청 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "사용자 없음")
    })
    @GetMapping("/requests/received")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyBuddyDto.Response>> getReceivedRequests(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyBuddyService.getReceivedRequests(userDetails.getId()));
    }

    @Operation(summary = "보낸 학습 동료 요청 목록", description = "보낸 학습 동료 요청 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "사용자 없음")
    })
    @GetMapping("/requests/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyBuddyDto.Response>> getSentRequests(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyBuddyService.getSentRequests(userDetails.getId()));
    }
} 