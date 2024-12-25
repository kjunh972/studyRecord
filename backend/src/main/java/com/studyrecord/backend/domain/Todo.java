package com.studyrecord.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "todos")
@Getter @Setter
@NoArgsConstructor
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String task;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    private TodoPeriod period;

    @Column(nullable = false)
    private boolean completed = false;
} 