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
                user.setEmail("test@example.com");
                user.setPassword("password");
                user.setUsername("Test User");
                userRepository.save(user);
            }
        };
    }
} 