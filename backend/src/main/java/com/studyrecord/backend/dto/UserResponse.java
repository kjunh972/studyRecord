package com.studyrecord.backend.dto;

import com.studyrecord.backend.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String phone;
    private String birthdate;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .phone(user.getPhone())
                .birthdate(user.getBirthdate())
                .build();
    }
} 