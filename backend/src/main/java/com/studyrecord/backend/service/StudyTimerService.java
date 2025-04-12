package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyRecordDto;
import com.studyrecord.backend.dto.StudyTimerDto;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.StudyTimer;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.exception.ResourceNotFoundException;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.StudyTimerRepository;
import com.studyrecord.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyTimerService {

    private final StudyTimerRepository studyTimerRepository;
    private final UserRepository userRepository;
    private final StudyRecordRepository studyRecordRepository;

    @Transactional
    public StudyTimerDto.Response createTimer(Long userId, StudyTimerDto.Request request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 이미 실행 중인 타이머가 있는지 확인
        studyTimerRepository.findRunningTimerByUserId(userId).ifPresent(timer -> {
            throw new IllegalStateException("User already has a running timer");
        });

        StudyTimer timer = StudyTimer.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .tags(request.getTags())
                .status(StudyTimer.TimerStatus.STOPPED)
                .accumulatedTime(0L)
                .build();

        StudyTimer savedTimer = studyTimerRepository.save(timer);
        return StudyTimerDto.Response.from(savedTimer);
    }

    @Transactional
    public StudyTimerDto.Response getTimer(Long userId, Long timerId) {
        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to access this timer");
        }

        return StudyTimerDto.Response.from(timer);
    }

    @Transactional
    public List<StudyTimerDto.Response> getUserTimers(Long userId) {
        List<StudyTimer> timers = studyTimerRepository.findByUserId(userId);
        return timers.stream()
                .map(StudyTimerDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<StudyTimerDto.Response> getActiveTimers(Long userId) {
        List<StudyTimer> timers = studyTimerRepository.findActiveTimersByUserId(userId);
        return timers.stream()
                .map(StudyTimerDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudyTimerDto.Response updateTimer(Long userId, Long timerId, StudyTimerDto.Request request) {
        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to update this timer");
        }

        timer.setTitle(request.getTitle());
        timer.setDescription(request.getDescription());
        timer.setTags(request.getTags());

        StudyTimer updatedTimer = studyTimerRepository.save(timer);
        return StudyTimerDto.Response.from(updatedTimer);
    }

    @Transactional
    public void deleteTimer(Long userId, Long timerId) {
        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this timer");
        }

        studyTimerRepository.delete(timer);
    }

    @Transactional
    public StudyTimerDto.Response startTimer(Long userId, Long timerId) {
        // 이미 실행 중인 타이머가 있는지 확인
        studyTimerRepository.findRunningTimerByUserId(userId).ifPresent(runningTimer -> {
            throw new IllegalStateException("Another timer is already running. Please stop that timer first.");
        });

        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to start this timer");
        }

        timer.start();
        StudyTimer updatedTimer = studyTimerRepository.save(timer);
        return StudyTimerDto.Response.from(updatedTimer);
    }

    @Transactional
    public StudyTimerDto.Response pauseTimer(Long userId, Long timerId) {
        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to pause this timer");
        }

        if (timer.getStatus() != StudyTimer.TimerStatus.RUNNING) {
            throw new IllegalStateException("Timer is not running");
        }

        timer.pause();
        StudyTimer updatedTimer = studyTimerRepository.save(timer);
        return StudyTimerDto.Response.from(updatedTimer);
    }

    @Transactional
    public StudyTimerDto.Response resumeTimer(Long userId, Long timerId) {
        // 이미 실행 중인 타이머가 있는지 확인
        studyTimerRepository.findRunningTimerByUserId(userId).ifPresent(runningTimer -> {
            throw new IllegalStateException("Another timer is already running. Please stop that timer first.");
        });

        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to resume this timer");
        }

        if (timer.getStatus() != StudyTimer.TimerStatus.PAUSED) {
            throw new IllegalStateException("Timer is not paused");
        }

        timer.resume();
        StudyTimer updatedTimer = studyTimerRepository.save(timer);
        return StudyTimerDto.Response.from(updatedTimer);
    }

    @Transactional
    public StudyRecordDto.Response stopTimer(Long userId, Long timerId) {
        StudyTimer timer = studyTimerRepository.findById(timerId)
                .orElseThrow(() -> new ResourceNotFoundException("Timer not found with id: " + timerId));

        if (!timer.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to stop this timer");
        }

        if (timer.getStatus() == StudyTimer.TimerStatus.STOPPED) {
            throw new IllegalStateException("Timer is already stopped");
        }

        timer.stop();
        studyTimerRepository.save(timer);

        // 타이머의 누적 시간이 0이면 학습 기록 생성하지 않음
        if (timer.getAccumulatedTime() <= 0) {
            throw new IllegalStateException("Timer accumulated time is 0, no study record will be created");
        }

        // 타이머 정보를 기반으로 학습 기록 생성
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Long 타입을 int로 변환하여 builder에 전달
        int studyTimeMinutes = timer.getAccumulatedTime().intValue();
        
        StudyRecord studyRecord = StudyRecord.builder()
                .user(user)
                .title(timer.getTitle())
                .content(timer.getDescription())
                .studyTime(studyTimeMinutes)
                .isPublic(false)
                .editorMode("MARKDOWN")
                .build();

        // 태그 처리
        if (timer.getTags() != null && !timer.getTags().isEmpty()) {
            List<String> tags = Arrays.stream(timer.getTags().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList());
            studyRecord.getTags().addAll(tags);
        }

        StudyRecord savedRecord = studyRecordRepository.save(studyRecord);
        return StudyRecordDto.Response.from(savedRecord);
    }

    public Long getTotalStudyTime(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        return studyTimerRepository.sumAccumulatedTimeByUserIdAndTimeRange(userId, startTime, endTime);
    }

    public List<String> getMostUsedTags(Long userId, int limit) {
        return studyTimerRepository.findMostUsedTags(userId, limit);
    }
} 