package com.studyrecord.backend.repository;

import com.studyrecord.backend.domain.StudyRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudyRecordRepository extends JpaRepository<StudyRecord, Long> {
    List<StudyRecord> findAllByOrderByCreatedAtDesc();
} 