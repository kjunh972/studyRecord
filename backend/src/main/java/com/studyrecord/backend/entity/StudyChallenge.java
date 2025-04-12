package com.studyrecord.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "study_challenges")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "target_study_time", nullable = false)
    private Long targetStudyTime; // 분 단위

    @Column(name = "target_study_days", nullable = false)
    private Integer targetStudyDays; // 목표 학습 일수

    @ElementCollection
    @CollectionTable(name = "study_challenge_tags", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "tag")
    private Set<String> tags = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChallengeStatus status;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChallengeParticipant> participants = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ChallengeStatus {
        SCHEDULED, // 예정된 챌린지
        ACTIVE,    // 진행 중
        COMPLETED, // 완료됨
        CANCELED   // 취소됨
    }

    @PrePersist
    public void prePersist() {
        this.status = this.status == null ? ChallengeStatus.SCHEDULED : this.status;
    }

    public void addParticipant(User user) {
        ChallengeParticipant participant = ChallengeParticipant.builder()
                .challenge(this)
                .user(user)
                .status(ChallengeParticipant.ParticipantStatus.JOINED)
                .completedStudyTime(0L)
                .completedStudyDays(0)
                .build();
        
        participants.add(participant);
    }

    public void removeParticipant(ChallengeParticipant participant) {
        participants.remove(participant);
    }

    public void startChallenge() {
        if (this.status == ChallengeStatus.SCHEDULED) {
            this.status = ChallengeStatus.ACTIVE;
        }
    }

    public void completeChallenge() {
        if (this.status == ChallengeStatus.ACTIVE) {
            this.status = ChallengeStatus.COMPLETED;
        }
    }

    public void cancelChallenge() {
        if (this.status != ChallengeStatus.COMPLETED) {
            this.status = ChallengeStatus.CANCELED;
        }
    }
    
    public boolean isActive() {
        return this.status == ChallengeStatus.ACTIVE;
    }
    
    public boolean isEnded() {
        return this.status == ChallengeStatus.COMPLETED || this.status == ChallengeStatus.CANCELED;
    }
    
    public int getParticipantCount() {
        return participants.size();
    }
} 