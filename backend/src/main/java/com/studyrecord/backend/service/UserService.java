package com.studyrecord.backend.service;

import com.studyrecord.backend.domain.User;
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

    public void updatePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User updateProfile(Long userId, String name, String phone, String birthdate) {
        User user = getUserById(userId);
        
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (birthdate != null) {
            user.setBirthdate(birthdate);
        }
        
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = getUserById(userId);
        
        // 사용자의 모든 학습 기록 삭제
        studyRecordRepository.deleteAllByUserId(userId);
        
        // 사용자의 모든 할 일 목록 삭제
        todoRepository.deleteAllByUserId(userId);
        
        // 사용자 계정 삭제
        userRepository.delete(user);
    }
} 