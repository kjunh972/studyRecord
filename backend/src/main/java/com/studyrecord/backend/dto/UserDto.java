package com.studyrecord.backend.dto;

import com.studyrecord.backend.entity.User;
import lombok.*;

public class UserDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasicInfo {
        private Long id;
        private String username;
        private String name;
        private String email;
        
        public static BasicInfo from(User user) {
            return BasicInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .email(user.getEmail())
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailedInfo {
        private Long id;
        private String username;
        private String name;
        private String email;
        private String phone;
        private String birthdate;
        
        public static DetailedInfo from(User user) {
            return DetailedInfo.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .birthdate(user.getBirthdate())
                    .build();
        }
    }
} 