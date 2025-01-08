package com.studyrecord.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PasswordUpdateRequest {
    private String currentPassword;
    private String newPassword;
} 