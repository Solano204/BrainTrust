package com.braintrust.identity.integration.repository;


import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.Password;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.PersonEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.UserEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.*;
import com.braintrust.identity.integration.config.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@Import({
        JpaUserRepositoryAdapter.class,
        UserEntityMapper.class,
        JpaPersonRepositoryAdapter.class,
        PersonEntityMapper.class
})
@ContextConfiguration(classes = BrainTrustApplication.class)

@DisplayName("User Repository Integration Tests")
class UserRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private JpaUserRepositoryAdapter userRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private JpaPersonRepositoryAdapter personRepository;

    @Autowired
    private PersonJpaRepository personJpaRepository;

    private PasswordEncoder passwordEncoder;
    private Person testPerson;

    @BeforeEach
    void setUp() {
        userJpaRepository.deleteAll();
        personJpaRepository.deleteAll();
        passwordEncoder = new BCryptPasswordEncoder();

        testPerson = Person.create("Juan", "Pérez");
        testPerson = personRepository.save(testPerson);
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve user by ID")
    void shouldSaveAndRetrieveUserById() {
        // Given
        Email email = new Email("test@example.com");
        Password password = Password.create("SecurePass123!", passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);

        // When
        User saved = userRepository.save(user);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();

        Optional<User> retrieved = userRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getEmail()).isEqualTo(email);
        assertThat(retrieved.get().getRole()).isEqualTo(Role.TEACHER);
        assertThat(retrieved.get().isActive()).isTrue();
    }

    @Test
    @DisplayName("Should save teacher user")
    void shouldSaveTeacherUser() {
        // Given
        Email email = new Email("teacher@example.com");
        Password password = Password.create("TeacherPass123!", passwordEncoder);
        User teacher = User.createTeacher(testPerson, email, password);

        // When
        User saved = userRepository.save(teacher);

        // Then
        Optional<User> retrieved = userRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getRole()).isEqualTo(Role.TEACHER);
        assertThat(retrieved.get().getStudentId()).isNull();
    }

    @Test
    @DisplayName("Should save student user with student ID")
    void shouldSaveStudentUserWithStudentId() {
        // Given
        Email email = new Email("student@example.com");
        Password password = Password.create("StudentPass123!", passwordEncoder);
        String studentId = "STU-12345";
        User student = User.createStudent(testPerson, email, password, studentId);

        // When
        User saved = userRepository.save(student);

        // Then
        Optional<User> retrieved = userRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getRole()).isEqualTo(Role.STUDENT);
        assertThat(retrieved.get().getStudentId()).isEqualTo(studentId);
    }

    @Test
    @DisplayName("Should save admin user")
    void shouldSaveAdminUser() {
        // Given
        Email email = new Email("admin@example.com");
        Password password = Password.create("AdminPass123!", passwordEncoder);
        User admin = User.createAdmin(testPerson, email, password);

        // When
        User saved = userRepository.save(admin);

        // Then
        Optional<User> retrieved = userRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("Should update existing user")
    void shouldUpdateExistingUser() {
        // Given
        Email email = new Email("test@example.com");
        Password password = Password.create("Pass123!", passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);
        User saved = userRepository.save(user);

        // When
        Email newEmail = new Email("newemail@example.com");
        saved.changeEmail(newEmail);
        User updated = userRepository.save(saved);

        // Then
        Optional<User> retrieved = userRepository.findById(updated.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getEmail()).isEqualTo(newEmail);
    }

    // ========================================
    // ✅ FIND BY EMAIL TESTS
    // ========================================

    @Test
    @DisplayName("Should find user by email")
    void shouldFindUserByEmail() {
        // Given
        Email email = new Email("findme@example.com");
        Password password = Password.create("Pass123!", passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);
        userRepository.save(user);

        // When
        Optional<User> result = userRepository.findByEmail(email);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should return empty when email not found")
    void shouldReturnEmptyWhenEmailNotFound() {
        // Given
        Email nonExistentEmail = new Email("notfound@example.com");

        // When
        Optional<User> result = userRepository.findByEmail(nonExistentEmail);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find user by email case insensitively")
    void shouldFindUserByEmailCaseInsensitively() {
        // Given
        Email email = new Email("TEST@EXAMPLE.COM");
        Password password = Password.create("Pass123!", passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);
        userRepository.save(user);

        // When
        Optional<User> result = userRepository.findByEmail(new Email("test@example.com"));

        // Then
        assertThat(result).isPresent();
    }

    // ========================================
    // ✅ FIND BY PERSON ID TESTS
    // ========================================

    @Test
    @DisplayName("Should find user by person ID")
    void shouldFindUserByPersonId() {
        // Given
        Email email = new Email("test@example.com");
        Password password = Password.create("Pass123!", passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);
        userRepository.save(user);

        // When
        Optional<User> result = userRepository.findByPersonId(testPerson.getId());

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getPersonId()).isEqualTo(testPerson.getId());
    }

    @Test
    @DisplayName("Should return empty when person ID not found")
    void shouldReturnEmptyWhenPersonIdNotFound() {
        // Given
        PersonId nonExistentPersonId = PersonId.generate();

        // When
        Optional<User> result = userRepository.findByPersonId(nonExistentPersonId);

        // Then
        assertThat(result).isEmpty();
    }

    // ========================================
    // ✅ FIND BY ROLE TESTS
    // ========================================

    @Test
    @DisplayName("Should find users by role TEACHER")
    void shouldFindUsersByRoleTeacher() {
        // Given
        User teacher1 = createAndSaveTeacher("teacher1@example.com");
        User teacher2 = createAndSaveTeacher("teacher2@example.com");
        createAndSaveStudent("student@example.com");

        // When
        List<User> teachers = userRepository.findByRole(
                com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.TEACHER
        );

        // Then
        assertThat(teachers).hasSize(2);
        assertThat(teachers).allMatch(u -> u.getRole() == Role.TEACHER);
    }

    @Test
    @DisplayName("Should find users by role STUDENT")
    void shouldFindUsersByRoleStudent() {
        // Given
        createAndSaveStudent("student1@example.com");
        createAndSaveStudent("student2@example.com");
        createAndSaveTeacher("teacher@example.com");

        // When
        List<User> students = userRepository.findByRole(
                com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.STUDENT
        );

        // Then
        assertThat(students).hasSize(2);
        assertThat(students).allMatch(u -> u.getRole() == Role.STUDENT);
    }

    @Test
    @DisplayName("Should return empty list when no users of role exist")
    void shouldReturnEmptyListWhenNoUsersOfRoleExist() {
        // Given
        createAndSaveTeacher("teacher@example.com");

        // When
        List<User> admins = userRepository.findByRole(
                com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role.ADMIN
        );

        // Then
        assertThat(admins).isEmpty();
    }

    // ========================================
    // ✅ FIND ACTIVE USERS TESTS
    // ========================================

    @Test
    @DisplayName("Should find only active users")
    void shouldFindOnlyActiveUsers() {
        // Given
        User activeUser1 = createAndSaveTeacher("active1@example.com");
        User activeUser2 = createAndSaveStudent("active2@example.com");

        User inactiveUser = createAndSaveTeacher("inactive@example.com");
        inactiveUser.deactivate();
        userRepository.save(inactiveUser);

        // When
        List<User> activeUsers = userRepository.findActiveUsers();

        // Then
        assertThat(activeUsers).hasSize(2);
        assertThat(activeUsers).allMatch(User::isActive);
    }

    @Test
    @DisplayName("Should return empty list when no active users exist")
    void shouldReturnEmptyListWhenNoActiveUsersExist() {
        // Given
        User user = createAndSaveTeacher("test@example.com");
        user.deactivate();
        userRepository.save(user);

        // When
        List<User> activeUsers = userRepository.findActiveUsers();

        // Then
        assertThat(activeUsers).isEmpty();
    }

    // ========================================
    // ✅ EXISTS BY EMAIL TESTS
    // ========================================

    @Test
    @DisplayName("Should return true when email exists")
    void shouldReturnTrueWhenEmailExists() {
        // Given
        Email email = new Email("exists@example.com");
        createAndSaveTeacher(email.getValue());

        // When
        boolean exists = userRepository.existsByEmail(email);

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when email does not exist")
    void shouldReturnFalseWhenEmailDoesNotExist() {
        // Given
        Email email = new Email("notexists@example.com");

        // When
        boolean exists = userRepository.existsByEmail(email);

        // Then
        assertThat(exists).isFalse();
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete user")
    void shouldDeleteUser() {
        // Given
        User user = createAndSaveTeacher("delete@example.com");

        // When
        userRepository.delete(user);

        // Then
        Optional<User> retrieved = userRepository.findById(user.getId());
        assertThat(retrieved).isEmpty();
    }

    @Test
    @DisplayName("Should not delete associated person when deleting user")
    void shouldNotDeleteAssociatedPersonWhenDeletingUser() {
        // Given
        User user = createAndSaveTeacher("test@example.com");
        PersonId personId = user.getPersonId();

        // When
        userRepository.delete(user);

        // Then
        Optional<Person> person = personRepository.findById(personId);
        assertThat(person).isPresent(); // Person should still exist
    }

    // ========================================
    // ✅ PASSWORD PERSISTENCE TESTS
    // ========================================

    @Test
    @DisplayName("Should persist hashed password")
    void shouldPersistHashedPassword() {
        // Given
        String plainPassword = "MySecretPass123!";
        Email email = new Email("test@example.com");
        Password password = Password.create(plainPassword, passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);

        // When
        User saved = userRepository.save(user);

        // Then
        Optional<User> retrieved = userRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getPassword().getHash()).isNotEqualTo(plainPassword);
        assertThat(retrieved.get().getPassword().getHash()).startsWith("$2a$");
    }

    @Test
    @DisplayName("Should authenticate with correct password after retrieval")
    void shouldAuthenticateWithCorrectPasswordAfterRetrieval() {
        // Given
        String plainPassword = "MySecretPass123!";
        Email email = new Email("test@example.com");
        Password password = Password.create(plainPassword, passwordEncoder);
        User user = User.createTeacher(testPerson, email, password);
        User saved = userRepository.save(user);

        // When
        Optional<User> retrieved = userRepository.findById(saved.getId());

        // Then
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().authenticate(plainPassword, passwordEncoder)).isTrue();
    }

    @Test
    @DisplayName("Should update password")
    void shouldUpdatePassword() {
        // Given
        User user = createAndSaveTeacher("test@example.com");
        Password newPassword = Password.create("NewPassword456!", passwordEncoder);

        // When
        user.changePassword(newPassword);
        userRepository.save(user);

        // Then
        Optional<User> retrieved = userRepository.findById(user.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().authenticate("NewPassword456!", passwordEncoder)).isTrue();
    }

    // ========================================
    // ✅ ACTIVE STATUS TESTS
    // ========================================

    @Test
    @DisplayName("Should persist active status")
    void shouldPersistActiveStatus() {
        // Given
        User user = createAndSaveTeacher("test@example.com");

        // Then
        Optional<User> retrieved = userRepository.findById(user.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().isActive()).isTrue();
    }

    @Test
    @DisplayName("Should persist inactive status")
    void shouldPersistInactiveStatus() {
        // Given
        User user = createAndSaveTeacher("test@example.com");
        user.deactivate();
        userRepository.save(user);

        // Then
        Optional<User> retrieved = userRepository.findById(user.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().isActive()).isFalse();
    }

    @Test
    @DisplayName("Should toggle active status")
    void shouldToggleActiveStatus() {
        // Given
        User user = createAndSaveTeacher("test@example.com");

        // When - Deactivate
        user.deactivate();
        userRepository.save(user);

        // Then
        Optional<User> deactivated = userRepository.findById(user.getId());
        assertThat(deactivated.get().isActive()).isFalse();

        // When - Activate
        user.activate();
        userRepository.save(user);

        // Then
        Optional<User> activated = userRepository.findById(user.getId());
        assertThat(activated.get().isActive()).isTrue();
    }

    // ========================================
    // ✅ CREATION TIMESTAMP TESTS
    // ========================================

    @Test
    @DisplayName("Should persist creation timestamp")
    void shouldPersistCreationTimestamp() {
        // Given
        User user = createAndSaveTeacher("test@example.com");

        // Then
        Optional<User> retrieved = userRepository.findById(user.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should maintain creation timestamp across updates")
    void shouldMaintainCreationTimestampAcrossUpdates() {
        // Given
        User user = createAndSaveTeacher("test@example.com");
        var originalTimestamp = user.getCreatedAt();

        // When
        user.changeEmail(new Email("new@example.com"));
        userRepository.save(user);

        // Then
        Optional<User> retrieved = userRepository.findById(user.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getCreatedAt()).isEqualTo(originalTimestamp);
    }

    // ========================================
    // ✅ TRANSACTIONAL BEHAVIOR TESTS
    // ========================================

    @Test
    @DisplayName("Should rollback on exception")
    void shouldRollbackOnException() {
        // Given
        User user = createAndSaveTeacher("test@example.com");
        long countBefore = userJpaRepository.count();

        // When/Then
        try {
            User retrieved = userRepository.findById(user.getId()).orElseThrow();
            retrieved.changeEmail(null); // This should fail
            userRepository.save(retrieved);
            fail("Should have thrown exception");
        } catch (Exception e) {
            // Expected
        }

        // Verify no changes persisted
        assertThat(userJpaRepository.count()).isEqualTo(countBefore);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private User createAndSaveTeacher(String email) {
        Person person = Person.create("Teacher", "User");
        person = personRepository.save(person);

        Password password = Password.create("Pass123!", passwordEncoder);
        User user = User.createTeacher(person, new Email(email), password);
        return userRepository.save(user);
    }

    private User createAndSaveStudent(String email) {
        Person person = Person.create("Student", "User");
        person = personRepository.save(person);

        Password password = Password.create("Pass123!", passwordEncoder);
        User user = User.createStudent(person, new Email(email), password, "STU-" + System.currentTimeMillis());
        return userRepository.save(user);
    }
}