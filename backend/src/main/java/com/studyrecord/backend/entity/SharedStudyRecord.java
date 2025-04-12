package com.studyrecord.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedStudyRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_record_id")
    private StudyRecord studyRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String title;
    private String content;
    private String editorMode;
    private boolean isPublic;
    private String description;

    @ElementCollection
    @CollectionTable(name = "shared_study_record_tags", joinColumns = @JoinColumn(name = "shared_study_record_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "shared_study_record_likes",
        joinColumns = @JoinColumn(name = "shared_study_record_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> likedUsers = new HashSet<>();

    @Column(name = "like_count")
    private int likeCount;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void setStudyRecord(StudyRecord studyRecord) {
        this.studyRecord = studyRecord;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setEditorMode(String editorMode) {
        this.editorMode = editorMode;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public void addTag(String tag) {
        if (this.tags == null) {
            this.tags = new ArrayList<>();
        }
        this.tags.add(tag);
    }

    public void removeTags() {
        if (this.tags != null) {
            this.tags.clear();
        }
    }

    public void addLike(User user) {
        if (likedUsers.add(user)) {
            likeCount++;
        }
    }

    public void removeLike(User user) {
        if (likedUsers.remove(user)) {
            likeCount--;
        }
    }

    public boolean isLikedBy(User user) {
        return likedUsers.contains(user);
    }
} 