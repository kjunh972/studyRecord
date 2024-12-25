package com.studyrecord.backend.repository;

import com.studyrecord.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
} 