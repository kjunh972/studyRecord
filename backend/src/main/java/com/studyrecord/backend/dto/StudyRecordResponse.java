package com.studyrecord.backend.dto;

import com.studyrecord.backend.domain.StudyRecord;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class StudyRecordResponse {
    private Long id;
    private String title;
    private String content;
    private List<String> tags;
    private List<String> references;
    private boolean isPublic;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserResponse user;
    private String editorMode;

    public static StudyRecordResponse from(StudyRecord record) {
        return StudyRecordResponse.builder()
                .id(record.getId())
                .title(record.getTitle())
                .content(record.getContent())
                .tags(record.getTags())
                .references(record.getReferences())
                .isPublic(record.isPublic())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .user(UserResponse.from(record.getUser()))
                .editorMode(record.getEditorMode())
                .build();
    }
} 