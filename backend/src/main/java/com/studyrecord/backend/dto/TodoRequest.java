package com.studyrecord.backend.dto;

import com.studyrecord.backend.domain.TodoPeriod;
import lombok.Getter;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Setter;

@Getter
@Setter
public class TodoRequest {
    private String task;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dueDate;
    
    private TodoPeriod period;
    private boolean completed;
    private String username;
} 