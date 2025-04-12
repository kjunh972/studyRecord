package com.studyrecord.backend.entity;

import com.studyrecord.backend.dto.StudyRecordDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyRecord extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private int studyTime;  // 분 단위

    @ElementCollection
    @CollectionTable(name = "study_record_tags", joinColumns = @JoinColumn(name = "study_record_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @Column(nullable = false)
    @Builder.Default
    private String editorMode = "view";  // view, edit, comment

    public void update(String title, String content, int studyTime, List<String> tags, boolean isPublic, String editorMode) {
        this.title = title;
        this.content = content;
        this.studyTime = studyTime;
        this.tags.clear();
        this.tags.addAll(tags);
        this.isPublic = isPublic;
        this.editorMode = editorMode;
    }

    public void updateEditorMode(String editorMode) {
        this.editorMode = editorMode;
    }

    public void updateVisibility(boolean isPublic) {
        this.isPublic = isPublic;
    }
} 