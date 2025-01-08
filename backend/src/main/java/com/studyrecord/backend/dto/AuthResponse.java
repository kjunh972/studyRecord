package com.studyrecord.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String token;
    private UserDto user;

    @Getter
    @Builder
    public static class UserDto {
        private Long id;
        private String username;
        private String name;
        private String phone;
        private String birthdate;
    }
} 