package com.studyrecord.backend.dto;

import com.studyrecord.backend.entity.Comment;
import lombok.*;

import java.time.LocalDateTime;

public class CommentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private String content;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String content;
        private UserDto.BasicInfo user;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(Comment comment) {
            return Response.builder()
                    .id(comment.getId())
                    .content(comment.isDeleted() ? "삭제된 댓글입니다." : comment.getContent())
                    .user(UserDto.BasicInfo.from(comment.getUser()))
                    .createdAt(comment.getCreatedAt())
                    .updatedAt(comment.getModifiedAt())
                    .build();
        }
    }
} 