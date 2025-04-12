package com.studyrecord.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_timers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyTimer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    @Column(name = "accumulated_time")
    private Long accumulatedTime; // 분 단위

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "tags", length = 1000)
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TimerStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TimerStatus {
        RUNNING,
        PAUSED,
        STOPPED
    }

    @PrePersist
    public void prePersist() {
        this.accumulatedTime = this.accumulatedTime == null ? 0L : this.accumulatedTime;
        this.status = this.status == null ? TimerStatus.STOPPED : this.status;
    }

    public void start() {
        if (this.status != TimerStatus.RUNNING) {
            this.startedAt = LocalDateTime.now();
            this.pausedAt = null;
            this.status = TimerStatus.RUNNING;
        }
    }

    public void pause() {
        if (this.status == TimerStatus.RUNNING) {
            this.pausedAt = LocalDateTime.now();
            
            // 누적 시간 계산 (분 단위)
            long elapsedMinutes = java.time.Duration.between(this.startedAt, this.pausedAt).toMinutes();
            this.accumulatedTime += elapsedMinutes;
            
            this.status = TimerStatus.PAUSED;
        }
    }

    public void resume() {
        if (this.status == TimerStatus.PAUSED) {
            this.startedAt = LocalDateTime.now();
            this.pausedAt = null;
            this.status = TimerStatus.RUNNING;
        }
    }

    public void stop() {
        if (this.status == TimerStatus.RUNNING) {
            LocalDateTime now = LocalDateTime.now();
            
            // 누적 시간 계산 (분 단위)
            long elapsedMinutes = java.time.Duration.between(this.startedAt, now).toMinutes();
            this.accumulatedTime += elapsedMinutes;
        }
        
        this.startedAt = null;
        this.pausedAt = null;
        this.status = TimerStatus.STOPPED;
    }

    public Long getCurrentAccumulatedTime() {
        if (this.status == TimerStatus.RUNNING) {
            LocalDateTime now = LocalDateTime.now();
            long runningMinutes = java.time.Duration.between(this.startedAt, now).toMinutes();
            return this.accumulatedTime + runningMinutes;
        }
        return this.accumulatedTime;
    }
} 