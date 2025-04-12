package com.studyrecord.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.studyrecord.backend.entity.StudyTimer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyTimerDto {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "제목은 필수 입력 항목입니다")
        @Size(max = 200, message = "제목은 최대 200자까지 입력 가능합니다")
        private String title;

        private String description;

        @Size(max = 1000, message = "태그는 최대 1000자까지 입력 가능합니다")
        private String tags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long userId;
        private String title;
        private String description;
        private List<String> tags;
        private StudyTimer.TimerStatus status;
        private LocalDateTime startedAt;
        private LocalDateTime pausedAt;
        private Long accumulatedTime;
        private Long currentTime;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(StudyTimer timer) {
            List<String> tagList = null;
            if (timer.getTags() != null && !timer.getTags().isEmpty()) {
                tagList = Arrays.stream(timer.getTags().split(","))
                        .map(String::trim)
                        .collect(Collectors.toList());
            }

            return Response.builder()
                    .id(timer.getId())
                    .userId(timer.getUser().getId())
                    .title(timer.getTitle())
                    .description(timer.getDescription())
                    .tags(tagList)
                    .status(timer.getStatus())
                    .startedAt(timer.getStartedAt())
                    .pausedAt(timer.getPausedAt())
                    .accumulatedTime(timer.getAccumulatedTime())
                    .currentTime(timer.getCurrentAccumulatedTime())
                    .createdAt(timer.getCreatedAt())
                    .updatedAt(timer.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveResult {
        private Long id;
        private StudyTimer.TimerStatus status;
        private Long accumulatedTime;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimerAction {
        private String action; // start, pause, resume, stop
    }
} 