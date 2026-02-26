package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_person_id", columnList = "person_id")
})
public class UserJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "person_id", length = 50, nullable = false)
    private String personId;

    @Column(name = "email", length = 254, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "role_id", nullable = false)
    private Integer roleId;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public UserJpaEntity() {}

    public UserJpaEntity(String id, String personId, String email, String passwordHash,
                         String role, boolean active, String studentId, LocalDateTime createdAt) {
        this.id = id;
        this.personId = personId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.roleId = switch (Role.valueOf(role)) {
            case STUDENT     -> 1;
            case TEACHER     -> 2;
            case ADMIN       -> 3;
            case SYS_MANAGER -> 4;
        };
        this.active = active;
        this.studentId = studentId;
        this.createdAt = createdAt;
    }

    public Role getRole() {
        return switch (roleId) {
            case 1 -> Role.STUDENT;
            case 2 -> Role.TEACHER;
            case 3 -> Role.ADMIN;
            case 4 -> Role.SYS_MANAGER;
            default -> throw new IllegalArgumentException("Unknown role_id: " + roleId);
        };
    }

    public void setRole(String role) {
        this.roleId = switch (Role.valueOf(role)) {
            case STUDENT     -> 1;
            case TEACHER     -> 2;
            case ADMIN       -> 3;
            case SYS_MANAGER -> 4;
        };
    }

    public Integer getRoleId() { return roleId; }
    public void setRoleId(Integer roleId) { this.roleId = roleId; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPersonId() { return personId; }
    public void setPersonId(String personId) { this.personId = personId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}