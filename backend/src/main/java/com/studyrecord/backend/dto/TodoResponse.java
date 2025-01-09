package com.studyrecord.backend.dto;

import com.studyrecord.backend.domain.Todo;
import com.studyrecord.backend.domain.TodoPeriod;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
public class TodoResponse {
    private Long id;
    private String title;
    private LocalDate dueDate;
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private TodoPeriod period;
    private boolean completed;
    private UserResponse user;
    private String location;
    private List<String> tags;

    public static TodoResponse from(Todo todo) {
        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .dueDate(todo.getDueDate())
                .startDate(todo.getStartDate())
                .startTime(todo.getStartTime())
                .endTime(todo.getEndTime())
                .period(todo.getPeriod())
                .location(todo.getLocation())
                .tags(todo.getTags())
                .completed(todo.isCompleted())
                .user(UserResponse.from(todo.getUser()))
                .build();
    }
} 