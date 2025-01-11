package com.studyrecord.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import com.studyrecord.backend.service.TodoService;
import com.studyrecord.backend.dto.TodoRequest;
import com.studyrecord.backend.dto.TodoResponse;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {
    private final TodoService todoService;

    @GetMapping
    public ResponseEntity<List<TodoResponse>> getAllTodos(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(todoService.getAllTodosByUsername(userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TodoResponse> createTodo(
        @RequestBody TodoRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }
        return ResponseEntity.ok(todoService.createTodo(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TodoResponse> updateTodo(
        @PathVariable Long id,
        @RequestBody Map<String, Object> updates,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            if (userDetails == null) {
                throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
            }

            TodoResponse todo = todoService.getTodo(id);
            if (!todo.getUser().getUsername().equals(userDetails.getUsername())) {
                throw new AccessDeniedException("해당 할 일에 대한 수정 권한이 없습니다.");
            }

            if (updates.containsKey("completed")) {
                Boolean completed = (Boolean) updates.get("completed");
                return ResponseEntity.ok(todoService.updateTodoStatus(id, completed));
            }
            
            TodoRequest request = new TodoRequest();
            
            // 기존 Todo 데이터 가져오기
            TodoResponse currentTodo = todoService.getTodo(id);
            
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
                    (List<String>) updates.get("tags") : 
                    currentTodo.getTags()) : 
                currentTodo.getTags();
            request.setTags(tags);

            return ResponseEntity.ok(todoService.updateTodo(id, request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTodo(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new AccessDeniedException("로그인이 필요한 서비스입니다.");
        }

        TodoResponse todo = todoService.getTodo(id);
        if (!todo.getUser().getUsername().equals(userDetails.getUsername())) {
            throw new AccessDeniedException("해당 할 일에 대한 삭제 권한이 없습니다.");
        }

        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
} 