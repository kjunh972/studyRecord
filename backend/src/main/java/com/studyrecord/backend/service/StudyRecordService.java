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
import com.studyrecord.backend.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyRecordService {
    private final StudyRecordRepository studyRecordRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<StudyRecordResponse> getAllStudyRecordsByUsername(String username) {
        return studyRecordRepository.findAllByUserUsername(username).stream()
                .map(StudyRecordResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudyRecordResponse getStudyRecord(Long id) {
        StudyRecord record = findStudyRecord(id);
        return StudyRecordResponse.from(record);
    }

    @Transactional
    public StudyRecordResponse createStudyRecord(StudyRecordRequest request, String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            StudyRecord record = new StudyRecord();
            record.setUser(user);
            record.setTitle(request.getTitle());
            record.setContent(request.getContent());
            record.setEditorMode(request.getEditorMode());
            record.setTags(request.getTags());
            record.setReferences(request.getReferences());
            record.setPublic(request.isPublic());

            StudyRecord savedRecord = studyRecordRepository.save(record);
            return StudyRecordResponse.from(savedRecord);
        } catch (Exception e) {
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
                .orElseThrow(() -> new ResourceNotFoundException("학습 기록을 찾을 수 없습니다. ID: " + id));
    }

    public StudyRecord getById(Long id) {
        return studyRecordRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("학습 기록을 찾을 수 없습니다."));
    }
} 