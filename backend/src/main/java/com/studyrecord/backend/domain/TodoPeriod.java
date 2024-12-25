package com.studyrecord.backend.domain;

import lombok.Getter;

@Getter
public enum TodoPeriod {
    DAILY("일간"),
    WEEKLY("주간"),
    MONTHLY("월간");

    private final String description;

    TodoPeriod(String description) {
        this.description = description;
    }
} 