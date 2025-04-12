package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyRecordDto;
import com.studyrecord.backend.dto.StudyStatisticsDto;
import com.studyrecord.backend.service.StudyRecordService;
import com.studyrecord.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

import java.util.List;

@Tag(name = "학습 기록 API", description = "학습 기록 관련 API")
@RestController
@RequestMapping("/api/users/{userId}/studyrecord")
@RequiredArgsConstructor
public class StudyRecordController {
    private static final Logger log = LoggerFactory.getLogger(StudyRecordController.class);
    private final StudyRecordService studyRecordService;

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

    @Operation(summary = "학습 기록 목록", description = "GET /api/users/{userId}/studyrecord")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "실패")
    })
    @GetMapping
    public ResponseEntity<List<StudyRecordDto.Response>> getAllStudyRecords(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getStudyRecords(userDetails.getId(), Pageable.unpaged())
                .getContent());
    }

    @Operation(summary = "학습 기록 상세", description = "GET /api/users/{userId}/studyrecord/{id}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "실패"),
        @ApiResponse(responseCode = "403", description = "실패"),
        @ApiResponse(responseCode = "404", description = "실패")
    })
    @GetMapping("/{id}")
    public ResponseEntity<StudyRecordDto.Response> getStudyRecord(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "학습 기록 ID") @PathVariable("id") Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (id == null) {
            throw new IllegalArgumentException("유효하지 않은 ID입니다.");
        }
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getStudyRecord(id, userDetails.getId()));
    }

    @Operation(summary = "학습 기록 생성", description = "POST /api/users/{userId}/studyrecord")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "성공"),
        @ApiResponse(responseCode = "400", description = "실패"),
        @ApiResponse(responseCode = "401", description = "실패")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordDto.Response> createStudyRecord(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "생성할 학습 기록 정보") @RequestBody StudyRecordDto.Request request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        try {
            StudyRecordDto.Response response = studyRecordService.createStudyRecord(userDetails.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("학습 기록 생성 실패 : ", e);
            throw e;
        }
    }

    @Operation(summary = "학습 기록 수정", description = "PUT /api/users/{userId}/studyrecord/{id}")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "실패"),
        @ApiResponse(responseCode = "401", description = "실패"),
        @ApiResponse(responseCode = "403", description = "실패"),
        @ApiResponse(responseCode = "404", description = "실패")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordDto.Response> updateStudyRecord(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "학습 기록 ID") @PathVariable Long id,
            @Parameter(description = "수정할 학습 기록 정보") @RequestBody StudyRecordDto.Request request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.updateStudyRecord(id, userDetails.getId(), request));
    }

    @Operation(summary = "학습 기록 삭제", description = "DELETE /api/users/{userId}/studyrecord/{id}")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "성공"),
        @ApiResponse(responseCode = "401", description = "실패"),
        @ApiResponse(responseCode = "403", description = "실패"),
        @ApiResponse(responseCode = "404", description = "실패")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteStudyRecord(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "학습 기록 ID") @PathVariable("id") Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        studyRecordService.deleteStudyRecord(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "일간 통계 조회", description = "특정 날짜의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/daily")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.DailyStats> getDailyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "조회할 날짜") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getDailyStats(userDetails.getId(), date));
    }

    @Operation(summary = "주간 통계 조회", description = "특정 주의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/weekly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.WeeklyStats> getWeeklyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "주의 시작 날짜") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getWeeklyStats(userDetails.getId(), startDate));
    }

    @Operation(summary = "월간 통계 조회", description = "특정 월의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/monthly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.MonthlyStats> getMonthlyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "연도") @RequestParam int year,
            @Parameter(description = "월") @RequestParam int month,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getMonthlyStats(userDetails.getId(), year, month));
    }

    @Operation(summary = "연간 통계 조회", description = "특정 연도의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/yearly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.YearlyStats> getYearlyStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "연도") @RequestParam int year,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getYearlyStats(userDetails.getId(), year));
    }

    @Operation(summary = "전체 통계 조회", description = "전체 기간의 학습 통계를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/statistics/overall")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyStatisticsDto.OverallStats> getOverallStats(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getOverallStats(userDetails.getId()));
    }

    @Operation(summary = "태그별 학습 기록 조회", description = "특정 태그가 포함된 학습 기록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/tags/{tag}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyRecordDto.Response>> getStudyRecordsByTag(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "태그") @PathVariable String tag,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getStudyRecordsByTag(userDetails.getId(), tag));
    }

    @Operation(summary = "인기 태그 조회", description = "사용자의 인기 태그를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/tags/popular")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getPopularTags(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getPopularTags(userDetails.getId()));
    }

    @Operation(summary = "태그 목록 조회", description = "사용자가 사용한 모든 태그를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/tags")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getAllTags(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getAllTags(userDetails.getId()));
    }

    @Operation(summary = "학습 기록 목록 (페이지네이션)", description = "GET /api/users/{userId}/studyrecord")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "실패")
    })
    @GetMapping("/paged")
    public ResponseEntity<Page<StudyRecordDto.Response>> getPagedStudyRecords(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 (예: createdAt,desc)") @RequestParam(defaultValue = "createdAt,desc") String sort,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Sort pageSort = 
            sortDirection.equalsIgnoreCase("desc") 
                ? org.springframework.data.domain.Sort.by(sortField).descending() 
                : org.springframework.data.domain.Sort.by(sortField).ascending();
                
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, pageSort);
        
        return ResponseEntity.ok(studyRecordService.getStudyRecords(userDetails.getId(), pageable));
    }

    @Operation(summary = "특정 기간의 학습 기록 조회", description = "특정 기간 내의 학습 기록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/period")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyRecordDto.Response>> getStudyRecordsByPeriod(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "시작 날짜") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "종료 날짜") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.getStudyRecordsByPeriod(userDetails.getId(), startDate, endDate));
    }

    @Operation(summary = "에디터 모드 변경", description = "학습 기록의 에디터 모드를 변경합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "실패"),
        @ApiResponse(responseCode = "401", description = "실패"),
        @ApiResponse(responseCode = "403", description = "실패"),
        @ApiResponse(responseCode = "404", description = "실패")
    })
    @PatchMapping("/{id}/editor-mode")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordDto.Response> updateEditorMode(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "학습 기록 ID") @PathVariable("id") Long id,
            @Parameter(description = "에디터 모드 (view, edit, comment)") @RequestParam String editorMode,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.updateEditorMode(id, userDetails.getId(), editorMode));
    }

    @Operation(summary = "공개 여부 변경", description = "학습 기록의 공개 여부를 변경합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "실패"),
        @ApiResponse(responseCode = "401", description = "실패"),
        @ApiResponse(responseCode = "403", description = "실패"),
        @ApiResponse(responseCode = "404", description = "실패")
    })
    @PatchMapping("/{id}/visibility")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordDto.Response> updateVisibility(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "학습 기록 ID") @PathVariable("id") Long id,
            @Parameter(description = "공개 여부 (true/false)") @RequestParam boolean isPublic,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        return ResponseEntity.ok(studyRecordService.updateVisibility(id, userDetails.getId(), isPublic));
    }

    @Operation(summary = "학습 기록 검색", description = "키워드로 학습 기록을 검색합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<StudyRecordDto.Response>> searchStudyRecords(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "검색 키워드") @RequestParam(required = false) String keyword,
            @Parameter(description = "태그 (선택사항)") @RequestParam(required = false) String tag,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 (예: createdAt,desc)") @RequestParam(defaultValue = "createdAt,desc") String sort,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Sort pageSort = 
            sortDirection.equalsIgnoreCase("desc") 
                ? org.springframework.data.domain.Sort.by(sortField).descending() 
                : org.springframework.data.domain.Sort.by(sortField).ascending();
                
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, pageSort);
        
        if (tag != null && !tag.trim().isEmpty()) {
            return ResponseEntity.ok(studyRecordService.searchStudyRecordsByKeywordAndTag(
                    userDetails.getId(), keyword, tag, pageable));
        } else {
            return ResponseEntity.ok(studyRecordService.searchStudyRecords(
                    userDetails.getId(), keyword, pageable));
        }
    }
} 