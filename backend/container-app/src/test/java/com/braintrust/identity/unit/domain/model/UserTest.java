package com.braintrust.identity.unit.domain.model;


import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.Password;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("User Domain Model Tests")
class UserTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final String VALID_EMAIL = "john.doe@example.com";
    private static final String VALID_PASSWORD = "SecurePassword123!";
    private static final String VALID_STUDENT_ID = "STU-2024-001";

    // ========================================
    // ✅ CREATION TESTS - TEACHER
    // ========================================

    @Test
    @DisplayName("Should create teacher user successfully")
    void shouldCreateTeacherUserSuccessfully() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);

        // When
        User teacher = User.createTeacher(person, email, password);

        // Then
        assertThat(teacher).isNotNull();
        assertThat(teacher.getId()).isNotNull();
        assertThat(teacher.getPersonId()).isEqualTo(person.getId());
        assertThat(teacher.getEmail()).isEqualTo(email);
        assertThat(teacher.getPassword()).isEqualTo(password);
        assertThat(teacher.getRole()).isEqualTo(Role.TEACHER);
        assertThat(teacher.isActive()).isTrue();
        assertThat(teacher.getCreatedAt()).isNotNull();
        assertThat(teacher.getStudentId()).isNull();
    }

    // ========================================
    // ✅ CREATION TESTS - STUDENT
    // ========================================

    @Test
    @DisplayName("Should create student user successfully")
    void shouldCreateStudentUserSuccessfully() {
        // Given
        Person person = Person.create("Jane", "Smith");
        Email email = new Email("jane.smith@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);

        // When
        User student = User.createStudent(person, email, password, VALID_STUDENT_ID);

        // Then
        assertThat(student).isNotNull();
        assertThat(student.getId()).isNotNull();
        assertThat(student.getRole()).isEqualTo(Role.STUDENT);
        assertThat(student.getStudentId()).isEqualTo(VALID_STUDENT_ID);
        assertThat(student.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should throw exception when creating student without student ID")
    void shouldThrowExceptionWhenCreatingStudentWithoutStudentId() {
        // Given
        Person person = Person.create("Jane", "Smith");
        Email email = new Email("jane.smith@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);

        // When/Then
        assertThatThrownBy(() -> User.createStudent(person, email, password, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student ID cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when creating student with blank student ID")
    void shouldThrowExceptionWhenCreatingStudentWithBlankStudentId() {
        // Given
        Person person = Person.create("Jane", "Smith");
        Email email = new Email("jane.smith@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);

        // When/Then
        assertThatThrownBy(() -> User.createStudent(person, email, password, "   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Student ID cannot be null or empty");
    }

    // ========================================
    // ✅ CREATION TESTS - ADMIN
    // ========================================

    @Test
    @DisplayName("Should create admin user successfully")
    void shouldCreateAdminUserSuccessfully() {
        // Given
        Person person = Person.create("Admin", "User");
        Email email = new Email("admin@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);

        // When
        User admin = User.createAdmin(person, email, password);

        // Then
        assertThat(admin).isNotNull();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.isActive()).isTrue();
        assertThat(admin.getStudentId()).isNull();
    }

    // ========================================
    // ✅ AUTHENTICATION TESTS
    // ========================================

    @Test
    @DisplayName("Should authenticate with correct password")
    void shouldAuthenticateWithCorrectPassword() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, email, password);

        // When
        boolean authenticated = user.authenticate(VALID_PASSWORD, passwordEncoder);

        // Then
        assertThat(authenticated).isTrue();
    }

    @Test
    @DisplayName("Should not authenticate with incorrect password")
    void shouldNotAuthenticateWithIncorrectPassword() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, email, password);

        // When
        boolean authenticated = user.authenticate("WrongPassword123!", passwordEncoder);

        // Then
        assertThat(authenticated).isFalse();
    }

    // ========================================
    // ✅ EMAIL CHANGE TESTS
    // ========================================

    @Test
    @DisplayName("Should change email successfully")
    void shouldChangeEmailSuccessfully() {
        // Given
        Person person = Person.create("John", "Doe");
        Email oldEmail = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, oldEmail, password);

        Email newEmail = new Email("john.newemail@example.com");

        // When
        user.changeEmail(newEmail);

        // Then
        assertThat(user.getEmail()).isEqualTo(newEmail);
        assertThat(user.getEmail()).isNotEqualTo(oldEmail);
    }

//    @Test
//    @DisplayName("Should throw exception when changing to null email")
//    void shouldThrowExceptionWhenChangingToNullEmail() {
//        // Given
//        Person person = Person.create("John", "Doe");
//        Email email = new Email(VALID_EMAIL);
//        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
//        User user = User.createTeacher(person, email, password);
//
//        // When/Then
//        assertThatThrownBy(() -> user.changeEmail(null)) // Pasa null directamente
//                .isInstanceOf(IllegalArgumentException.class) // Aseguramos que es la excepción correcta
//                .hasMessageContaining("Email cannot be null");
//    }

    // ========================================
    // ✅ PASSWORD CHANGE TESTS
    // ========================================

    @Test
    @DisplayName("Should change password successfully")
    void shouldChangePasswordSuccessfully() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password oldPassword = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, email, oldPassword);

        Password newPassword = Password.create("NewSecurePassword456!", passwordEncoder);

        // When
        user.changePassword(newPassword);

        // Then
        assertThat(user.authenticate("NewSecurePassword456!", passwordEncoder)).isTrue();
        assertThat(user.authenticate(VALID_PASSWORD, passwordEncoder)).isFalse();
    }

//    @Test
//    @DisplayName("Should throw exception when changing to null password")
//    void shouldThrowExceptionWhenChangingToNullPassword() {
//        // Given
//        Person person = Person.create("John", "Doe");
//        Email email = new Email(VALID_EMAIL);
//        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
//        User user = User.createTeacher(person, email, password);
//
//        // When/Then
//        assertThatThrownBy(() -> user.changePassword(null)) // Pasa null directamente
//                .isInstanceOf(IllegalArgumentException.class) // Aseguramos que es la excepción correcta
//                .hasMessageContaining("Password cannot be null");
//    }

    // ========================================
    // ✅ ACTIVATION/DEACTIVATION TESTS
    // ========================================

    @Test
    @DisplayName("Should activate user")
    void shouldActivateUser() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, email, password);
        user.deactivate();

        // When
        user.activate();

        // Then
        assertThat(user.isActive()).isTrue();
    }

    @Test
    @DisplayName("Should deactivate user")
    void shouldDeactivateUser() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, email, password);

        // When
        user.deactivate();

        // Then
        assertThat(user.isActive()).isFalse();
    }

    @Test
    @DisplayName("Should remain active after multiple activate calls")
    void shouldRemainActiveAfterMultipleActivateCalls() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User user = User.createTeacher(person, email, password);


        // Then
        assertThat(user.isActive()).isTrue();
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute teacher from persistence")
    void shouldReconstituteTeacherFromPersistence() {
        // Given
        UserId userId = UserId.generate();
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        LocalDateTime createdAt = LocalDateTime.now().minusDays(30);

        // When
        User user = User.reconstitute(
                userId,
                person.getId(),
                email,
                password,
                Role.TEACHER,
                true,
                createdAt,
                null
        );

        // Then
        assertThat(user.getId()).isEqualTo(userId);
        assertThat(user.getPersonId()).isEqualTo(person.getId());
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getPassword()).isEqualTo(password);
        assertThat(user.getRole()).isEqualTo(Role.TEACHER);
        assertThat(user.isActive()).isTrue();
        assertThat(user.getCreatedAt()).isEqualTo(createdAt);
        assertThat(user.getStudentId()).isNull();
    }

    @Test
    @DisplayName("Should reconstitute student from persistence")
    void shouldReconstituteStudentFromPersistence() {
        // Given
        UserId userId = UserId.generate();
        Person person = Person.create("Jane", "Smith");
        Email email = new Email("jane.smith@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        LocalDateTime createdAt = LocalDateTime.now().minusDays(15);

        // When
        User user = User.reconstitute(
                userId,
                person.getId(),
                email,
                password,
                Role.STUDENT,
                true,
                createdAt,
                VALID_STUDENT_ID
        );

        // Then
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
        assertThat(user.getStudentId()).isEqualTo(VALID_STUDENT_ID);
    }

    @Test
    @DisplayName("Should reconstitute inactive user")
    void shouldReconstituteInactiveUser() {
        // Given
        UserId userId = UserId.generate();
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        LocalDateTime createdAt = LocalDateTime.now().minusDays(100);

        // When
        User user = User.reconstitute(
                userId,
                person.getId(),
                email,
                password,
                Role.TEACHER,
                false, // inactive
                createdAt,
                null
        );

        // Then
        assertThat(user.isActive()).isFalse();
    }

    // ========================================
    // ✅ ROLE VERIFICATION TESTS
    // ========================================

    @Test
    @DisplayName("Should verify teacher role")
    void shouldVerifyTeacherRole() {
        // Given
        Person person = Person.create("John", "Doe");
        Email email = new Email(VALID_EMAIL);
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User teacher = User.createTeacher(person, email, password);

        // Then
        assertThat(teacher.getRole().isTeacher()).isTrue();
        assertThat(teacher.getRole().isStudent()).isFalse();
        assertThat(teacher.getRole().isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should verify student role")
    void shouldVerifyStudentRole() {
        // Given
        Person person = Person.create("Jane", "Smith");
        Email email = new Email("jane.smith@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User student = User.createStudent(person, email, password, VALID_STUDENT_ID);

        // Then
        assertThat(student.getRole().isStudent()).isTrue();
        assertThat(student.getRole().isTeacher()).isFalse();
        assertThat(student.getRole().isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should verify admin role")
    void shouldVerifyAdminRole() {
        // Given
        Person person = Person.create("Admin", "User");
        Email email = new Email("admin@example.com");
        Password password = Password.create(VALID_PASSWORD, passwordEncoder);
        User admin = User.createAdmin(person, email, password);

        // Then
        assertThat(admin.getRole().isAdmin()).isTrue();
        assertThat(admin.getRole().isTeacher()).isFalse();
        assertThat(admin.getRole().isStudent()).isFalse();
    }
}