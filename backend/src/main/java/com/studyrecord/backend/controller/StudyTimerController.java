package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyRecordDto;
import com.studyrecord.backend.dto.StudyTimerDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyTimerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "학습 타이머", description = "학습 타이머 관련 API")
@RestController
@RequestMapping("/api/timers")
@RequiredArgsConstructor
public class StudyTimerController {

    private final StudyTimerService studyTimerService;

    private void validateAuthentication(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
    }

    @Operation(summary = "타이머 생성", description = "새로운 학습 타이머를 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyTimerDto.Response> createTimer(
            @Valid @RequestBody StudyTimerDto.Request request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.createTimer(userDetails.getId(), request));
    }

    @Operation(summary = "타이머 상세 조회", description = "특정 타이머의 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @GetMapping("/{timerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyTimerDto.Response> getTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.getTimer(userDetails.getId(), timerId));
    }

    @Operation(summary = "사용자 타이머 목록 조회", description = "사용자의 모든 타이머 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyTimerDto.Response>> getUserTimers(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.getUserTimers(userDetails.getId()));
    }

    @Operation(summary = "활성 타이머 목록 조회", description = "사용자의 활성 상태 타이머(실행 중 또는 일시정지)를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyTimerDto.Response>> getActiveTimers(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.getActiveTimers(userDetails.getId()));
    }

    @Operation(summary = "타이머 수정", description = "타이머의 정보를 수정합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @PutMapping("/{timerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyTimerDto.Response> updateTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @Valid @RequestBody StudyTimerDto.Request request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.updateTimer(userDetails.getId(), timerId, request));
    }

    @Operation(summary = "타이머 삭제", description = "타이머를 삭제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @DeleteMapping("/{timerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        studyTimerService.deleteTimer(userDetails.getId(), timerId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "타이머 시작", description = "타이머를 시작합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (이미 실행 중인 타이머가 있음)"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @PostMapping("/{timerId}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyTimerDto.Response> startTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.startTimer(userDetails.getId(), timerId));
    }

    @Operation(summary = "타이머 일시정지", description = "실행 중인 타이머를 일시 정지합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (타이머가 실행 중이 아님)"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @PostMapping("/{timerId}/pause")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyTimerDto.Response> pauseTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.pauseTimer(userDetails.getId(), timerId));
    }

    @Operation(summary = "타이머 재개", description = "일시 정지된 타이머를 재개합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (이미 실행 중인 타이머가 있거나 타이머가 일시 정지 상태가 아님)"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @PostMapping("/{timerId}/resume")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyTimerDto.Response> resumeTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.resumeTimer(userDetails.getId(), timerId));
    }

    @Operation(summary = "타이머 종료", description = "타이머를 종료하고 학습 기록을 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (타이머가 이미 종료되었거나 누적 시간이 0)"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @PostMapping("/{timerId}/stop")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordDto.Response> stopTimer(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.stopTimer(userDetails.getId(), timerId));
    }

    @Operation(summary = "기간별 총 학습 시간 조회", description = "특정 기간 동안의 총 학습 시간을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/total-time")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getTotalStudyTime(
            @Parameter(description = "시작 시간") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @Parameter(description = "종료 시간") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.getTotalStudyTime(userDetails.getId(), startTime, endTime));
    }

    @Operation(summary = "가장 많이 사용된 태그 조회", description = "가장 많이 사용된 태그 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/popular-tags")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getMostUsedTags(
            @Parameter(description = "조회할 태그 수") @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyTimerService.getMostUsedTags(userDetails.getId(), limit));
    }

    @Operation(summary = "타이머 액션 수행", description = "타이머에 대한 액션(시작, 일시정지, 재개, 종료)을 수행합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "타이머 없음")
    })
    @PostMapping("/{timerId}/action")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> performTimerAction(
            @Parameter(description = "타이머 ID") @PathVariable Long timerId,
            @RequestBody StudyTimerDto.TimerAction action,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        
        switch (action.getAction().toLowerCase()) {
            case "start":
                return ResponseEntity.ok(studyTimerService.startTimer(userDetails.getId(), timerId));
            case "pause":
                return ResponseEntity.ok(studyTimerService.pauseTimer(userDetails.getId(), timerId));
            case "resume":
                return ResponseEntity.ok(studyTimerService.resumeTimer(userDetails.getId(), timerId));
            case "stop":
                return ResponseEntity.ok(studyTimerService.stopTimer(userDetails.getId(), timerId));
            default:
                return ResponseEntity.badRequest().body("Invalid action: " + action.getAction());
        }
    }
} 