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

    // ✅ NO @Column role_id here — it lives in user_roles junction table
    // ✅ CORRECT — role_id is a direct column on the users table
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private CatRoleJpaEntity role;

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
        // role entity will be set separately via setRole()
        this.active = active;
        this.studentId = studentId;
        this.createdAt = createdAt;
    }

    // ✅ Returns the infrastructure Role enum via CatRoleJpaEntity.code
    public Role getRole() {
        if (role == null) throw new IllegalStateException("User has no role assigned");
        return Role.valueOf(role.getCode());
    }

    // ✅ getRoleId() derived from the relationship — used by existing queries
    public Integer getRoleId() {
        return role != null ? role.getId() : null;
    }

    public CatRoleJpaEntity getRoleEntity() { return role; }
    public void setRoleEntity(CatRoleJpaEntity role) { this.role = role; }

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