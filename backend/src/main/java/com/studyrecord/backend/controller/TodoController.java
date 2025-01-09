package com.studyrecord.backend.controller;

import org.springframework.http.HttpStatus;
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
    public ResponseEntity<TodoResponse> updateTodo(
            @PathVariable Long id, 
            @RequestBody Map<String, Boolean> updates) {
        try {
            Boolean completed = updates.get("completed");
            if (completed == null) {
                return ResponseEntity.badRequest().build();
            }
            TodoResponse updatedTodo = todoService.updateTodoStatus(id, completed);
            return ResponseEntity.ok(updatedTodo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .build();
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