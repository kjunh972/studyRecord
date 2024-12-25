package com.studyrecord.backend.dto;

import lombok.Getter;
import java.util.List;

@Getter
public class StudyRecordRequest {
    private String title;
    private String content;
    private List<String> tags;
    private List<String> references;
    private boolean isPublic;
} 