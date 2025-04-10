package com.studyrecord.backend.repository;

import com.studyrecord.backend.domain.StudyRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyRecordRepository extends JpaRepository<StudyRecord, Long> {
    List<StudyRecord> findAllByOrderByCreatedAtDesc();
    List<StudyRecord> findAllByUserUsername(String username);
    void deleteAllByUserId(Long userId);
} 