package com.studyrecord.backend.config;

import com.studyrecord.backend.domain.User;
import com.studyrecord.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                User user = new User();
                user.setUsername("testuser");
                user.setName("Test User");
                user.setPassword("password");
                user.setPhone("010-1234-5678");
                user.setBirthdate("2000-01-01");
                userRepository.save(user);
            }
        };
    }
} 