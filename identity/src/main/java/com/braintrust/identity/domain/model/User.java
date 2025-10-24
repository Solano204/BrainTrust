package com.braintrust.identity.domain.model;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.shared.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

// 📍 identity/domain/model/User.java - AGGREGATE ROOT
public class User extends AggregateRoot<UserId> {
    private PersonId personId;
    private Email email;
    private Password password;
    private Role role;
    private boolean active;
    private LocalDateTime createdAt;
    private String studentId; // Solo para estudiantes

    // Constructor privado - encapsulación
    private User(UserId id, PersonId personId, Email email, Password password, Role role) {
        this.id = id;
        this.personId = personId;
        this.email = email;
        this.password = password;
        this.role = role;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    // Factory Methods - diferentes formas de crear usuarios
    public static User createTeacher(Person person, Email email, Password password) {
        UserId userId = UserId.generate();
        return new User(userId, person.getId(), email, password, Role.TEACHER);
    }

    public static User createStudent(Person person, Email email, Password password, String studentId) {
        UserId userId = UserId.generate();
        User user = new User(userId, person.getId(), email, password, Role.STUDENT);
        user.studentId = validateStudentId(studentId);
        return user;
    }

    public static User createAdmin(Person person, Email email, Password password) {
        UserId userId = UserId.generate();
        return new User(userId, person.getId(), email, password, Role.ADMIN);
    }

    private static String validateStudentId(String studentId) {
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID cannot be null or empty");
        }
        return studentId.trim();
    }


    // ✅ ADD THIS STATIC METHOD FOR RECONSTITUTION
    public static User reconstitute(
            UserId id,
            PersonId personId,
            Email email,
            Password password,
            Role role,
            boolean active,
            LocalDateTime createdAt,
            String studentId) {

        User user = new User(id, personId, email, password, role);
        user.active = active;
        user.createdAt = createdAt;
        user.studentId = studentId;
        return user;
    }


    // Comportamiento de dominio rico - sin events
    public void changePassword(Password newPassword) {
        if (!this.active) {
            throw new IllegalStateException("Cannot change password for inactive user");
        }
        this.password = newPassword;
    }

    public void changeEmail(Email newEmail) {
        if (!this.active) {
            throw new IllegalStateException("Cannot change email for inactive user");
        }
        this.email = newEmail;
    }

    public void deactivate() {
        if (!this.active) {
            throw new IllegalStateException("User is already inactive");
        }
        this.active = false;
    }

    public void activate() {
        if (this.active) {
            throw new IllegalStateException("User is already active");
        }
        this.active = true;
    }

    public boolean authenticate(String plainPassword, PasswordEncoder encoder) {
        return this.active && this.password.matches(plainPassword, encoder);
    }

    // Getters con contrato definido
    public PersonId getPersonId() { return personId; }
    public Email getEmail() { return email; }
    public Role getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getStudentId() { return studentId; }
    public Password getPassword() { return password; } // ✅ ADD THIS
    // No exponemos el password directamente por seguridad
}