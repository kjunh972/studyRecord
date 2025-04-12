package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyRecordExportDto;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyRecordExportService {

    private final StudyRecordRepository studyRecordRepository;
    private final UserRepository userRepository;

    /**
     * 사용자의 모든 학습 기록을 내보냅니다.
     */
    @Transactional(readOnly = true)
    public StudyRecordExportDto.ExportResponse exportStudyRecords(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<StudyRecord> studyRecords = studyRecordRepository.findByUserId(userId);
        return StudyRecordExportDto.ExportResponse.from(user.getUsername(), studyRecords);
    }

    /**
     * 학습 기록을 가져옵니다.
     * 기존 기록과 충돌이 있는 경우 생성 날짜를 현재로 설정하고 ID를 null로 설정하여 새 기록으로 저장합니다.
     */
    @Transactional
    public StudyRecordExportDto.ImportResponse importStudyRecords(Long userId, StudyRecordExportDto.ImportRequest importRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<String> errorMessages = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;
        
        for (StudyRecordExportDto recordDto : importRequest.getRecords()) {
            try {
                // 새 기록으로 엔티티 생성 (ID 미지정)
                StudyRecord studyRecord = StudyRecord.builder()
                        .title(recordDto.getTitle())
                        .content(recordDto.getContent())
                        .studyTime(recordDto.getStudyTime())
                        .tags(recordDto.getTags())
                        .isPublic(recordDto.isPublic())
                        .editorMode(recordDto.getEditorMode())
                        .user(user)
                        .build();
                
                studyRecordRepository.save(studyRecord);
                successCount++;
            } catch (Exception e) {
                failureCount++;
                errorMessages.add(String.format("기록 '%s' 가져오기 실패: %s", recordDto.getTitle(), e.getMessage()));
            }
        }
        
        return new StudyRecordExportDto.ImportResponse(
                importRequest.getRecords().size(),
                successCount,
                failureCount,
                errorMessages
        );
    }
} 