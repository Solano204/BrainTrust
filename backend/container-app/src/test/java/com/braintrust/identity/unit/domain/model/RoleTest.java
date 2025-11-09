package com.braintrust.identity.unit.domain.model;


import com.braintrust.identity.domain.model.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Role Enum Tests")
class RoleTest {

    // ========================================
    // ✅ ENUM VALUES TESTS
    // ========================================

    @Test
    @DisplayName("Should have all expected role values")
    void shouldHaveAllExpectedRoleValues() {
        // When
        Role[] roles = Role.values();

        // Then
        assertThat(roles).hasSize(3);
        assertThat(roles).contains(Role.TEACHER, Role.STUDENT, Role.ADMIN);
    }

    // ========================================
    // ✅ DISPLAY NAME TESTS
    // ========================================

    @Test
    @DisplayName("Should return correct display name for TEACHER")
    void shouldReturnCorrectDisplayNameForTeacher() {
        // When
        String displayName = Role.TEACHER.getDisplayName();

        // Then
        assertThat(displayName).isEqualTo("Profesor");
    }

    @Test
    @DisplayName("Should return correct display name for STUDENT")
    void shouldReturnCorrectDisplayNameForStudent() {
        // When
        String displayName = Role.STUDENT.getDisplayName();

        // Then
        assertThat(displayName).isEqualTo("Estudiante");
    }

    @Test
    @DisplayName("Should return correct display name for ADMIN")
    void shouldReturnCorrectDisplayNameForAdmin() {
        // When
        String displayName = Role.ADMIN.getDisplayName();

        // Then
        assertThat(displayName).isEqualTo("Administrador");
    }

    // ========================================
    // ✅ ROLE VERIFICATION TESTS
    // ========================================

    @Test
    @DisplayName("Should verify TEACHER role correctly")
    void shouldVerifyTeacherRoleCorrectly() {
        // Then
        assertThat(Role.TEACHER.isTeacher()).isTrue();
        assertThat(Role.TEACHER.isStudent()).isFalse();
        assertThat(Role.TEACHER.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should verify STUDENT role correctly")
    void shouldVerifyStudentRoleCorrectly() {
        // Then
        assertThat(Role.STUDENT.isStudent()).isTrue();
        assertThat(Role.STUDENT.isTeacher()).isFalse();
        assertThat(Role.STUDENT.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should verify ADMIN role correctly")
    void shouldVerifyAdminRoleCorrectly() {
        // Then
        assertThat(Role.ADMIN.isAdmin()).isTrue();
        assertThat(Role.ADMIN.isTeacher()).isFalse();
        assertThat(Role.ADMIN.isStudent()).isFalse();
    }

    // ========================================
    // ✅ ENUM PARSING TESTS
    // ========================================

    @Test
    @DisplayName("Should parse role from string")
    void shouldParseRoleFromString() {
        // When
        Role teacher = Role.valueOf("TEACHER");
        Role student = Role.valueOf("STUDENT");
        Role admin = Role.valueOf("ADMIN");

        // Then
        assertThat(teacher).isEqualTo(Role.TEACHER);
        assertThat(student).isEqualTo(Role.STUDENT);
        assertThat(admin).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("Should throw exception for invalid role string")
    void shouldThrowExceptionForInvalidRoleString() {
        // When/Then
        assertThatThrownBy(() -> Role.valueOf("INVALID_ROLE"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}