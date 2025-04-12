package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.Todo;
import com.studyrecord.backend.entity.TodoPeriod;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findAllByPeriodOrderByDueDateAsc(TodoPeriod period);
    List<Todo> findAllByOrderByDueDateAsc();
    List<Todo> findAllByUserUsername(String username);
    void deleteAllByUserId(Long userId);
} 