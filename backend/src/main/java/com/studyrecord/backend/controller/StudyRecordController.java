package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyRecordRequest;
import com.studyrecord.backend.dto.StudyRecordResponse;
import com.studyrecord.backend.service.StudyRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-records")
@RequiredArgsConstructor
public class StudyRecordController {
    private final StudyRecordService studyRecordService;

    @GetMapping
    public ResponseEntity<List<StudyRecordResponse>> getAllStudyRecords() {
        return ResponseEntity.ok(studyRecordService.getAllStudyRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyRecordResponse> getStudyRecord(@PathVariable("id") Long id) {
        return ResponseEntity.ok(studyRecordService.getStudyRecord(id));
    }

    @PostMapping
    public ResponseEntity<StudyRecordResponse> createStudyRecord(@RequestBody StudyRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studyRecordService.createStudyRecord(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyRecordResponse> updateStudyRecord(
            @PathVariable Long id, 
            @RequestBody StudyRecordRequest request) {
        return ResponseEntity.ok(studyRecordService.updateStudyRecord(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudyRecord(@PathVariable("id") Long id) {
        studyRecordService.deleteStudyRecord(id);
        return ResponseEntity.noContent().build();
    }
} 