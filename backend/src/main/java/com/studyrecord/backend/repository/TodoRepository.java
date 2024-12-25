package com.studyrecord.backend.repository;

import com.studyrecord.backend.domain.Todo;
import com.studyrecord.backend.domain.TodoPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findAllByPeriodOrderByDueDateAsc(TodoPeriod period);
    List<Todo> findAllByOrderByDueDateAsc();
} 