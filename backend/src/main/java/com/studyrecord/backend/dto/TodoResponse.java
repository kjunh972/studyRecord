package com.studyrecord.backend.dto;

import com.studyrecord.backend.domain.Todo;
import com.studyrecord.backend.domain.TodoPeriod;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@Builder
public class TodoResponse {
    private Long id;
    private String task;
    private LocalDateTime dueDate;
    private TodoPeriod period;
    private boolean completed;
    private UserResponse user;

    public static TodoResponse from(Todo todo) {
        return TodoResponse.builder()
                .id(todo.getId())
                .task(todo.getTask())
                .dueDate(todo.getDueDate())
                .period(todo.getPeriod())
                .completed(todo.isCompleted())
                .user(UserResponse.from(todo.getUser()))
                .build();
    }
} 