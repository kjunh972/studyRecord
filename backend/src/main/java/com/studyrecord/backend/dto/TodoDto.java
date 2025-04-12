package com.studyrecord.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.studyrecord.backend.entity.Todo;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TodoDto {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "제목을 입력해주세요")
        private String title;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate dueDate;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;
        
        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;
        
        private String location;
        private List<String> tags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String title;
        private boolean completed;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate dueDate;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        
        @JsonFormat(pattern = "HH:mm")
        private LocalTime startTime;
        
        @JsonFormat(pattern = "HH:mm")
        private LocalTime endTime;
        
        private String location;
        private List<String> tags;
        
        public static Response from(Todo todo) {
            return Response.builder()
                    .id(todo.getId())
                    .title(todo.getTitle())
                    .completed(todo.isCompleted())
                    .dueDate(todo.getDueDate())
                    .startDate(todo.getStartDate())
                    .startTime(todo.getStartTime())
                    .endTime(todo.getEndTime())
                    .location(todo.getLocation())
                    .tags(todo.getTags())
                    .build();
        }
    }
} 