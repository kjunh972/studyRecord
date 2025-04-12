package com.studyrecord.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyrecord.backend.entity.StudyRecord;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyRecordExportDto {
    private Long id;
    private String title;
    private String content;
    private int studyTime;
    private List<String> tags;
    private boolean isPublic;
    private String editorMode;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public static StudyRecordExportDto from(StudyRecord studyRecord) {
        return StudyRecordExportDto.builder()
                .id(studyRecord.getId())
                .title(studyRecord.getTitle())
                .content(studyRecord.getContent())
                .studyTime(studyRecord.getStudyTime())
                .tags(new ArrayList<>(studyRecord.getTags()))
                .isPublic(studyRecord.isPublic())
                .editorMode(studyRecord.getEditorMode())
                .createdAt(studyRecord.getCreatedAt())
                .updatedAt(studyRecord.getCreatedAt())
                .build();
    }

    public StudyRecord toEntity() {
        return StudyRecord.builder()
                .title(title)
                .content(content)
                .studyTime(studyTime)
                .tags(tags)
                .isPublic(isPublic)
                .editorMode(editorMode)
                .build();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportResponse {
        private String userName;
        private int totalRecords;
        private List<StudyRecordExportDto> records;
        
        public static ExportResponse from(String userName, List<StudyRecord> studyRecords) {
            List<StudyRecordExportDto> exportDtos = studyRecords.stream()
                    .map(StudyRecordExportDto::from)
                    .collect(Collectors.toList());
            
            return new ExportResponse(userName, exportDtos.size(), exportDtos);
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportRequest {
        private List<StudyRecordExportDto> records;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportResponse {
        private int totalImported;
        private int successCount;
        private int failureCount;
        private List<String> errorMessages;
    }
} 