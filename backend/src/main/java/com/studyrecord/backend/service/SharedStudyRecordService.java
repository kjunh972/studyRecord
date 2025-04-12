package com.studyrecord.backend.service;

import com.studyrecord.backend.dto.SharedStudyRecordDto;
import com.studyrecord.backend.dto.ShareRequest;
import com.studyrecord.backend.dto.TagStatDto;
import com.studyrecord.backend.entity.SharedStudyRecord;
import com.studyrecord.backend.entity.StudyRecord;
import com.studyrecord.backend.entity.User;
import com.studyrecord.backend.repository.SharedStudyRecordRepository;
import com.studyrecord.backend.repository.StudyRecordRepository;
import com.studyrecord.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SharedStudyRecordService {
    private final SharedStudyRecordRepository sharedStudyRecordRepository;
    private final StudyRecordRepository studyRecordRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<SharedStudyRecordDto> getPublicSharedStudyRecords() {
        return sharedStudyRecordRepository.findByIsPublicTrue()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public Page<SharedStudyRecordDto> searchPublicSharedStudyRecords(String keyword, List<String> tags, Pageable pageable) {
        if (!CollectionUtils.isEmpty(tags)) {
            return sharedStudyRecordRepository.findByTitleContainingAndTagsInAndIsPublicTrue(keyword, tags, pageable)
                    .map(this::convertToDto);
        }
        return sharedStudyRecordRepository.findByTitleContainingAndIsPublicTrue(keyword, pageable)
                .map(this::convertToDto);
    }

    public List<SharedStudyRecordDto> getPublicSharedStudyRecordsByUserId(Long userId) {
        // 사용자 존재 여부 확인
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return sharedStudyRecordRepository.findByUserIdAndIsPublicTrue(userId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public List<SharedStudyRecordDto> getSharedStudyRecordsByUserId(Long userId) {
        return sharedStudyRecordRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public SharedStudyRecordDto getSharedStudyRecord(Long id) {
        SharedStudyRecord sharedStudyRecord = sharedStudyRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다."));

        // 비공개 기록인 경우 접근 권한 확인 필요
        if (!sharedStudyRecord.isPublic()) {
            throw new AccessDeniedException("비공개 학습 기록은 조회할 수 없습니다.");
        }

        return convertToDto(sharedStudyRecord);
    }

    @Transactional
    public SharedStudyRecordDto shareStudyRecord(Long studyRecordId, ShareRequest request, Long userId) {
        StudyRecord studyRecord = studyRecordRepository.findById(studyRecordId)
                .orElseThrow(() -> new IllegalArgumentException("학습 기록을 찾을 수 없습니다."));

        // 학습 기록 소유자 확인
        if (!studyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 학습 기록을 공유할 수 없습니다.");
        }

        SharedStudyRecord sharedStudyRecord = new SharedStudyRecord();
        sharedStudyRecord.setStudyRecord(studyRecord);
        sharedStudyRecord.setTitle(studyRecord.getTitle());
        sharedStudyRecord.setContent(studyRecord.getContent());
        sharedStudyRecord.setEditorMode(studyRecord.getEditorMode());
        sharedStudyRecord.setPublic(request.isPublic());
        sharedStudyRecord.setDescription(request.getDescription());
        sharedStudyRecord.setUser(studyRecord.getUser());
        
        // 태그 설정
        if (!CollectionUtils.isEmpty(request.getTags())) {
            sharedStudyRecord.setTags(request.getTags());
        }

        SharedStudyRecord saved = sharedStudyRecordRepository.save(sharedStudyRecord);
        return convertToDto(saved);
    }

    @Transactional
    public SharedStudyRecordDto updateSharedStudyRecord(Long id, ShareRequest request, Long userId) {
        SharedStudyRecord sharedStudyRecord = sharedStudyRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다."));

        // 소유자 확인
        if (!sharedStudyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 공유된 학습 기록을 수정할 수 없습니다.");
        }

        sharedStudyRecord.setPublic(request.isPublic());
        sharedStudyRecord.setDescription(request.getDescription());
        
        // 태그 업데이트
        sharedStudyRecord.removeTags();
        if (!CollectionUtils.isEmpty(request.getTags())) {
            sharedStudyRecord.setTags(request.getTags());
        }

        return convertToDto(sharedStudyRecord);
    }

    @Transactional
    public void deleteSharedStudyRecord(Long id, Long userId) {
        SharedStudyRecord sharedStudyRecord = sharedStudyRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다."));

        // 소유자 확인
        if (!sharedStudyRecord.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 공유된 학습 기록을 삭제할 수 없습니다.");
        }

        sharedStudyRecordRepository.delete(sharedStudyRecord);
    }

    public Page<SharedStudyRecordDto> getPublicSharedStudyRecords(Pageable pageable) {
        return sharedStudyRecordRepository.findByIsPublicTrueOrderByCreatedAtDesc(pageable)
                .map(this::convertToDto);
    }

    public List<String> getPopularTags(int limit) {
        return sharedStudyRecordRepository.findPopularTags(limit);
    }

    public List<String> autocompleteTags(String query, int limit) {
        return sharedStudyRecordRepository.findTagsByPrefix(query, limit);
    }

    public List<TagStatDto> getTagStats() {
        return sharedStudyRecordRepository.findTagsWithCount()
                .stream()
                .map(result -> TagStatDto.builder()
                        .tag((String) result[0])
                        .count((Long) result[1])
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public SharedStudyRecordDto likeSharedStudyRecord(Long id, Long userId) {
        SharedStudyRecord sharedStudyRecord = sharedStudyRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        sharedStudyRecord.addLike(user);
        return convertToDto(sharedStudyRecord, userId);
    }

    @Transactional
    public SharedStudyRecordDto unlikeSharedStudyRecord(Long id, Long userId) {
        SharedStudyRecord sharedStudyRecord = sharedStudyRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공유된 학습 기록을 찾을 수 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        sharedStudyRecord.removeLike(user);
        return convertToDto(sharedStudyRecord, userId);
    }

    private SharedStudyRecordDto convertToDto(SharedStudyRecord entity, Long currentUserId) {
        return SharedStudyRecordDto.builder()
                .id(entity.getId())
                .studyRecordId(entity.getStudyRecord().getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .editorMode(entity.getEditorMode())
                .isPublic(entity.isPublic())
                .description(entity.getDescription())
                .tags(entity.getTags())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .likeCount(entity.getLikeCount())
                .isLiked(currentUserId != null && entity.isLikedBy(userRepository.getOne(currentUserId)))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private SharedStudyRecordDto convertToDto(SharedStudyRecord entity) {
        return convertToDto(entity, null);
    }

    public List<SharedStudyRecordDto> getLikedStudyRecords(Long userId) {
        return sharedStudyRecordRepository.findLikedRecordsByUserId(userId)
                .stream()
                .map(record -> convertToDto(record, userId))
                .toList();
    }

    public Page<SharedStudyRecordDto> getPopularStudyRecords(Pageable pageable) {
        return sharedStudyRecordRepository.findByIsPublicTrueOrderByLikeCountDesc(pageable)
                .map(record -> convertToDto(record));
    }

    public Page<SharedStudyRecordDto> getPopularStudyRecordsByTag(String tag, Pageable pageable) {
        return sharedStudyRecordRepository.findPopularRecordsByTag(tag, pageable)
                .map(record -> convertToDto(record));
    }
} 