package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyRecordDto;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.repository.StudyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 학습 기록 분석 및 추천 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyAnalysisService {

    private final StudyRecordRepository studyRecordRepository;

    /**
     * 최적 학습 시간대를 분석합니다.
     * 사용자가 가장 많은 학습 시간을 기록한 시간대를 찾습니다.
     */
    public Map<Integer, Integer> analyzeBestStudyHours(Long userId) {
        List<StudyRecord> records = studyRecordRepository.findByUserId(userId);
        
        Map<Integer, Integer> hourlyStudyTime = new HashMap<>();
        
        // 시간대별 학습 시간 합계 계산
        for (StudyRecord record : records) {
            LocalDateTime createdAt = record.getCreatedAt();
            int hour = createdAt.getHour();
            
            hourlyStudyTime.put(hour, hourlyStudyTime.getOrDefault(hour, 0) + record.getStudyTime());
        }
        
        return hourlyStudyTime.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    /**
     * 가장 학습 효율이 좋은 요일을 분석합니다.
     * 요일별 평균 학습 시간을 계산합니다.
     */
    public Map<DayOfWeek, Double> analyzeBestStudyDays(Long userId) {
        List<StudyRecord> records = studyRecordRepository.findByUserId(userId);
        
        Map<DayOfWeek, List<Integer>> dayStudyTimes = new HashMap<>();
        
        // 요일별 학습 시간 수집
        for (StudyRecord record : records) {
            DayOfWeek dayOfWeek = record.getCreatedAt().getDayOfWeek();
            
            if (!dayStudyTimes.containsKey(dayOfWeek)) {
                dayStudyTimes.put(dayOfWeek, new ArrayList<>());
            }
            
            dayStudyTimes.get(dayOfWeek).add(record.getStudyTime());
        }
        
        // 요일별 평균 학습 시간 계산
        Map<DayOfWeek, Double> averageStudyTimeByDay = new HashMap<>();
        for (Map.Entry<DayOfWeek, List<Integer>> entry : dayStudyTimes.entrySet()) {
            double average = entry.getValue().stream()
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);
            
            averageStudyTimeByDay.put(entry.getKey(), average);
        }
        
        return averageStudyTimeByDay.entrySet().stream()
                .sorted(Map.Entry.<DayOfWeek, Double>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    /**
     * 학습 패턴을 분석하여 추천 학습 계획을 생성합니다.
     */
    public List<StudyRecommendation> generateStudyRecommendations(Long userId) {
        Map<Integer, Integer> bestHours = analyzeBestStudyHours(userId);
        Map<DayOfWeek, Double> bestDays = analyzeBestStudyDays(userId);
        List<String> popularTags = studyRecordRepository.findPopularTagsByUserId(userId);
        
        List<StudyRecommendation> recommendations = new ArrayList<>();
        
        // 가장 효율적인 학습 시간 추천
        if (!bestHours.isEmpty()) {
            int bestHour = bestHours.keySet().iterator().next();
            recommendations.add(new StudyRecommendation(
                    "최적 학습 시간",
                    String.format("통계에 따르면 %d시에 가장 많은 학습을 하셨습니다. 이 시간대에 중요한 학습을 계획해보세요.", bestHour),
                    RecommendationType.TIME
            ));
        }
        
        // 가장 효율적인 학습 요일 추천
        if (!bestDays.isEmpty()) {
            DayOfWeek bestDay = bestDays.keySet().iterator().next();
            String koreanDay = getKoreanDayOfWeek(bestDay);
            recommendations.add(new StudyRecommendation(
                    "최적 학습 요일",
                    String.format("%s에 가장 오랜 시간 학습하는 경향이 있습니다. 중요한 과제는 %s에 계획해보세요.", koreanDay, koreanDay),
                    RecommendationType.DAY
            ));
        }
        
        // 학습 태그 기반 추천
        if (!popularTags.isEmpty() && popularTags.size() >= 2) {
            String mostPopularTag = popularTags.get(0);
            String secondPopularTag = popularTags.get(1);
            recommendations.add(new StudyRecommendation(
                    "학습 주제 추천",
                    String.format("최근 '%s'와(과) '%s' 주제를 많이 학습하셨습니다. 이 주제들을 연계하여 학습하면 더 효과적일 수 있습니다.", 
                            mostPopularTag, secondPopularTag),
                    RecommendationType.TOPIC
            ));
        }
        
        // 일관성 있는 학습 추천
        recommendations.add(new StudyRecommendation(
                "일관성 있는 학습",
                "매일 같은 시간에 일정 시간 학습하는 것이 장기 기억에 효과적입니다. 하루 30분이라도 꾸준히 학습해보세요.",
                RecommendationType.CONSISTENCY
        ));
        
        return recommendations;
    }

    /**
     * 학습 연속성을 분석합니다.
     * 최근 30일 동안 매일 공부한 날이 몇 일인지 계산합니다.
     */
    public StudyStreakInfo analyzeStudyStreak(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        
        List<StudyRecord> recentRecords = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, thirtyDaysAgo, now);
        
        Set<LocalDate> studyDates = recentRecords.stream()
                .map(record -> record.getCreatedAt().toLocalDate())
                .collect(Collectors.toSet());
        
        // 현재 연속 학습일 계산
        int currentStreak = 0;
        LocalDate checkDate = LocalDate.now();
        
        while (studyDates.contains(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }
        
        // 최장 연속 학습일 계산
        int longestStreak = 0;
        int tempStreak = 0;
        
        List<LocalDate> sortedDates = new ArrayList<>(studyDates);
        Collections.sort(sortedDates);
        
        for (int i = 0; i < sortedDates.size(); i++) {
            if (i == 0 || ChronoUnit.DAYS.between(sortedDates.get(i-1), sortedDates.get(i)) == 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            
            longestStreak = Math.max(longestStreak, tempStreak);
        }
        
        return new StudyStreakInfo(
                currentStreak,
                longestStreak,
                studyDates.size(),
                30 - studyDates.size()
        );
    }

    private String getKoreanDayOfWeek(DayOfWeek dayOfWeek) {
        switch (dayOfWeek) {
            case MONDAY: return "월요일";
            case TUESDAY: return "화요일";
            case WEDNESDAY: return "수요일";
            case THURSDAY: return "목요일";
            case FRIDAY: return "금요일";
            case SATURDAY: return "토요일";
            case SUNDAY: return "일요일";
            default: return "";
        }
    }

    public enum RecommendationType {
        TIME, DAY, TOPIC, CONSISTENCY
    }

    @lombok.Value
    public static class StudyRecommendation {
        String title;
        String description;
        RecommendationType type;
    }

    @lombok.Value
    public static class StudyStreakInfo {
        int currentStreak;
        int longestStreak;
        int totalStudyDays;
        int missedDays;
    }
} 