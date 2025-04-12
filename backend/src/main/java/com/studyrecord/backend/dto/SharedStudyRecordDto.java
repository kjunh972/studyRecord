package com.studyrecord.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedStudyRecordDto {
    private Long id;
    private Long studyRecordId;
    private String title;
    private String content;
    private String editorMode;
    private boolean isPublic;
    private String description;
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    private Long userId;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int likeCount;
    private boolean isLiked;
} 