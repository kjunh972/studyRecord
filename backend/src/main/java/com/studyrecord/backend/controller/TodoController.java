package com.studyrecord.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studyrecord.backend.service.TodoService;
import com.studyrecord.backend.domain.TodoPeriod;
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
    public ResponseEntity<List<TodoResponse>> getAllTodos(
            @RequestParam(name = "period", required = false) TodoPeriod period) {
        return ResponseEntity.ok(todoService.getAllTodos(period));
    }

    @PostMapping
    public ResponseEntity<TodoResponse> createTodo(@RequestBody TodoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(todoService.createTodo(request));
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
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
} 