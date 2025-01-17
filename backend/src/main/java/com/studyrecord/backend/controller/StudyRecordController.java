package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyRecordRequest;
import com.studyrecord.backend.dto.StudyRecordResponse;
import com.studyrecord.backend.service.StudyRecordService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@RestController
@RequestMapping("/api/study-records")
@RequiredArgsConstructor
public class StudyRecordController {
    private static final Logger log = LoggerFactory.getLogger(StudyRecordController.class);
    private final StudyRecordService studyRecordService;

    @GetMapping
    public ResponseEntity<List<StudyRecordResponse>> getAllStudyRecords(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(studyRecordService.getAllStudyRecordsByUsername(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyRecordResponse> getStudyRecord(@PathVariable("id") Long id, @AuthenticationPrincipal UserDetails userDetails) {
        if (id == null) {
            throw new IllegalArgumentException("유효하지 않은 ID입니다.");
        }

        StudyRecordResponse response = studyRecordService.getStudyRecord(id);
        
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        
        if (!response.getUser().getUsername().equals(userDetails.getUsername())) {
            throw new AccessDeniedException("해당 학습 기록에 대한 접근 권한이 없습니다.");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<StudyRecordResponse> createStudyRecord(
        @RequestBody StudyRecordRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        
        try {
            StudyRecordResponse response = studyRecordService.createStudyRecord(request, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("학습 기록 생성 실패 : ", e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyRecordResponse> updateStudyRecord(
            @PathVariable Long id, 
            @RequestBody StudyRecordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        
        StudyRecordResponse existingRecord = studyRecordService.getStudyRecord(id);
        if (!existingRecord.getUser().getUsername().equals(userDetails.getUsername())) {
            throw new AccessDeniedException("해당 학습 기록에 대한 수정 권한이 없습니다.");
        }
        
        return ResponseEntity.ok(studyRecordService.updateStudyRecord(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudyRecord(
        @PathVariable("id") Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        
        StudyRecordResponse existingRecord = studyRecordService.getStudyRecord(id);
        if (!existingRecord.getUser().getUsername().equals(userDetails.getUsername())) {
            throw new AccessDeniedException("해당 학습 기록에 대한 삭제 권한이 없습니다.");
        }
        
        studyRecordService.deleteStudyRecord(id);
        return ResponseEntity.noContent().build();
    }
} 