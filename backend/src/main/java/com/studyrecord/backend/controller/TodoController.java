package com.studyrecord.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.studyrecord.backend.service.TodoService;
import com.studyrecord.backend.dto.TodoDto;
import com.studyrecord.backend.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalTime;

import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/users/{userId}/todos")
@RequiredArgsConstructor
public class TodoController {
    private final TodoService todoService;

    @GetMapping
    public ResponseEntity<List<TodoDto.Response>> getAllTodos(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 할 일 목록에 접근할 수 없습니다.");
        }
        return ResponseEntity.ok(todoService.getAllTodosByUsername(userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TodoDto.Response> createTodo(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @RequestBody TodoDto.Request request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 할 일을 생성할 수 없습니다.");
        }
        return ResponseEntity.ok(todoService.createTodo(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TodoDto.Response> updateTodo(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            if (userDetails == null) {
                throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
            }
            if (!userDetails.getId().equals(userId)) {
                throw new AccessDeniedException("다른 사용자의 할 일을 수정할 수 없습니다.");
            }

            TodoDto.Response todo = todoService.getTodo(id);

            if (updates.containsKey("completed")) {
                Boolean completed = (Boolean) updates.get("completed");
                return ResponseEntity.ok(todoService.updateTodoStatus(id, completed));
            }
            
            TodoDto.Request request = new TodoDto.Request();
            
            // 기존 Todo 데이터 가져오기
            TodoDto.Response currentTodo = todoService.getTodo(id);
            
            // 기존 값을 유지하면서 업데이트된 값만 적용
            request.setTitle(updates.containsKey("title") ? 
                (String) updates.get("title") : currentTodo.getTitle());
                
            request.setDueDate(updates.containsKey("dueDate") && updates.get("dueDate") != null ? 
                LocalDate.parse((String) updates.get("dueDate")) : currentTodo.getDueDate());
                
            request.setStartDate(updates.containsKey("startDate") ? 
                (updates.get("startDate") != null ? 
                    LocalDate.parse((String) updates.get("startDate")) : null) : 
                currentTodo.getStartDate());
                
            request.setStartTime(updates.containsKey("startTime") ? 
                (updates.get("startTime") != null ? 
                    LocalTime.parse((String) updates.get("startTime")) : null) : 
                currentTodo.getStartTime());
                
            request.setEndTime(updates.containsKey("endTime") ? 
                (updates.get("endTime") != null ? 
                    LocalTime.parse((String) updates.get("endTime")) : null) : 
                currentTodo.getEndTime());
                
            request.setLocation(updates.containsKey("location") ? 
                (String) updates.get("location") : currentTodo.getLocation());
                
            @SuppressWarnings("unchecked") List<String> tags = updates.containsKey("tags") ? 
                (updates.get("tags") instanceof List<?> ? 
                    (List<String>) updates.get("tags") : null) : 
                currentTodo.getTags();
            request.setTags(tags);
            
            return ResponseEntity.ok(todoService.updateTodo(id, request));
        } catch (Exception e) {
            throw new RuntimeException("할 일 수정 중 오류가 발생했습니다.", e);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTodo(
            @Parameter(description = "사용자 ID") @PathVariable Long userId,
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        if (!userDetails.getId().equals(userId)) {
            throw new AccessDeniedException("다른 사용자의 할 일을 삭제할 수 없습니다.");
        }

        TodoDto.Response todo = todoService.getTodo(id);
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
} 