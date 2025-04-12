package com.studyrecord.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyBuddy extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buddy_id")
    private User buddy;

    @Enumerated(EnumType.STRING)
    private BuddyStatus status;

    private LocalDateTime acceptedAt;

    // 친구 요청 수락 처리
    public void accept() {
        this.status = BuddyStatus.ACCEPTED;
        this.acceptedAt = LocalDateTime.now();
    }

    // 친구 거절 또는 삭제 처리
    public void reject() {
        this.status = BuddyStatus.REJECTED;
    }

    public enum BuddyStatus {
        PENDING,   // 친구 요청 대기중
        ACCEPTED,  // 친구 요청 수락됨
        REJECTED   // 친구 요청 거절됨
    }
} 