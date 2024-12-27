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

import java.util.List;

@RestController
@RequestMapping("/api/study-records")
@RequiredArgsConstructor
public class StudyRecordController {
    private static final Logger log = LoggerFactory.getLogger(StudyRecordController.class);
    private final StudyRecordService studyRecordService;

    @GetMapping
    public ResponseEntity<List<StudyRecordResponse>> getAllStudyRecords() {
        return ResponseEntity.ok(studyRecordService.getAllStudyRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyRecordResponse> getStudyRecord(@PathVariable("id") Long id) {
        StudyRecordResponse response = studyRecordService.getStudyRecord(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<StudyRecordResponse> createStudyRecord(@RequestBody StudyRecordRequest request) {
        StudyRecordResponse response = studyRecordService.createStudyRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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