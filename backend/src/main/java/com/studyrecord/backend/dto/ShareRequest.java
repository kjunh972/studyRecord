package com.studyrecord.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareRequest {
    private boolean isPublic;
    private String description;
    @Builder.Default
    private List<String> tags = new ArrayList<>();
} 