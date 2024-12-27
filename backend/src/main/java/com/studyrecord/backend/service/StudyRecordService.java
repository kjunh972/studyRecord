package com.studyrecord.backend.service;

import com.studyrecord.backend.domain.StudyRecord;
import com.studyrecord.backend.domain.User;
import com.studyrecord.backend.dto.StudyRecordRequest;
import com.studyrecord.backend.dto.StudyRecordResponse;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyRecordService {
    private static final Logger log = LoggerFactory.getLogger(StudyRecordService.class);
    private final StudyRecordRepository studyRecordRepository;
    private final UserRepository userRepository;

    public List<StudyRecordResponse> getAllStudyRecords() {
        List<StudyRecord> records = studyRecordRepository.findAllByOrderByCreatedAtDesc();
        records.forEach(record -> {
            record.getTags().size();
            record.getReferences().size();
        });
        return records.stream()
                .map(StudyRecordResponse::from)
                .collect(Collectors.toList());
    }

    public StudyRecordResponse getStudyRecord(Long id) {
        StudyRecord record = findStudyRecord(id);
        record.getTags().size();
        record.getReferences().size();
        return StudyRecordResponse.from(record);
    }

    @Transactional
    public StudyRecordResponse createStudyRecord(StudyRecordRequest request) {
        try {
            log.info("Creating study record with editorMode: {}", request.getEditorMode());
            
            User user = userRepository.findById(1L)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            StudyRecord record = new StudyRecord();
            record.setUser(user);
            record.setTitle(request.getTitle());
            record.setContent(request.getContent());
            record.setEditorMode(request.getEditorMode());
            record.setTags(request.getTags());
            record.setReferences(request.getReferences());
            record.setPublic(request.isPublic());

            StudyRecord savedRecord = studyRecordRepository.save(record);
            log.info("Saved study record with editorMode: {}", savedRecord.getEditorMode());
            
            return StudyRecordResponse.from(savedRecord);
        } catch (Exception e) {
            log.error("Error creating study record", e);
            throw new RuntimeException("Failed to create study record", e);
        }
    }

    @Transactional
    public StudyRecordResponse updateStudyRecord(Long id, StudyRecordRequest request) {
        StudyRecord record = findStudyRecord(id);
        record.setTitle(request.getTitle());
        record.setContent(request.getContent());
        record.setEditorMode(request.getEditorMode());
        record.setTags(request.getTags());
        record.setReferences(request.getReferences());
        record.setPublic(request.isPublic());

        return StudyRecordResponse.from(record);
    }

    @Transactional
    public void deleteStudyRecord(Long id) {
        studyRecordRepository.deleteById(id);
    }

    private StudyRecord findStudyRecord(Long id) {
        return studyRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study record not found"));
    }
} 