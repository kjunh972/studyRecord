package com.studyrecord.backend.config;

import com.studyrecord.backend.domain.User;
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
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("admin972@"));
            adminUser.setName("관리자");
            adminUser.setPhone("010-0000-0000");
            adminUser.setBirthdate("2001-03-17");

            userRepository.save(adminUser);
        }
    }
} 