package com.studyrecord.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;
    private String name;
    private String phone;
    private String birthdate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StudyRecord> studyRecords = new ArrayList<>();
    
    public void updateProfile(String name, String phone, String birthdate) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name;
        }
        if (phone != null) {
            this.phone = phone;
        }
        if (birthdate != null) {
            this.birthdate = birthdate;
        }
    }

    public void updatePassword(String password) {
        this.password = password;
    }
} 