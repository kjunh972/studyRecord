package com.studyrecord.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studyrecord.backend.entity.ChallengeParticipant;
import com.studyrecord.backend.entity.StudyChallenge;
import lombok.*;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class StudyChallengeDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "제목을 입력해주세요.")
        private String title;
        
        @NotBlank(message = "설명을 입력해주세요.")
        private String description;
        
        @NotNull(message = "시작 날짜를 입력해주세요.")
        @Future(message = "시작 날짜는 현재보다 미래여야 합니다.")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        
        @NotNull(message = "종료 날짜를 입력해주세요.")
        @Future(message = "종료 날짜는 현재보다 미래여야 합니다.")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        
        @NotNull(message = "목표 학습 시간을 입력해주세요.")
        @Min(value = 1, message = "목표 학습 시간은 최소 1분 이상이어야 합니다.")
        private Long targetStudyTime;
        
        @NotNull(message = "목표 학습 일수를 입력해주세요.")
        @Min(value = 1, message = "목표 학습 일수는 최소 1일 이상이어야 합니다.")
        private Integer targetStudyDays;
        
        private Set<String> tags = new HashSet<>();
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private UserDto.BasicInfo creator;
        private int participantCount;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        
        private Long targetStudyTime;
        private Integer targetStudyDays;
        private Set<String> tags;
        private String status;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        private boolean isParticipating;
        
        public static Response from(StudyChallenge challenge, boolean isParticipating) {
            return Response.builder()
                    .id(challenge.getId())
                    .title(challenge.getTitle())
                    .description(challenge.getDescription())
                    .creator(UserDto.BasicInfo.from(challenge.getCreator()))
                    .participantCount(challenge.getParticipants().size())
                    .startDate(challenge.getStartDate())
                    .endDate(challenge.getEndDate())
                    .targetStudyTime(challenge.getTargetStudyTime())
                    .targetStudyDays(challenge.getTargetStudyDays())
                    .tags(challenge.getTags())
                    .status(challenge.getStatus().name())
                    .createdAt(challenge.getCreatedAt())
                    .isParticipating(isParticipating)
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantResponse {
        private Long userId;
        private String username;
        private String name;
        private Long completedStudyTime;
        private Integer completedStudyDays;
        private String status;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime joinedAt;
        
        public static ParticipantResponse from(ChallengeParticipant participant) {
            return ParticipantResponse.builder()
                    .userId(participant.getUser().getId())
                    .username(participant.getUser().getUsername())
                    .name(participant.getUser().getName())
                    .completedStudyTime(participant.getCompletedStudyTime())
                    .completedStudyDays(participant.getCompletedStudyDays())
                    .status(participant.getStatus().name())
                    .joinedAt(participant.getJoinedAt())
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Long id;
        private String title;
        private String description;
        private UserDto.BasicInfo creator;
        private List<ParticipantResponse> participants;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        
        private Long targetStudyTime;
        private Integer targetStudyDays;
        private Set<String> tags;
        private String status;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        private boolean isParticipating;
        private ParticipantResponse userParticipation;
        
        public static DetailResponse from(StudyChallenge challenge, boolean isParticipating, ChallengeParticipant userParticipation) {
            List<ParticipantResponse> participantResponses = challenge.getParticipants().stream()
                    .map(ParticipantResponse::from)
                    .collect(Collectors.toList());
            
            return DetailResponse.builder()
                    .id(challenge.getId())
                    .title(challenge.getTitle())
                    .description(challenge.getDescription())
                    .creator(UserDto.BasicInfo.from(challenge.getCreator()))
                    .participants(participantResponses)
                    .startDate(challenge.getStartDate())
                    .endDate(challenge.getEndDate())
                    .targetStudyTime(challenge.getTargetStudyTime())
                    .targetStudyDays(challenge.getTargetStudyDays())
                    .tags(challenge.getTags())
                    .status(challenge.getStatus().name())
                    .createdAt(challenge.getCreatedAt())
                    .isParticipating(isParticipating)
                    .userParticipation(userParticipation != null ? ParticipantResponse.from(userParticipation) : null)
                    .build();
        }
    }
} 