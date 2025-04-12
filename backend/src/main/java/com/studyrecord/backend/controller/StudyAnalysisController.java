package com.studyrecord.backend.controller;

import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyAnalysisService;
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

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@Tag(name = "학습 분석 API", description = "학습 분석 관련 API")
@RestController
@RequestMapping("/api/users/{userId}/study_analysis")
@RequiredArgsConstructor
public class StudyAnalysisController {

    private final StudyAnalysisService studyAnalysisService;

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

    @Operation(summary = "최적 학습 시간대 분석", description = "사용자의 최적 학습 시간대를 분석합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/best-hours")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<Integer, Integer>> getBestStudyHours(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyAnalysisService.analyzeBestStudyHours(userDetails.getId()));
    }

    @Operation(summary = "최적 학습 요일 분석", description = "사용자의 최적 학습 요일을 분석합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/best-days")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<DayOfWeek, Double>> getBestStudyDays(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyAnalysisService.analyzeBestStudyDays(userDetails.getId()));
    }

    @Operation(summary = "학습 추천", description = "사용자의 학습 패턴 기반 추천 사항을 제공합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/recommendations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyAnalysisService.StudyRecommendation>> getStudyRecommendations(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyAnalysisService.generateStudyRecommendations(userDetails.getId()));
    }

    @Operation(summary = "학습 연속성 분석", description = "사용자의 학습 연속성을 분석합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/streak")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyAnalysisService.StudyStreakInfo> getStudyStreak(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyAnalysisService.analyzeStudyStreak(userDetails.getId()));
    }
} 