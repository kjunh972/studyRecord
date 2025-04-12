package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyCalendarDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyCalendarService;
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

import java.time.LocalDate;

@Tag(name = "학습 캘린더 API", description = "학습 캘린더 관련 API")
@RestController
@RequestMapping("/api/users/{userId}/study_calendar")
@RequiredArgsConstructor
public class StudyCalendarController {

    private final StudyCalendarService studyCalendarService;

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

    @Operation(summary = "월간 학습 기록 조회", description = "GET /api/users/{userId}/study_calendar/monthly")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @GetMapping("/monthly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyCalendarDto.MonthlyCalendar> getMonthlyCalendar(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "연도") @RequestParam(required = false) Integer year,
            @Parameter(description = "월") @RequestParam(required = false) Integer month,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        
        // 연도와 월이 제공되지 않은 경우 현재 연월 사용
        LocalDate now = LocalDate.now();
        int targetYear = (year != null) ? year : now.getYear();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        
        StudyCalendarDto.MonthlyCalendar calendar = 
                studyCalendarService.getMonthlyCalendar(userDetails.getId(), targetYear, targetMonth);
        
        return ResponseEntity.ok(calendar);
    }

    @Operation(summary = "연간 학습 달력 조회", description = "특정 연도의 학습 달력을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @GetMapping("/year")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyCalendarDto.YearlyCalendar> getYearlyCalendar(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "연도") @RequestParam(required = false) Integer year,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        
        // 연도가 제공되지 않은 경우 현재 연도 사용
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        
        StudyCalendarDto.YearlyCalendar calendar = 
                studyCalendarService.getYearlyCalendar(userDetails.getId(), targetYear);
        
        return ResponseEntity.ok(calendar);
    }
} 