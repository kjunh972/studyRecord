package com.studyrecord.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String birthdate;
} 