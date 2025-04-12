package com.studyrecord.backend.config;

import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        if (userRepository.count() == 0) {
            User adminUser = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin972@"))
                .name("관리자")
                .phone("010-0000-0000")
                .birthdate("2001-03-17")
                .build();

            userRepository.save(adminUser);
        }
    }
} 