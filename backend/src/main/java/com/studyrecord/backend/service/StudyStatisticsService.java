package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyStatisticsDto;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.repository.StudyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyStatisticsService {

    private final StudyRecordRepository studyRecordRepository;

    public StudyStatisticsDto.DailyStats getDailyStats(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startOfDay, endOfDay);

        int totalStudyTime = records.stream()
                .mapToInt(StudyRecord::getStudyTime)
                .sum();

        List<String> tags = records.stream()
                .flatMap(record -> record.getTags().stream())
                .distinct()
                .collect(Collectors.toList());

        return StudyStatisticsDto.DailyStats.builder()
                .date(date)
                .totalStudyTime((long) totalStudyTime)
                .recordCount(records.size())
                .averageSessionTime(records.isEmpty() ? 0.0 : (double) totalStudyTime / records.size())
                .tags(tags)
                .build();
    }

    public StudyStatisticsDto.WeeklyStats getWeeklyStats(Long userId, LocalDate startDate) {
        LocalDateTime startOfWeek = startDate.atStartOfDay();
        LocalDateTime endOfWeek = startDate.plusWeeks(1).atStartOfDay();

        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startOfWeek, endOfWeek);

        int totalStudyTime = records.stream()
                .mapToInt(StudyRecord::getStudyTime)
                .sum();

        Map<String, Integer> tagFrequency = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.groupingBy(
                        tag -> tag,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        return StudyStatisticsDto.WeeklyStats.builder()
                .startDate(startDate)
                .endDate(startDate.plusDays(6))
                .totalStudyTime((long) totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerDay((double) totalStudyTime / 7)
                .studyDaysCount((int)records.stream()
                        .map(record -> record.getCreatedAt().toLocalDate())
                        .distinct()
                        .count())
                .mostUsedTags(tagFrequency.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                        .limit(5)
                        .map(Map.Entry::getKey)
                        .collect(Collectors.toList()))
                .build();
    }

    public StudyStatisticsDto.MonthlyStats getMonthlyStats(Long userId, int year, int month) {
        LocalDateTime startOfMonth = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1);

        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startOfMonth, endOfMonth);

        int totalStudyTime = records.stream()
                .mapToInt(StudyRecord::getStudyTime)
                .sum();

        Map<String, Integer> tagFrequency = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.groupingBy(
                        tag -> tag,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        List<String> mostUsedTags = tagFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return StudyStatisticsDto.MonthlyStats.builder()
                .year(year)
                .month(month)
                .totalStudyTime((long) totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerDay((double) totalStudyTime / startOfMonth.toLocalDate().lengthOfMonth())
                .studyDaysCount((int)records.stream()
                        .map(record -> record.getCreatedAt().toLocalDate())
                        .distinct()
                        .count())
                .mostUsedTags(mostUsedTags)
                .build();
    }

    public StudyStatisticsDto.YearlyStats getYearlyStats(Long userId, int year) {
        LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endOfYear = startOfYear.plusYears(1);

        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startOfYear, endOfYear);

        int totalStudyTime = records.stream()
                .mapToInt(StudyRecord::getStudyTime)
                .sum();

        Map<Integer, Integer> monthlyStudyTime = records.stream()
                .collect(Collectors.groupingBy(
                        record -> record.getCreatedAt().getMonthValue(),
                        Collectors.summingInt(StudyRecord::getStudyTime)
                ));

        Map<String, Integer> tagFrequency = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.groupingBy(
                        tag -> tag,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        List<String> mostUsedTags = tagFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return StudyStatisticsDto.YearlyStats.builder()
                .year(year)
                .totalStudyTime((long) totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerMonth((double) totalStudyTime / 12)
                .studyDaysCount((int)records.stream()
                        .map(record -> record.getCreatedAt().toLocalDate())
                        .distinct()
                        .count())
                .mostUsedTags(mostUsedTags)
                .build();
    }

    public StudyStatisticsDto.OverallStats getOverallStats(Long userId) {
        List<StudyRecord> records = studyRecordRepository.findByUserId(userId);

        if (records.isEmpty()) {
            return StudyStatisticsDto.OverallStats.builder()
                    .totalStudyTime(0L)
                    .recordCount(0)
                    .averageStudyTimePerDay(0.0)
                    .studyDaysCount(0)
                    .totalDaysCount(0)
                    .studyConsistency(0.0)
                    .mostUsedTags(new ArrayList<>())
                    .build();
        }

        int totalStudyTime = records.stream()
                .mapToInt(StudyRecord::getStudyTime)
                .sum();

        Map<String, Integer> tagFrequency = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.groupingBy(
                        tag -> tag,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        List<String> mostUsedTags = tagFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        LocalDateTime firstRecordDate = records.stream()
                .min(Comparator.comparing(StudyRecord::getCreatedAt))
                .map(StudyRecord::getCreatedAt)
                .orElse(null);

        LocalDateTime lastRecordDate = records.stream()
                .max(Comparator.comparing(StudyRecord::getCreatedAt))
                .map(StudyRecord::getCreatedAt)
                .orElse(null);

        return StudyStatisticsDto.OverallStats.builder()
                .firstRecordDate(firstRecordDate != null ? firstRecordDate.toLocalDate() : null)
                .totalStudyTime((long) totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerDay((double) totalStudyTime / 
                        (ChronoUnit.DAYS.between(
                             records.stream()
                                 .min(Comparator.comparing(StudyRecord::getCreatedAt))
                                 .map(record -> record.getCreatedAt().toLocalDate())
                                 .orElse(LocalDate.now()),
                             LocalDate.now()) + 1))
                .studyDaysCount((int)records.stream()
                        .map(record -> record.getCreatedAt().toLocalDate())
                        .distinct()
                        .count())
                .totalDaysCount((int)ChronoUnit.DAYS.between(
                        records.stream()
                            .min(Comparator.comparing(StudyRecord::getCreatedAt))
                            .map(record -> record.getCreatedAt().toLocalDate())
                            .orElse(LocalDate.now()),
                        LocalDate.now()) + 1)
                .studyConsistency((double)records.stream()
                        .map(record -> record.getCreatedAt().toLocalDate())
                        .distinct()
                        .count() / 
                        (ChronoUnit.DAYS.between(
                            records.stream()
                                .min(Comparator.comparing(StudyRecord::getCreatedAt))
                                .map(record -> record.getCreatedAt().toLocalDate())
                                .orElse(LocalDate.now()),
                            LocalDate.now()) + 1) * 100)
                .mostUsedTags(mostUsedTags)
                .build();
    }
} 