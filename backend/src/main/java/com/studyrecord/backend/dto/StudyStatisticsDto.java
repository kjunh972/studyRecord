package com.studyrecord.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyStatisticsDto {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStats {
        private LocalDate date;
        private Long totalStudyTime; // 분 단위
        private Integer recordCount;
        private Double averageSessionTime;
        private List<String> tags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStats {
        private LocalDate startDate;
        private LocalDate endDate;
        private Long totalStudyTime; // 분 단위
        private Integer recordCount;
        private Double averageStudyTimePerDay;
        private Integer studyDaysCount;
        private List<DailyStats> dailyBreakdown;
        private List<String> mostUsedTags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStats {
        private Integer year;
        private Integer month;
        private Long totalStudyTime; // 분 단위
        private Integer recordCount;
        private Double averageStudyTimePerDay;
        private Integer studyDaysCount;
        private List<WeeklyStats> weeklyBreakdown;
        private List<String> mostUsedTags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyStats {
        private Integer year;
        private Long totalStudyTime; // 분 단위
        private Integer recordCount;
        private Double averageStudyTimePerMonth;
        private Integer studyDaysCount;
        private List<MonthlyStats> monthlyBreakdown;
        private List<String> mostUsedTags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverallStats {
        private LocalDate firstRecordDate;
        private Long totalStudyTime; // 분 단위
        private Integer recordCount;
        private Double averageStudyTimePerDay;
        private Integer studyDaysCount;
        private Integer totalDaysCount;
        private Double studyConsistency; // 전체 일수 대비 학습일 비율
        private List<String> mostUsedTags;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudyStreak {
        private Integer currentStreak; // 현재 연속 학습일
        private Integer longestStreak; // 최장 연속 학습일
        private LocalDate lastStudyDate; // 마지막 학습일
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagStats {
        private String tag;
        private Long totalStudyTime; // 분 단위
        private Integer recordCount;
        private LocalDate firstUsedDate;
        private LocalDate lastUsedDate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonStats {
        private Long previousPeriodStudyTime; // 이전 기간 학습 시간
        private Long currentPeriodStudyTime; // 현재 기간 학습 시간
        private Double percentageChange; // 변화율 (%)
        private boolean isImproved; // 향상 여부
    }
} 