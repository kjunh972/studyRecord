package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyBuddyDto;
import com.studyrecord.backend.dto.UserDto;
import com.studyrecord.backend.entity.StudyBuddy;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.repository.StudyBuddyRepository;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyBuddyService {

    private final StudyBuddyRepository studyBuddyRepository;
    private final UserRepository userRepository;
    private final StudyRecordRepository studyRecordRepository;

    /**
     * 친구 요청 보내기
     */
    @Transactional
    public StudyBuddyDto.Response sendBuddyRequest(Long userId, StudyBuddyDto.Request request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        User buddy = userRepository.findById(request.getBuddyId())
                .orElseThrow(() -> new IllegalArgumentException("친구로 추가할 사용자를 찾을 수 없습니다."));
        
        // 자기 자신에게 친구 요청 불가
        if (user.getId().equals(buddy.getId())) {
            throw new IllegalArgumentException("자기 자신에게 친구 요청을 보낼 수 없습니다.");
        }
        
        // 이미 친구 관계인지 확인
        if (studyBuddyRepository.existsBuddyRelationship(user, buddy)) {
            throw new IllegalArgumentException("이미 친구 관계입니다.");
        }
        
        // 이미 요청이 있는지 확인
        studyBuddyRepository.findByUserAndBuddy(user, buddy)
                .ifPresent(sb -> {
                    throw new IllegalArgumentException("이미 친구 요청을 보냈습니다.");
                });
        
        StudyBuddy studyBuddy = StudyBuddy.builder()
                .user(user)
                .buddy(buddy)
                .status(StudyBuddy.BuddyStatus.PENDING)
                .build();
        
        return StudyBuddyDto.Response.from(studyBuddyRepository.save(studyBuddy));
    }

    /**
     * 친구 요청 수락
     */
    @Transactional
    public StudyBuddyDto.Response acceptBuddyRequest(Long userId, Long requestId) {
        StudyBuddy studyBuddy = studyBuddyRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("해당 친구 요청을 찾을 수 없습니다."));
        
        // 요청 수신자가 맞는지 확인
        if (!studyBuddy.getBuddy().getId().equals(userId)) {
            throw new AccessDeniedException("해당 요청을 수락할 권한이 없습니다.");
        }
        
        // 이미 수락/거절된 요청인지 확인
        if (studyBuddy.getStatus() != StudyBuddy.BuddyStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 요청입니다.");
        }
        
        studyBuddy.accept();
        return StudyBuddyDto.Response.from(studyBuddy);
    }

    /**
     * 친구 요청 거절
     */
    @Transactional
    public StudyBuddyDto.Response rejectBuddyRequest(Long userId, Long requestId) {
        StudyBuddy studyBuddy = studyBuddyRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("해당 친구 요청을 찾을 수 없습니다."));
        
        // 요청 수신자가 맞는지 확인
        if (!studyBuddy.getBuddy().getId().equals(userId)) {
            throw new AccessDeniedException("해당 요청을 거절할 권한이 없습니다.");
        }
        
        // 이미 수락/거절된 요청인지 확인
        if (studyBuddy.getStatus() != StudyBuddy.BuddyStatus.PENDING) {
            throw new IllegalArgumentException("이미 처리된 요청입니다.");
        }
        
        studyBuddy.reject();
        return StudyBuddyDto.Response.from(studyBuddy);
    }

    /**
     * 친구 삭제
     */
    @Transactional
    public void removeBuddy(Long userId, Long buddyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        User buddy = userRepository.findById(buddyId)
                .orElseThrow(() -> new IllegalArgumentException("친구를 찾을 수 없습니다."));
        
        StudyBuddy studyBuddy = studyBuddyRepository.findBuddyRelationship(user, buddy)
                .orElseThrow(() -> new IllegalArgumentException("해당 친구 관계를 찾을 수 없습니다."));
        
        // 친구 관계가 수락 상태인지 확인
        if (studyBuddy.getStatus() != StudyBuddy.BuddyStatus.ACCEPTED) {
            throw new IllegalArgumentException("친구 관계가 아닙니다.");
        }
        
        // 본인이 요청을 보내거나 받은 친구 관계만 삭제 가능
        if (!studyBuddy.getUser().getId().equals(userId) && !studyBuddy.getBuddy().getId().equals(userId)) {
            throw new AccessDeniedException("해당 친구 관계를 삭제할 권한이 없습니다.");
        }
        
        studyBuddyRepository.delete(studyBuddy);
    }

    /**
     * 사용자의 모든 친구 목록 조회
     */
    public StudyBuddyDto.BuddyListResponse getBuddies(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        List<StudyBuddy> buddyRelationships = studyBuddyRepository.findAllBuddiesByUser(user);
        List<User> buddies = new ArrayList<>();
        
        for (StudyBuddy sb : buddyRelationships) {
            if (sb.getUser().getId().equals(userId)) {
                buddies.add(sb.getBuddy());
            } else {
                buddies.add(sb.getUser());
            }
        }
        
        // 각 친구의 학습 정보 조회
        List<StudyBuddyDto.BuddyInfo> buddyInfos = buddies.stream().map(buddy -> {
            // 총 학습 시간
            int totalStudyTime = studyRecordRepository.findByUserId(buddy.getId()).stream()
                    .mapToInt(StudyRecord::getStudyTime)
                    .sum();
            
            // 연속 학습일 (간단한 계산)
            int studyStreakDays = 0; // 복잡한 계산은 생략
            
            // 마지막 활동 시간
            LocalDateTime lastActivity = studyRecordRepository.findByUserId(buddy.getId()).stream()
                    .max(Comparator.comparing(StudyRecord::getCreatedAt))
                    .map(StudyRecord::getCreatedAt)
                    .orElse(null);
            
            return StudyBuddyDto.BuddyInfo.from(
                    UserDto.BasicInfo.from(buddy),
                    totalStudyTime,
                    studyStreakDays,
                    lastActivity
            );
        }).collect(Collectors.toList());
        
        // 받은 친구 요청 수
        int pendingRequests = studyBuddyRepository.findByBuddyAndStatus(user, StudyBuddy.BuddyStatus.PENDING).size();
        
        return new StudyBuddyDto.BuddyListResponse(
                buddyInfos.size(),
                pendingRequests,
                buddyInfos
        );
    }

    /**
     * 받은 친구 요청 목록 조회
     */
    public List<StudyBuddyDto.Response> getReceivedRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return studyBuddyRepository.findByBuddyAndStatus(user, StudyBuddy.BuddyStatus.PENDING)
                .stream()
                .map(StudyBuddyDto.Response::from)
                .collect(Collectors.toList());
    }

    /**
     * 보낸 친구 요청 목록 조회
     */
    public List<StudyBuddyDto.Response> getSentRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return studyBuddyRepository.findByUserAndStatus(user, StudyBuddy.BuddyStatus.PENDING)
                .stream()
                .map(StudyBuddyDto.Response::from)
                .collect(Collectors.toList());
    }
} 