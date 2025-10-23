package com.braintrust.identity.domain.model;

// 📍 identity/domain/model/Role.java
public enum Role {
    TEACHER("Profesor"),
    STUDENT("Estudiante"),
    ADMIN("Administrador");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isTeacher() {
        return this == TEACHER;
    }

    public boolean isStudent() {
        return this == STUDENT;
    }

    public boolean isAdmin() {
        return this == ADMIN;
    }
}