package com.studyrecord.backend.service;

import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.dto.*;
import com.studyrecord.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.studyrecord.backend.exception.ResourceNotFoundException;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.TodoRepository;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudyRecordRepository studyRecordRepository;
    private final TodoRepository todoRepository;

    @Transactional(readOnly = true)
    public UserResponse getMyInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateProfile(UserUpdateRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        user.updateProfile(request.getName(), request.getPhone(), request.getBirthdate());
        return UserResponse.from(user);
    }

    @Transactional
    public void updatePassword(PasswordUpdateRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional
    public void deleteAccount(Long userId, String currentPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 사용자의 모든 학습 기록 삭제
        studyRecordRepository.deleteAllByUserId(userId);
        
        // 사용자의 모든 할 일 목록 삭제
        todoRepository.deleteAllByUserId(userId);
        
        // 사용자 계정 삭제
        userRepository.delete(user);
    }
} 