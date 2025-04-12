package com.studyrecord.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_participants")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private StudyChallenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantStatus status;

    @Column(name = "completed_study_time")
    private Long completedStudyTime;

    @Column(name = "completed_study_days")
    private Integer completedStudyDays;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "last_activity")
    private LocalDateTime lastActivity;

    public enum ParticipantStatus {
        JOINED,
        COMPLETED,
        FAILED,
        LEFT
    }
    
    @PrePersist
    public void prePersist() {
        this.completedStudyTime = this.completedStudyTime == null ? 0L : this.completedStudyTime;
        this.completedStudyDays = this.completedStudyDays == null ? 0 : this.completedStudyDays;
        this.status = this.status == null ? ParticipantStatus.JOINED : this.status;
        this.lastActivity = LocalDateTime.now();
    }

    public void updateProgress(Long addedStudyTime) {
        this.completedStudyTime += addedStudyTime;
        this.lastActivity = LocalDateTime.now();
        
        // 하루 목표를 달성했는지 확인 및 업데이트 로직은 별도 서비스에서 처리
    }

    public void completeChallenge() {
        this.status = ParticipantStatus.COMPLETED;
        this.lastActivity = LocalDateTime.now();
    }

    public void failChallenge() {
        this.status = ParticipantStatus.FAILED;
        this.lastActivity = LocalDateTime.now();
    }

    public void leaveChallenge() {
        this.status = ParticipantStatus.LEFT;
        this.lastActivity = LocalDateTime.now();
    }
} 