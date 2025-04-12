package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyCalendarDto;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.repository.StudyRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyCalendarService {

    private final StudyRecordRepository studyRecordRepository;

    /**
     * 특정 월의 학습 기록 달력을 생성합니다.
     */
    public StudyCalendarDto.MonthlyCalendar getMonthlyCalendar(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        // 해당 월의 모든 학습 기록 조회
        List<StudyRecord> monthlyRecords = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId,
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
        
        // 날짜별 학습 기록 그룹화
        Map<LocalDate, List<StudyRecord>> recordsByDate = monthlyRecords.stream()
                .collect(Collectors.groupingBy(record -> record.getCreatedAt().toLocalDate()));
        
        // 날짜별 학습 정보 생성
        Map<Integer, StudyCalendarDto.DailyStudy> dailyStudies = new HashMap<>();
        int totalStudyTime = 0;
        
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate date = yearMonth.atDay(day);
            List<StudyRecord> dayRecords = recordsByDate.getOrDefault(date, Collections.emptyList());
            
            if (!dayRecords.isEmpty()) {
                int dayTotalStudyTime = dayRecords.stream()
                        .mapToInt(StudyRecord::getStudyTime)
                        .sum();
                
                Set<String> uniqueTags = new HashSet<>();
                dayRecords.forEach(record -> uniqueTags.addAll(record.getTags()));
                
                dailyStudies.put(day, StudyCalendarDto.DailyStudy.builder()
                        .date(date)
                        .totalStudyTime(dayTotalStudyTime)
                        .recordCount(dayRecords.size())
                        .tags(new ArrayList<>(uniqueTags))
                        .build());
                
                totalStudyTime += dayTotalStudyTime;
            }
        }
        
        return StudyCalendarDto.MonthlyCalendar.builder()
                .year(year)
                .month(month)
                .totalDays(yearMonth.lengthOfMonth())
                .totalStudyDays(dailyStudies.size())
                .totalStudyTime(totalStudyTime)
                .dailyStudies(dailyStudies)
                .build();
    }

    /**
     * 특정 연도의 학습 기록 달력을 생성합니다.
     */
    public StudyCalendarDto.YearlyCalendar getYearlyCalendar(Long userId, int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        // 해당 연도의 모든 학습 기록 조회
        List<StudyRecord> yearlyRecords = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId,
                startDate.atStartOfDay(),
                endDate.plusDays(1).atStartOfDay()
        );
        
        // 월별 학습 기록 그룹화
        Map<Integer, List<StudyRecord>> recordsByMonth = yearlyRecords.stream()
                .collect(Collectors.groupingBy(record -> record.getCreatedAt().getMonthValue()));
        
        // 월별 학습 시간 계산
        Map<Integer, Integer> monthlyStudyTimes = new HashMap<>();
        Map<Integer, Integer> monthlyStudyDays = new HashMap<>();
        
        int totalStudyTime = 0;
        Set<LocalDate> studyDays = new HashSet<>();
        
        for (int month = 1; month <= 12; month++) {
            List<StudyRecord> monthRecords = recordsByMonth.getOrDefault(month, Collections.emptyList());
            
            int monthTotalStudyTime = monthRecords.stream()
                    .mapToInt(StudyRecord::getStudyTime)
                    .sum();
            
            Set<LocalDate> daysInMonth = monthRecords.stream()
                    .map(record -> record.getCreatedAt().toLocalDate())
                    .collect(Collectors.toSet());
            
            monthlyStudyTimes.put(month, monthTotalStudyTime);
            monthlyStudyDays.put(month, daysInMonth.size());
            
            totalStudyTime += monthTotalStudyTime;
            studyDays.addAll(daysInMonth);
        }
        
        return StudyCalendarDto.YearlyCalendar.builder()
                .year(year)
                .totalStudyDays(studyDays.size())
                .totalStudyTime(totalStudyTime)
                .monthlyStudyTimes(monthlyStudyTimes)
                .monthlyStudyDays(monthlyStudyDays)
                .build();
    }
} 