package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyRecordExportDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyRecordExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Tag(name = "학습 기록 내보내기 API", description = "학습 기록 내보내기 관련 API")
@RestController
@RequestMapping("/api/users/{userId}/studyrecord")
@RequiredArgsConstructor
public class StudyRecordExportController {

    private final StudyRecordExportService studyRecordExportService;

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

    @Operation(summary = "학습 기록 내보내기", description = "사용자의 학습 기록을 JSON 형식으로 내보냅니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @GetMapping("/export")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordExportDto.ExportResponse> exportStudyRecords(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        
        StudyRecordExportDto.ExportResponse exportResponse = 
                studyRecordExportService.exportStudyRecords(userDetails.getId());
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "study_records_" + timestamp + ".json";
        
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_JSON)
                .body(exportResponse);
    }

    @Operation(summary = "학습 기록 가져오기", description = "JSON 형식의 학습 기록을 가져옵니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @PostMapping("/import")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyRecordExportDto.ImportResponse> importStudyRecords(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @Parameter(description = "가져올 학습 기록 데이터") @RequestBody StudyRecordExportDto.ImportRequest importRequest,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthorization(userId, userDetails);
        
        StudyRecordExportDto.ImportResponse importResponse = 
                studyRecordExportService.importStudyRecords(userDetails.getId(), importRequest);
        
        return ResponseEntity.ok(importResponse);
    }
} 