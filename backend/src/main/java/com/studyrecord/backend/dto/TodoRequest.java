package com.studyrecord.backend.dto;

import com.studyrecord.backend.domain.TodoPeriod;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class TodoRequest {
    @NotBlank
    private String title;
    
    @NotNull
    private LocalDate dueDate;
    
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalTime endTime;
    
    private TodoPeriod period;
    private String location;
    private List<String> tags;
    private boolean completed;
} 