package com.studyrecord.backend.service;

import com.studyrecord.backend.domain.Todo;
import com.studyrecord.backend.domain.TodoPeriod;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {
    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public List<TodoResponse> getAllTodosByUsername(String username) {
        return todoRepository.findAllByUserUsername(username).stream()
                .map(TodoResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        try {
            User user = userRepository.findById(1L)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Todo todo = new Todo();
            todo.setUser(user);
            todo.setTask(request.getTask());
            todo.setDueDate(request.getDueDate());
            todo.setPeriod(request.getPeriod());
            
            return TodoResponse.from(todoRepository.save(todo));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create todo", e);
        }
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = findTodo(id);
        todo.setTask(request.getTask());
        todo.setDueDate(request.getDueDate());
        todo.setPeriod(request.getPeriod());
        todo.setCompleted(request.isCompleted());

        return TodoResponse.from(todo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        todoRepository.deleteById(id);
    }

    private Todo findTodo(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
    }

    @Transactional
    public TodoResponse updateTodoStatus(Long id, Boolean completed) {
        try {
            Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));
            
            todo.setCompleted(completed);
            Todo savedTodo = todoRepository.save(todo);
            
            return TodoResponse.from(savedTodo);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update todo status", e);
        }
    }
} 