package com.studyrecord.backend.service;

import com.studyrecord.backend.domain.Todo;
import com.studyrecord.backend.domain.User;
import com.studyrecord.backend.dto.TodoRequest;
import com.studyrecord.backend.dto.TodoResponse;
import com.studyrecord.backend.repository.TodoRepository;
import com.studyrecord.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public List<TodoResponse> getAllTodosByUsername(String username) {
        return todoRepository.findAllByUserUsername(username).stream()
                .sorted((a, b) -> {
                    // 1. 마감일 null 비교
                    if (a.getDueDate() == null) return 1;
                    if (b.getDueDate() == null) return -1;

                    // 2. 마감일 비교
                    int dateCompare = a.getDueDate().compareTo(b.getDueDate());
                    if (dateCompare != 0) return dateCompare;

                    // 3. 같은 날짜일 경우 시간 비교
                    if (a.getEndTime() == null && b.getEndTime() == null) return 0;
                    if (a.getEndTime() == null) return 1;  // 시간 없는 항목을 뒤로
                    if (b.getEndTime() == null) return -1;
                    
                    return a.getEndTime().compareTo(b.getEndTime());
                })
                .map(TodoResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request, String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Todo todo = new Todo();
            todo.setUser(user);
            todo.setTitle(request.getTitle());
            todo.setDueDate(request.getDueDate());
            todo.setStartDate(request.getStartDate());
            todo.setStartTime(request.getStartTime());
            todo.setEndTime(request.getEndTime());
            todo.setPeriod(request.getPeriod());
            todo.setLocation(request.getLocation());
            
            List<String> tags = request.getTags();
            if (tags != null && !tags.isEmpty()) {
                todo.setTags(new ArrayList<>(tags));
            }

            Todo savedTodo = todoRepository.save(todo);
            return TodoResponse.from(savedTodo);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create todo", e);
        }
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));
        
        // 기존 필드 유지하면서 요청된 필드만 업데이트
        if (request.getTitle() != null) todo.setTitle(request.getTitle());
        if (request.getDueDate() != null) todo.setDueDate(request.getDueDate());
        
        // 시작일, 시작 시간, 종료 시간은 null 값도 허용하여 제거 가능하도록 함
        todo.setStartDate(request.getStartDate());  // null 허용
        todo.setStartTime(request.getStartTime());  // null 허용
        todo.setEndTime(request.getEndTime());      // null 허용
        
        if (request.getLocation() != null) todo.setLocation(request.getLocation());
        if (request.getTags() != null) todo.setTags(request.getTags());
        
        return TodoResponse.from(todo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        Todo todo = findTodo(id);
        todoRepository.delete(todo);
    }

    private Todo findTodo(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
    }

    @Transactional
    public TodoResponse updateTodoStatus(Long id, Boolean completed) {
        Todo todo = todoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));
        
        // 기존 데이터는 유지하고 completed 상태만 업데이트
        todo.setCompleted(completed);
        
        // 명시적으로 save 호출
        Todo savedTodo = todoRepository.save(todo);
        
        return TodoResponse.from(savedTodo);
    }

    public TodoResponse getTodo(Long id) {
        Todo todo = findTodo(id);
        return TodoResponse.from(todo);
    }
} 