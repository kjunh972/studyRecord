package com.studyrecord.backend.dto;

import com.studyrecord.backend.entity.StudyRecord;
import lombok.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public class StudyCalendarDto {
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyStudy {
        private LocalDate date;
        private int totalStudyTime;
        private int recordCount;
        private List<String> tags;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyCalendar {
        private int year;
        private int month;
        private int totalDays;
        private int totalStudyDays;
        private int totalStudyTime;
        private Map<Integer, DailyStudy> dailyStudies; // 날짜(1-31) 기준으로 데이터 매핑
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class YearlyCalendar {
        private int year;
        private int totalStudyDays;
        private int totalStudyTime;
        private Map<Integer, Integer> monthlyStudyTimes; // 월(1-12) 기준으로 학습 시간 매핑
        private Map<Integer, Integer> monthlyStudyDays;  // 월(1-12) 기준으로 학습 일수 매핑
    }
} 