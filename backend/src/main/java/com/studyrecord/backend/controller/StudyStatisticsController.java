package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyStatisticsDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "학습 통계", description = "학습 통계 관련 API")
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StudyStatisticsController {

    private final StudyRecordService studyRecordService;

    private void validateAuthentication(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
    }

    private void validateAuthorization(Long userId, CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 통계 정보에 접근할 수 없습니다.");
        }
    }

    @Operation(summary = "일일 학습 통계", description = "특정 날짜의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/daily")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.DailyStats> getDailyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "날짜") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getDailyStats(userId, date));
    }

    @Operation(summary = "주간 학습 통계", description = "특정 주의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/weekly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.WeeklyStats> getWeeklyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "시작 날짜") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getWeeklyStats(userId, startDate));
    }

    @Operation(summary = "월간 학습 통계", description = "특정 월의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/monthly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.MonthlyStats> getMonthlyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "연도") @RequestParam int year,
            @Parameter(description = "월(1-12)") @RequestParam int month,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getMonthlyStats(userId, year, month));
    }

    @Operation(summary = "연간 학습 통계", description = "특정 연도의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/yearly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.YearlyStats> getYearlyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "연도") @RequestParam int year,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getYearlyStats(userId, year));
    }

    @Operation(summary = "전체 학습 통계", description = "전체 기간에 대한 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/overall")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.OverallStats> getOverallStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getOverallStats(userId));
    }

    @Operation(summary = "연속 학습 정보", description = "사용자의 연속 학습 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/streak")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.StudyStreak> getStudyStreak(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getStudyStreak(userId));
    }

    @Operation(summary = "태그별 학습 통계", description = "특정 태그에 대한 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/tags/{tag}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.TagStats> getTagStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "태그") @PathVariable String tag,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getTagStats(userId, tag));
    }

    @Operation(summary = "기간별 학습 통계 비교", description = "두 기간의 학습 통계를 비교합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @GetMapping("/users/{userId}/comparison")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.ComparisonStats> getComparisonStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "이전 기간 시작") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate prevStart,
            @Parameter(description = "이전 기간 종료") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate prevEnd,
            @Parameter(description = "현재 기간 시작") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate currentStart,
            @Parameter(description = "현재 기간 종료") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate currentEnd,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getComparisonStats(userId, prevStart, prevEnd, currentStart, currentEnd));
    }
} 