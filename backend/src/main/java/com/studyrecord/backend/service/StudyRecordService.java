package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.StudyRecordDto;
import com.studyrecord.backend.dto.StudyStatisticsDto;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.exception.ResourceNotFoundException;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyRecordService {

    private final StudyRecordRepository studyRecordRepository;
    private final UserRepository userRepository;

    @Transactional
    public StudyRecordDto.Response createStudyRecord(Long userId, StudyRecordDto.Request request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        StudyRecord studyRecord = request.toEntity(user);
        return StudyRecordDto.Response.from(studyRecordRepository.save(studyRecord));
    }

    public StudyRecordDto.Response getStudyRecord(Long recordId, Long userId) {
        StudyRecord studyRecord = studyRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("학습 기록을 찾을 수 없습니다."));

        if (!studyRecord.isPublic() && !studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        return StudyRecordDto.Response.from(studyRecord);
    }

    public Page<StudyRecordDto.Response> getStudyRecords(Long userId, Pageable pageable) {
        return studyRecordRepository.findByUserId(userId, pageable)
                .map(StudyRecordDto.Response::from);
    }

    @Transactional(readOnly = true)
    public List<StudyRecordDto.Response> getStudyRecordsByTag(Long userId, String tag) {
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndTagsContaining(userId, tag);
        return records.stream()
                .map(record -> StudyRecordDto.Response.from(record))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getPopularTags(Long userId) {
        return studyRecordRepository.findPopularTagsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<String> getAllTags(Long userId) {
        List<StudyRecord> records = studyRecordRepository.findByUserId(userId);
        return records.stream()
                .flatMap(record -> record.getTags().stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Transactional
    public StudyRecordDto.Response updateStudyRecord(Long recordId, Long userId, StudyRecordDto.Request request) {
        StudyRecord studyRecord = studyRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("학습 기록을 찾을 수 없습니다."));

        if (!studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        studyRecord.update(
            request.getTitle(),
            request.getContent(),
            request.getStudyTime(),
            request.getTags(),
            request.isPublic(),
            request.getEditorMode()
        );

        return StudyRecordDto.Response.from(studyRecord);
    }

    @Transactional
    public void deleteStudyRecord(Long recordId, Long userId) {
        StudyRecord studyRecord = studyRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("학습 기록을 찾을 수 없습니다."));

        if (!studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        studyRecordRepository.delete(studyRecord);
    }

    @Transactional
    public StudyRecordDto.Response updateEditorMode(Long recordId, Long userId, String editorMode) {
        StudyRecord studyRecord = studyRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("학습 기록을 찾을 수 없습니다."));

        if (!studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        studyRecord.updateEditorMode(editorMode);
        return StudyRecordDto.Response.from(studyRecord);
    }

    @Transactional
    public StudyRecordDto.Response updateVisibility(Long recordId, Long userId, boolean isPublic) {
        StudyRecord studyRecord = studyRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("학습 기록을 찾을 수 없습니다."));

        if (!studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("접근 권한이 없습니다.");
        }

        studyRecord.updateVisibility(isPublic);
        return StudyRecordDto.Response.from(studyRecord);
    }

    public StudyStatisticsDto.DailyStats getDailyStats(Long userId, LocalDate date) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 일일 통계를 위한 날짜 범위 설정
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        // 날짜에 해당하는 학습 기록 조회
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startOfDay, endOfDay);
        
        // 총 학습 시간 계산
        Long totalStudyTime = records.stream()
                .mapToLong(StudyRecord::getStudyTime)
                .sum();
        
        // 평균 세션 시간 계산
        double averageSessionTime = 0;
        if (!records.isEmpty()) {
            averageSessionTime = (double) totalStudyTime / records.size();
        }
        
        // 태그 목록 추출
        List<String> tags = records.stream()
                .flatMap(record -> record.getTags().stream())
                .distinct()
                .collect(Collectors.toList());
        
        return StudyStatisticsDto.DailyStats.builder()
                .date(date)
                .totalStudyTime(totalStudyTime)
                .recordCount(records.size())
                .averageSessionTime(averageSessionTime)
                .tags(tags)
                .build();
    }

    public StudyStatisticsDto.WeeklyStats getWeeklyStats(Long userId, LocalDate startDate) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 주간 통계를 위한 날짜 범위 설정
        LocalDate endDate = startDate.plusDays(6);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        
        // 날짜 범위에 해당하는 학습 기록 조회
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startDateTime, endDateTime);
        
        // 총 학습 시간 계산
        Long totalStudyTime = records.stream()
                .mapToLong(StudyRecord::getStudyTime)
                .sum();
        
        // 일별 학습 데이터 구성
        Map<LocalDate, List<StudyRecord>> dailyRecords = records.stream()
                .collect(Collectors.groupingBy(
                        record -> record.getCreatedAt().toLocalDate()));
        
        // 학습한 날짜 수 계산
        int studyDaysCount = dailyRecords.size();
        
        // 일별 통계 생성
        List<StudyStatisticsDto.DailyStats> dailyBreakdown = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            dailyBreakdown.add(getDailyStats(userId, date));
        }
        
        // 평균 일간 학습 시간 계산
        double averageStudyTimePerDay = 0;
        if (studyDaysCount > 0) {
            averageStudyTimePerDay = (double) totalStudyTime / 7;
        }
        
        // 태그 목록 추출 및 가장 많이 사용된 태그 선정
        List<String> allTags = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.toList());
        
        Map<String, Long> tagCounts = allTags.stream()
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));
        
        List<String> mostUsedTags = tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        return StudyStatisticsDto.WeeklyStats.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalStudyTime(totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerDay(averageStudyTimePerDay)
                .studyDaysCount(studyDaysCount)
                .dailyBreakdown(dailyBreakdown)
                .mostUsedTags(mostUsedTags)
                .build();
    }

    public StudyStatisticsDto.MonthlyStats getMonthlyStats(Long userId, int year, int month) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 월간 통계를 위한 날짜 범위 설정
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        
        // 날짜 범위에 해당하는 학습 기록 조회
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startDateTime, endDateTime);
        
        // 총 학습 시간 계산
        Long totalStudyTime = records.stream()
                .mapToLong(StudyRecord::getStudyTime)
                .sum();
        
        // 일별 학습 데이터 구성
        Map<LocalDate, List<StudyRecord>> dailyRecords = records.stream()
                .collect(Collectors.groupingBy(
                        record -> record.getCreatedAt().toLocalDate()));
        
        // 학습한 날짜 수 계산
        int studyDaysCount = dailyRecords.size();
        
        // 주간 통계 구성
        List<StudyStatisticsDto.WeeklyStats> weeklyBreakdown = new ArrayList<>();
        LocalDate current = startDate;
        while (current.getMonthValue() == month) {
            weeklyBreakdown.add(getWeeklyStats(userId, current));
            current = current.plusWeeks(1);
            if (current.isAfter(endDate)) {
                break;
            }
        }
        
        // 평균 일간 학습 시간 계산
        double averageStudyTimePerDay = 0;
        if (studyDaysCount > 0) {
            averageStudyTimePerDay = (double) totalStudyTime / endDate.getDayOfMonth();
        }
        
        // 태그 목록 추출 및 가장 많이 사용된 태그 선정
        List<String> allTags = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.toList());
        
        Map<String, Long> tagCounts = allTags.stream()
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));
        
        List<String> mostUsedTags = tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        return StudyStatisticsDto.MonthlyStats.builder()
                .year(year)
                .month(month)
                .totalStudyTime(totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerDay(averageStudyTimePerDay)
                .studyDaysCount(studyDaysCount)
                .weeklyBreakdown(weeklyBreakdown)
                .mostUsedTags(mostUsedTags)
                .build();
    }

    public StudyStatisticsDto.YearlyStats getYearlyStats(Long userId, int year) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 연간 통계를 위한 날짜 범위 설정
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        
        // 날짜 범위에 해당하는 학습 기록 조회
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
                userId, startDateTime, endDateTime);
        
        // 총 학습 시간 계산
        Long totalStudyTime = records.stream()
                .mapToLong(StudyRecord::getStudyTime)
                .sum();
        
        // 일별 학습 데이터 구성
        Map<LocalDate, List<StudyRecord>> dailyRecords = records.stream()
                .collect(Collectors.groupingBy(
                        record -> record.getCreatedAt().toLocalDate()));
        
        // 학습한 날짜 수 계산
        int studyDaysCount = dailyRecords.size();
        
        // 월간 통계 구성
        List<StudyStatisticsDto.MonthlyStats> monthlyBreakdown = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            monthlyBreakdown.add(getMonthlyStats(userId, year, month));
        }
        
        // 평균 월간 학습 시간 계산
        double averageStudyTimePerMonth = 0;
        if (!monthlyBreakdown.isEmpty()) {
            averageStudyTimePerMonth = (double) totalStudyTime / 12;
        }
        
        // 태그 목록 추출 및 가장 많이 사용된 태그 선정
        List<String> allTags = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.toList());
        
        Map<String, Long> tagCounts = allTags.stream()
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));
        
        List<String> mostUsedTags = tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        return StudyStatisticsDto.YearlyStats.builder()
                .year(year)
                .totalStudyTime(totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerMonth(averageStudyTimePerMonth)
                .studyDaysCount(studyDaysCount)
                .monthlyBreakdown(monthlyBreakdown)
                .mostUsedTags(mostUsedTags)
                .build();
    }

    public StudyStatisticsDto.OverallStats getOverallStats(Long userId) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 모든 학습 기록 조회
        List<StudyRecord> records = studyRecordRepository.findByUserId(userId);
        
        if (records.isEmpty()) {
            return StudyStatisticsDto.OverallStats.builder()
                    .firstRecordDate(null)
                    .totalStudyTime(0L)
                    .recordCount(0)
                    .averageStudyTimePerDay(0.0)
                    .studyDaysCount(0)
                    .totalDaysCount(0)
                    .studyConsistency(0.0)
                    .mostUsedTags(Collections.emptyList())
                    .build();
        }
        
        // 첫 번째 기록 날짜 찾기
        LocalDate firstRecordDate = records.stream()
                .min(Comparator.comparing(StudyRecord::getCreatedAt))
                .map(record -> record.getCreatedAt().toLocalDate())
                .orElse(null);
        
        // 총 학습 시간 계산
        Long totalStudyTime = records.stream()
                .mapToLong(StudyRecord::getStudyTime)
                .sum();
        
        // 일별 학습 데이터 구성
        Map<LocalDate, List<StudyRecord>> dailyRecords = records.stream()
                .collect(Collectors.groupingBy(
                        record -> record.getCreatedAt().toLocalDate()));
        
        // 학습한 날짜 수 계산
        int studyDaysCount = dailyRecords.size();
        
        // 전체 날짜 수 계산 (첫 기록부터 오늘까지)
        LocalDate today = LocalDate.now();
        int totalDaysCount = 0;
        if (firstRecordDate != null) {
            totalDaysCount = (int) (firstRecordDate.until(today).getDays() + 1);
        }
        
        // 학습 일관성 계산 (학습한 날 / 전체 날짜)
        double studyConsistency = 0;
        if (totalDaysCount > 0) {
            studyConsistency = (double) studyDaysCount / totalDaysCount * 100;
        }
        
        // 일평균 학습 시간
        double averageStudyTimePerDay = 0;
        if (totalDaysCount > 0) {
            averageStudyTimePerDay = (double) totalStudyTime / totalDaysCount;
        }
        
        // 태그 목록 추출 및 가장 많이 사용된 태그 선정
        List<String> allTags = records.stream()
                .flatMap(record -> record.getTags().stream())
                .collect(Collectors.toList());
        
        Map<String, Long> tagCounts = allTags.stream()
                .collect(Collectors.groupingBy(tag -> tag, Collectors.counting()));
        
        List<String> mostUsedTags = tagCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        return StudyStatisticsDto.OverallStats.builder()
                .firstRecordDate(firstRecordDate)
                .totalStudyTime(totalStudyTime)
                .recordCount(records.size())
                .averageStudyTimePerDay(averageStudyTimePerDay)
                .studyDaysCount(studyDaysCount)
                .totalDaysCount(totalDaysCount)
                .studyConsistency(studyConsistency)
                .mostUsedTags(mostUsedTags)
                .build();
    }

    public StudyStatisticsDto.StudyStreak getStudyStreak(Long userId) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 연속 학습일 계산을 위한 학습 기록 조회
        List<StudyRecord> records = studyRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        if (records.isEmpty()) {
            return StudyStatisticsDto.StudyStreak.builder()
                    .currentStreak(0)
                    .longestStreak(0)
                    .lastStudyDate(null)
                    .build();
        }
        
        // 날짜별로 학습 여부 정리
        Map<LocalDate, Boolean> studyDays = new HashMap<>();
        records.forEach(record -> {
            LocalDate date = record.getCreatedAt().toLocalDate();
            studyDays.put(date, true);
        });
        
        // 마지막 학습일
        LocalDate lastStudyDate = records.get(0).getCreatedAt().toLocalDate();
        
        // 현재 연속 학습일 계산
        int currentStreak = 0;
        LocalDate today = LocalDate.now();
        LocalDate checkDate = today;
        
        // 오늘 학습했으면 1부터 시작, 아니면 어제부터 확인
        if (studyDays.containsKey(today)) {
            currentStreak = 1;
            checkDate = today.minusDays(1);
        }
        
        while (studyDays.containsKey(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }
        
        // 최장 연속 학습일 계산
        int longestStreak = currentStreak;
        int tempStreak = 0;
        
        // 모든 날짜 정렬
        List<LocalDate> sortedDates = new ArrayList<>(studyDays.keySet());
        Collections.sort(sortedDates);
        
        for (int i = 0; i < sortedDates.size(); i++) {
            if (i == 0 || sortedDates.get(i).isEqual(sortedDates.get(i-1).plusDays(1))) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
        }
        
        return StudyStatisticsDto.StudyStreak.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .lastStudyDate(lastStudyDate)
                .build();
    }
    
    public StudyStatisticsDto.TagStats getTagStats(Long userId, String tag) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                
        // 태그가 포함된 학습 기록 조회
        List<StudyRecord> taggedRecords = studyRecordRepository.findByUserIdAndTagsContaining(userId, tag);
        
        if (taggedRecords.isEmpty()) {
            return StudyStatisticsDto.TagStats.builder()
                    .tag(tag)
                    .totalStudyTime(0L)
                    .recordCount(0)
                    .firstUsedDate(null)
                    .lastUsedDate(null)
                    .build();
        }
        
        // 총 학습 시간
        Long totalStudyTime = taggedRecords.stream()
                .mapToLong(StudyRecord::getStudyTime)
                .sum();
        
        // 첫 사용 날짜와 마지막 사용 날짜
        LocalDate firstUsedDate = taggedRecords.stream()
                .min(Comparator.comparing(StudyRecord::getCreatedAt))
                .map(record -> record.getCreatedAt().toLocalDate())
                .orElse(null);
                
        LocalDate lastUsedDate = taggedRecords.stream()
                .max(Comparator.comparing(StudyRecord::getCreatedAt))
                .map(record -> record.getCreatedAt().toLocalDate())
                .orElse(null);
        
        return StudyStatisticsDto.TagStats.builder()
                .tag(tag)
                .totalStudyTime(totalStudyTime)
                .recordCount(taggedRecords.size())
                .firstUsedDate(firstUsedDate)
                .lastUsedDate(lastUsedDate)
                .build();
    }
    
    public StudyStatisticsDto.ComparisonStats getComparisonStats(
            Long userId, 
            LocalDate prevStart, 
            LocalDate prevEnd, 
            LocalDate currentStart, 
            LocalDate currentEnd) {
        // 사용자 존재 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // 이전 기간 학습 시간
        LocalDateTime prevStartDateTime = prevStart.atStartOfDay();
        LocalDateTime prevEndDateTime = prevEnd.plusDays(1).atStartOfDay();
        
        Long previousPeriodStudyTime = studyRecordRepository.getTotalStudyTimeForPeriod(
                userId, prevStartDateTime, prevEndDateTime);
        
        if (previousPeriodStudyTime == null) {
            previousPeriodStudyTime = 0L;
        }
        
        // 현재 기간 학습 시간
        LocalDateTime currentStartDateTime = currentStart.atStartOfDay();
        LocalDateTime currentEndDateTime = currentEnd.plusDays(1).atStartOfDay();
        
        Long currentPeriodStudyTime = studyRecordRepository.getTotalStudyTimeForPeriod(
                userId, currentStartDateTime, currentEndDateTime);
        
        if (currentPeriodStudyTime == null) {
            currentPeriodStudyTime = 0L;
        }
        
        // 변화율 계산
        double percentageChange = 0.0;
        boolean isImproved = false;
        
        if (previousPeriodStudyTime > 0) {
            percentageChange = ((double) currentPeriodStudyTime - previousPeriodStudyTime) / previousPeriodStudyTime * 100;
            isImproved = currentPeriodStudyTime > previousPeriodStudyTime;
        } else if (currentPeriodStudyTime > 0) {
            percentageChange = 100.0;
            isImproved = true;
        }
        
        return StudyStatisticsDto.ComparisonStats.builder()
                .previousPeriodStudyTime(previousPeriodStudyTime)
                .currentPeriodStudyTime(currentPeriodStudyTime)
                .percentageChange(percentageChange)
                .isImproved(isImproved)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StudyRecordDto.Response> getStudyRecordsByPeriod(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("시작 날짜는 종료 날짜보다 이전이어야 합니다.");
        }
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndCreatedAtBetween(
            userId, startDateTime, endDateTime);
            
        return records.stream()
                .map(record -> StudyRecordDto.Response.from(record))
                .collect(Collectors.toList());
    }

    /**
     * 키워드로 학습 기록을 검색합니다.
     * 제목과 내용에서 검색합니다.
     */
    public Page<StudyRecordDto.Response> searchStudyRecords(Long userId, String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getStudyRecords(userId, pageable);
        }
        return studyRecordRepository.findByUserIdAndKeyword(userId, keyword.trim(), pageable)
                .map(StudyRecordDto.Response::from);
    }

    /**
     * 키워드와 태그로 학습 기록을 검색합니다.
     * 제목과 내용에서 키워드를 검색하고, 지정된 태그를 포함하는 기록만 반환합니다.
     */
    public Page<StudyRecordDto.Response> searchStudyRecordsByKeywordAndTag(
            Long userId, String keyword, String tag, Pageable pageable) {
        if (tag == null || tag.trim().isEmpty()) {
            return searchStudyRecords(userId, keyword, pageable);
        }
        if (keyword == null || keyword.trim().isEmpty()) {
            return getStudyRecordsByTagPaged(userId, tag, pageable);
        }
        return studyRecordRepository.findByUserIdAndKeywordAndTag(
                userId, keyword.trim(), tag.trim(), pageable)
                .map(StudyRecordDto.Response::from);
    }

    /**
     * 태그로 학습 기록을 페이지네이션하여 검색합니다.
     */
    public Page<StudyRecordDto.Response> getStudyRecordsByTagPaged(Long userId, String tag, Pageable pageable) {
        if (tag == null || tag.trim().isEmpty()) {
            return getStudyRecords(userId, pageable);
        }
        
        List<StudyRecord> records = studyRecordRepository.findByUserIdAndTagsContaining(userId, tag.trim());
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), records.size());
        
        List<StudyRecord> pageContent = start < end ? records.subList(start, end) : List.of();
        
        return new org.springframework.data.domain.PageImpl<>(
                pageContent.stream()
                    .map(StudyRecordDto.Response::from)
                    .collect(Collectors.toList()),
                pageable, 
                records.size());
    }
} 