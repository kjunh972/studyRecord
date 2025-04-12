package com.studyrecord.backend.controller;

import com.studyrecord.backend.dto.StudyChallengeDto;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.service.StudyChallengeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "학습 챌린지", description = "학습 챌린지 관련 API")
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class StudyChallengeController {

    private final StudyChallengeService studyChallengeService;

    private void validateAuthentication(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
    }

    @Operation(summary = "챌린지 생성", description = "새로운 학습 챌린지를 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyChallengeDto.Response> createChallenge(
            @Valid @RequestBody StudyChallengeDto.Request request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyChallengeService.createChallenge(userDetails.getId(), request));
    }

    @Operation(summary = "챌린지 수정", description = "기존 학습 챌린지를 수정합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "챌린지 없음")
    })
    @PutMapping("/{challengeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyChallengeDto.Response> updateChallenge(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @Valid @RequestBody StudyChallengeDto.Request request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyChallengeService.updateChallenge(userDetails.getId(), challengeId, request));
    }

    @Operation(summary = "챌린지 삭제", description = "학습 챌린지를 삭제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "챌린지 없음")
    })
    @DeleteMapping("/{challengeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteChallenge(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        studyChallengeService.deleteChallenge(userDetails.getId(), challengeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "챌린지 상세 조회", description = "학습 챌린지의 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "404", description = "챌린지 없음")
    })
    @GetMapping("/{challengeId}")
    public ResponseEntity<StudyChallengeDto.DetailResponse> getChallengeDetail(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(studyChallengeService.getChallengeDetail(userId, challengeId));
    }

    @Operation(summary = "내가 생성한 챌린지 목록", description = "내가 생성한 학습 챌린지 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/my-challenges")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<StudyChallengeDto.Response>> getMyChallenges(
            @PageableDefault(size = 10) Pageable pageable,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyChallengeService.getMyChallenges(userDetails.getId(), pageable));
    }

    @Operation(summary = "내가 참여 중인 챌린지 목록", description = "내가 참여 중인 학습 챌린지 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/participating")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<StudyChallengeDto.Response>> getParticipatingChallenges(
            @PageableDefault(size = 10) Pageable pageable,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyChallengeService.getParticipatingChallenges(userDetails.getId(), pageable));
    }

    @Operation(summary = "활성 챌린지 목록", description = "현재 활성 상태인 학습 챌린지 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/active")
    public ResponseEntity<Page<StudyChallengeDto.Response>> getActiveChallenges(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(studyChallengeService.getActiveChallenges(pageable));
    }

    @Operation(summary = "챌린지 검색", description = "키워드로 학습 챌린지를 검색합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<StudyChallengeDto.Response>> searchChallenges(
            @Parameter(description = "검색 키워드") @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(studyChallengeService.searchChallenges(keyword, pageable));
    }

    @Operation(summary = "태그별 챌린지 조회", description = "특정 태그가 있는 학습 챌린지를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/tag/{tag}")
    public ResponseEntity<Page<StudyChallengeDto.Response>> getChallengesByTag(
            @Parameter(description = "태그") @PathVariable String tag,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(studyChallengeService.getChallengesByTag(tag, pageable));
    }

    @Operation(summary = "챌린지 참여", description = "학습 챌린지에 참여합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "챌린지 없음")
    })
    @PostMapping("/{challengeId}/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyChallengeDto.Response> joinChallenge(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyChallengeService.joinChallenge(userDetails.getId(), challengeId));
    }

    @Operation(summary = "챌린지 탈퇴", description = "학습 챌린지에서 탈퇴합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "참여 정보 없음")
    })
    @DeleteMapping("/{challengeId}/leave")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> leaveChallenge(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        studyChallengeService.leaveChallenge(userDetails.getId(), challengeId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "학습 기록 등록", description = "챌린지에 학습 기록을 등록하여 진행 상황을 업데이트합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "참여 정보 또는 학습 기록 없음")
    })
    @PostMapping("/{challengeId}/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyChallengeDto.ParticipantResponse> updateProgress(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @Parameter(description = "학습 기록 ID") @RequestParam Long studyRecordId,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        validateAuthentication(userDetails);
        return ResponseEntity.ok(studyChallengeService.updateProgress(userDetails.getId(), challengeId, studyRecordId));
    }

    @Operation(summary = "상위 참가자 목록", description = "챌린지의 상위 참가자 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공"),
        @ApiResponse(responseCode = "404", description = "챌린지 없음")
    })
    @GetMapping("/{challengeId}/top-participants")
    public ResponseEntity<List<StudyChallengeDto.ParticipantResponse>> getTopParticipants(
            @Parameter(description = "챌린지 ID") @PathVariable Long challengeId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(studyChallengeService.getTopParticipants(challengeId, pageable));
    }

    @Operation(summary = "인기 태그 목록", description = "학습 챌린지에서 많이 사용되는 인기 태그 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/popular-tags")
    public ResponseEntity<List<String>> getPopularTags(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(studyChallengeService.getPopularTags(pageable));
    }

    @Operation(summary = "참가자가 적은 챌린지 목록", description = "특정 참가자 수 이하인 활성 챌린지 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "성공")
    })
    @GetMapping("/less-participants")
    public ResponseEntity<Page<StudyChallengeDto.Response>> getChallengesWithLessParticipants(
            @Parameter(description = "참가자 수 제한") @RequestParam(defaultValue = "10") int limit,
            @PageableDefault(size = 10) Pageable pageable,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(studyChallengeService.getChallengesWithLessParticipants(limit, userId, pageable));
    }
} 