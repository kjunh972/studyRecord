package com.studyrecord.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.studyrecord.backend.service.UserService;
import com.studyrecord.backend.dto.*;
import com.studyrecord.backend.security.CustomUserDetails;
import com.studyrecord.backend.dto.ErrorResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/users/{userId}")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getMyInfo(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 정보에 접근할 수 없습니다.");
        }
        return ResponseEntity.ok(userService.getMyInfo(userDetails.getUsername()));
    }

    @PatchMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateProfile(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 프로필을 수정할 수 없습니다.");
        }
        return ResponseEntity.ok(userService.updateProfile(request, userDetails.getUsername()));
    }

    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> updatePassword(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @RequestBody PasswordUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 비밀번호를 수정할 수 없습니다.");
        }
        userService.updatePassword(request, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAccount(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @RequestBody String currentPassword,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 계정을 삭제할 수 없습니다.");
        }
        try {
            userService.deleteAccount(userId, currentPassword);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
} 