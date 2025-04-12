package com.studyrecord.backend.repository;

import com.studyrecord.backend.entity.StudyBuddy;
import com.studyrecord.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyBuddyRepository extends JpaRepository<StudyBuddy, Long> {
    
    // 사용자의 모든 친구 관계 조회 (수락된 상태만)
    @Query("SELECT sb FROM StudyBuddy sb WHERE (sb.user = :user OR sb.buddy = :user) AND sb.status = 'ACCEPTED'")
    List<StudyBuddy> findAllBuddiesByUser(@Param("user") User user);
    
    // 보낸 친구 요청 목록 조회
    List<StudyBuddy> findByUserAndStatus(User user, StudyBuddy.BuddyStatus status);
    
    // 받은 친구 요청 목록 조회
    List<StudyBuddy> findByBuddyAndStatus(User buddy, StudyBuddy.BuddyStatus status);
    
    // 특정 친구 관계 찾기
    Optional<StudyBuddy> findByUserAndBuddy(User user, User buddy);
    
    // 양방향 친구 관계 찾기
    @Query("SELECT sb FROM StudyBuddy sb WHERE (sb.user = :user1 AND sb.buddy = :user2) OR (sb.user = :user2 AND sb.buddy = :user1)")
    Optional<StudyBuddy> findBuddyRelationship(@Param("user1") User user1, @Param("user2") User user2);
    
    // 친구 관계 여부 확인
    @Query("SELECT COUNT(sb) > 0 FROM StudyBuddy sb WHERE ((sb.user = :user1 AND sb.buddy = :user2) OR (sb.user = :user2 AND sb.buddy = :user1)) AND sb.status = 'ACCEPTED'")
    boolean existsBuddyRelationship(@Param("user1") User user1, @Param("user2") User user2);
} 