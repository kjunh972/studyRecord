package com.studyrecord.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.studyrecord.backend.service.UserService;
import com.studyrecord.backend.domain.User;
import com.studyrecord.backend.dto.*;
import com.studyrecord.backend.security.CustomUserDetails;
import org.springframework.http.HttpStatus;
import com.studyrecord.backend.dto.ErrorResponse;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.getUserById(userDetails.getId());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PatchMapping("/password")
    public ResponseEntity<?> updatePassword(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody PasswordUpdateRequest request
    ) {
        try {
            userService.updatePassword(userDetails.getId(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody ProfileUpdateRequest request
    ) {
        User updatedUser = userService.updateProfile(
            userDetails.getId(), 
            request.getName(),
            request.getPhone(),
            request.getBirthdate()
        );
        return ResponseEntity.ok(UserResponse.from(updatedUser));
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteAccount(userDetails.getId());
    }
} 