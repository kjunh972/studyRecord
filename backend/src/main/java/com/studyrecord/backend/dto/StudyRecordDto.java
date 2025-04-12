package com.studyrecord.backend.dto;

import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StudyRecordDto {

    @Getter
    @Builder
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "제목을 입력해주세요.")
        private String title;

        @NotBlank(message = "내용을 입력해주세요.")
        private String content;

        @NotNull(message = "학습 시간을 입력해주세요.")
        @Min(value = 1, message = "학습 시간은 1분 이상이어야 합니다.")
        private Integer studyTime;

        @Builder.Default
        private List<String> tags = new ArrayList<>();

        @Builder.Default
        private boolean isPublic = false;

        @Builder.Default
        private String editorMode = "view";

        public StudyRecord toEntity(User user) {
            return StudyRecord.builder()
                    .title(title)
                    .content(content)
                    .studyTime(studyTime)
                    .tags(tags)
                    .isPublic(isPublic)
                    .editorMode(editorMode)
                    .user(user)
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private int studyTime;
        private List<String> tags;
        private Long userId;
        private String username;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;
        private boolean isPublic;
        private String editorMode;

        public static Response from(StudyRecord studyRecord) {
            return Response.builder()
                    .id(studyRecord.getId())
                    .title(studyRecord.getTitle())
                    .content(studyRecord.getContent())
                    .studyTime(studyRecord.getStudyTime())
                    .tags(new ArrayList<>(studyRecord.getTags()))
                    .userId(studyRecord.getUser().getId())
                    .username(studyRecord.getUser().getUsername())
                    .createdAt(studyRecord.getCreatedAt())
                    .modifiedAt(studyRecord.getModifiedAt())
                    .isPublic(studyRecord.isPublic())
                    .editorMode(studyRecord.getEditorMode())
                    .build();
        }
    }
} 