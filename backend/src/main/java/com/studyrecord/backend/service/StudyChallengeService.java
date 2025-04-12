package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyChallengeDto;
import com.studyrecord.backend.entity.ChallengeParticipant;
import com.studyrecord.backend.entity.StudyChallenge;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.exception.ResourceNotFoundException;
import com.studyrecord.backend.repository.ChallengeParticipantRepository;
import com.studyrecord.backend.repository.StudyChallengeRepository;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyChallengeService {

    private final StudyChallengeRepository studyChallengeRepository;
    private final ChallengeParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final StudyRecordRepository studyRecordRepository;

    @Transactional
    public StudyChallengeDto.Response createChallenge(Long userId, StudyChallengeDto.Request request) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudyChallenge challenge = StudyChallenge.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .creator(creator)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .targetStudyTime(request.getTargetStudyTime())
                .targetStudyDays(request.getTargetStudyDays())
                .status(StudyChallenge.ChallengeStatus.SCHEDULED)
                .build();

        if (request.getTags() != null) {
            challenge.getTags().addAll(request.getTags());
        }

        challenge.addParticipant(creator);
        StudyChallenge saved = studyChallengeRepository.save(challenge);
        
        return StudyChallengeDto.Response.from(saved, true);
    }

    @Transactional
    public StudyChallengeDto.Response updateChallenge(Long userId, Long challengeId, StudyChallengeDto.Request request) {
        StudyChallenge challenge = studyChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + challengeId));

        if (!challenge.getCreator().getId().equals(userId)) {
            throw new AccessDeniedException("Only the creator can update this challenge");
        }

        if (!challenge.getStatus().equals(StudyChallenge.ChallengeStatus.SCHEDULED)) {
            throw new IllegalStateException("Cannot update an active or completed challenge");
        }

        challenge.setTitle(request.getTitle());
        challenge.setDescription(request.getDescription());
        challenge.setStartDate(request.getStartDate());
        challenge.setEndDate(request.getEndDate());
        challenge.setTargetStudyTime(request.getTargetStudyTime());
        challenge.setTargetStudyDays(request.getTargetStudyDays());

        challenge.getTags().clear();
        if (request.getTags() != null) {
            challenge.getTags().addAll(request.getTags());
        }

        StudyChallenge updated = studyChallengeRepository.save(challenge);
        return StudyChallengeDto.Response.from(updated, true);
    }

    @Transactional
    public void deleteChallenge(Long userId, Long challengeId) {
        StudyChallenge challenge = studyChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + challengeId));

        if (!challenge.getCreator().getId().equals(userId)) {
            throw new AccessDeniedException("Only the creator can delete this challenge");
        }

        studyChallengeRepository.delete(challenge);
    }

    public StudyChallengeDto.DetailResponse getChallengeDetail(Long userId, Long challengeId) {
        StudyChallenge challenge = studyChallengeRepository.findByIdWithCreator(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + challengeId));

        boolean isParticipating = participantRepository.existsByChallengeIdAndUserId(challengeId, userId);
        ChallengeParticipant userParticipation = null;
        
        if (isParticipating) {
            userParticipation = participantRepository.findByChallengeIdAndUserId(challengeId, userId)
                    .orElse(null);
        }

        return StudyChallengeDto.DetailResponse.from(challenge, isParticipating, userParticipation);
    }

    public Page<StudyChallengeDto.Response> getMyChallenges(Long userId, Pageable pageable) {
        Page<StudyChallenge> challenges = studyChallengeRepository.findByCreatorId(userId, pageable);
        return challenges.map(challenge -> StudyChallengeDto.Response.from(challenge, true));
    }

    public Page<StudyChallengeDto.Response> getParticipatingChallenges(Long userId, Pageable pageable) {
        Page<StudyChallenge> challenges = studyChallengeRepository.findByParticipantId(userId, pageable);
        return challenges.map(challenge -> StudyChallengeDto.Response.from(challenge, true));
    }

    public Page<StudyChallengeDto.Response> getActiveChallenges(Pageable pageable) {
        Page<StudyChallenge> challenges = studyChallengeRepository.findByStatus(
                StudyChallenge.ChallengeStatus.ACTIVE, pageable);
        return challenges.map(challenge -> {
            boolean isParticipating = participantRepository.existsByChallengeIdAndUserId(challenge.getId(), null);
            return StudyChallengeDto.Response.from(challenge, isParticipating);
        });
    }

    public Page<StudyChallengeDto.Response> searchChallenges(String keyword, Pageable pageable) {
        Page<StudyChallenge> challenges = studyChallengeRepository.searchActiveChallenges(keyword, pageable);
        return challenges.map(challenge -> {
            boolean isParticipating = participantRepository.existsByChallengeIdAndUserId(challenge.getId(), null);
            return StudyChallengeDto.Response.from(challenge, isParticipating);
        });
    }

    public Page<StudyChallengeDto.Response> getChallengesByTag(String tag, Pageable pageable) {
        Page<StudyChallenge> challenges = studyChallengeRepository.findActiveByTag(tag, pageable);
        return challenges.map(challenge -> {
            boolean isParticipating = participantRepository.existsByChallengeIdAndUserId(challenge.getId(), null);
            return StudyChallengeDto.Response.from(challenge, isParticipating);
        });
    }

    @Transactional
    public StudyChallengeDto.Response joinChallenge(Long userId, Long challengeId) {
        StudyChallenge challenge = studyChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + challengeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (participantRepository.existsByChallengeIdAndUserId(challengeId, userId)) {
            throw new IllegalStateException("User is already participating in this challenge");
        }

        if (!challenge.isActive()) {
            throw new IllegalStateException("Cannot join a challenge that is not active");
        }

        challenge.addParticipant(user);
        studyChallengeRepository.save(challenge);
        
        return StudyChallengeDto.Response.from(challenge, true);
    }

    @Transactional
    public void leaveChallenge(Long userId, Long challengeId) {
        ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserId(challengeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        if (participant.getChallenge().getCreator().getId().equals(userId)) {
            throw new IllegalStateException("The creator cannot leave the challenge");
        }

        participant.leaveChallenge();
        participantRepository.save(participant);
    }

    @Transactional
    public StudyChallengeDto.ParticipantResponse updateProgress(Long userId, Long challengeId, Long studyRecordId) {
        ChallengeParticipant participant = participantRepository.findByChallengeIdAndUserId(challengeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        if (participant.getChallenge().isEnded()) {
            throw new IllegalStateException("Cannot update progress for an ended challenge");
        }

        if (!participant.getStatus().equals(ChallengeParticipant.ParticipantStatus.JOINED)) {
            throw new IllegalStateException("Cannot update progress for non-active participant");
        }

        StudyRecord studyRecord = studyRecordRepository.findById(studyRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Study record not found with id: " + studyRecordId));

        if (!studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Cannot use another user's study record");
        }

        // 학습 시간을 분 단위로 계산
        long studyTimeInMinutes = studyRecord.getStudyTime();
        participant.updateProgress(studyTimeInMinutes);
        
        // 목표 달성 확인
        if (participant.getCompletedStudyTime() >= participant.getChallenge().getTargetStudyTime() &&
                participant.getCompletedStudyDays() >= participant.getChallenge().getTargetStudyDays()) {
            participant.completeChallenge();
        }
        
        participantRepository.save(participant);
        
        return StudyChallengeDto.ParticipantResponse.from(participant);
    }

    public List<StudyChallengeDto.ParticipantResponse> getTopParticipants(Long challengeId, Pageable pageable) {
        Page<ChallengeParticipant> participants = participantRepository.findTopParticipantsByChallenge(challengeId, pageable);
        return participants.stream()
                .map(StudyChallengeDto.ParticipantResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void processScheduledChallenges() {
        LocalDate today = LocalDate.now();
        
        // 시작 예정인 챌린지 처리
        List<StudyChallenge> challengesToStart = studyChallengeRepository.findChallengesToStart(today);
        for (StudyChallenge challenge : challengesToStart) {
            challenge.startChallenge();
            studyChallengeRepository.save(challenge);
        }
        
        // 종료 예정인 챌린지 처리
        List<StudyChallenge> challengesToComplete = studyChallengeRepository.findChallengesToComplete(today);
        for (StudyChallenge challenge : challengesToComplete) {
            challenge.completeChallenge();
            studyChallengeRepository.save(challenge);
            
            // 참가자 상태 업데이트
            List<ChallengeParticipant> participants = participantRepository.findAllByChallengeId(challenge.getId());
            for (ChallengeParticipant participant : participants) {
                if (participant.getStatus() == ChallengeParticipant.ParticipantStatus.JOINED) {
                    if (participant.getCompletedStudyTime() >= challenge.getTargetStudyTime() &&
                            participant.getCompletedStudyDays() >= challenge.getTargetStudyDays()) {
                        participant.completeChallenge();
                    } else {
                        participant.failChallenge();
                    }
                    participantRepository.save(participant);
                }
            }
        }
    }

    public List<String> getPopularTags(Pageable pageable) {
        return studyChallengeRepository.findPopularChallengeTags(pageable);
    }
    
    public Page<StudyChallengeDto.Response> getChallengesWithLessParticipants(int limit, Long userId, Pageable pageable) {
        Page<StudyChallenge> challenges = studyChallengeRepository.findActiveWithParticipantsLessThan(limit, pageable);
        return challenges.map(challenge -> {
            boolean isParticipating = userId != null && 
                    participantRepository.existsByChallengeIdAndUserId(challenge.getId(), userId);
            return StudyChallengeDto.Response.from(challenge, isParticipating);
        });
    }
} 