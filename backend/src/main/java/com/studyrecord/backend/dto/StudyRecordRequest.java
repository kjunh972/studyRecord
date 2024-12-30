package com.studyrecord.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class StudyRecordRequest {
    private String title;
    private String content;
    private String editorMode;
    private List<String> tags;
    private List<String> references;
    private boolean isPublic;
    private String username;
} 