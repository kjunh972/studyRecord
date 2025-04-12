package com.studyrecord.backend.service;

import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.dto.AuthResponse;
import com.studyrecord.backend.dto.LoginRequest;
import com.studyrecord.backend.dto.SignUpRequest;
import com.studyrecord.backend.repository.UserRepository;
import com.studyrecord.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public void signup(SignUpRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 존재하는 아이디입니다");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .birthdate(request.getBirthdate())
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return AuthResponse.builder()
            .token(token)
            .user(AuthResponse.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .build())
            .build();
    }
} 