package com.studyrecord.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyrecord.backend.entity.StudyBuddy;
import lombok.*;

import java.time.LocalDateTime;

public class StudyBuddyDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private UserDto.BasicInfo user;
        private UserDto.BasicInfo buddy;
        private String status;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime acceptedAt;
        
        public static Response from(StudyBuddy studyBuddy) {
            return Response.builder()
                    .id(studyBuddy.getId())
                    .user(UserDto.BasicInfo.from(studyBuddy.getUser()))
                    .buddy(UserDto.BasicInfo.from(studyBuddy.getBuddy()))
                    .status(studyBuddy.getStatus().name())
                    .createdAt(studyBuddy.getCreatedAt())
                    .acceptedAt(studyBuddy.getAcceptedAt())
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long buddyId; // 친구로 추가할 사용자 ID
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BuddyInfo {
        private Long userId;
        private String username;
        private String name;
        private int totalStudyTime;     // 총 학습 시간 (분)
        private int studyStreakDays;    // 연속 학습일
        private LocalDateTime lastActivity; // 마지막 활동 시간
        
        public static BuddyInfo from(UserDto.BasicInfo userInfo, int totalStudyTime, int studyStreakDays, LocalDateTime lastActivity) {
            return BuddyInfo.builder()
                    .userId(userInfo.getId())
                    .username(userInfo.getUsername())
                    .name(userInfo.getName())
                    .totalStudyTime(totalStudyTime)
                    .studyStreakDays(studyStreakDays)
                    .lastActivity(lastActivity)
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuddyListResponse {
        private int totalBuddies;
        private int pendingRequests;
        private java.util.List<BuddyInfo> buddies;
    }
} 