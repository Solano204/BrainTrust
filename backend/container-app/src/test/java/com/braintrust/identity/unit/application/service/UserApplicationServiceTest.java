package com.braintrust.identity.unit.application.service;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.application.services.UserApplicationService;
import com.braintrust.identity.domain.exceptions.InvalidPasswordException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.Password;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.security.services.JwtService;
import com.braintrust.shared.domain.exception.EmailAlreadyExistsException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserApplicationService Unit Tests")
class UserApplicationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private UserApplicationService service;

    private static final String VALID_EMAIL = "john.doe@example.com";
    private static final String VALID_PASSWORD = "SecurePassword123!";
    private static final String VALID_FIRST_NAME = "John";
    private static final String VALID_LAST_NAME = "Doe";
    private static final String VALID_GENDER = "Male";
    private static final String VALID_PHONE = "+52 961 123 4567";
    private static final String VALID_STUDENT_ID = "STU-2024-001";

    // ========================================
    // ✅ REGISTER TEACHER TESTS
    // ========================================

    @Test
    @DisplayName("Should register teacher successfully")
    void shouldRegisterTeacherSuccessfully() {
        // Given
        RegisterTeacherCommand command = new RegisterTeacherCommand(
                VALID_FIRST_NAME,
                VALID_LAST_NAME,
                VALID_EMAIL,
                VALID_PASSWORD,
                VALID_PHONE,
                VALID_GENDER
        );

        when(userRepository.existsByEmail(any(Email.class)))
                .thenReturn(false);

        when(passwordEncoder.encode(VALID_PASSWORD)).thenReturn("TEACHER_FAKE_HASH");

        Person mockPerson = mock(Person.class);
        when(mockPerson.getId()).thenReturn(PersonId.generate());
        when(personRepository.save(any(Person.class)))
                .thenReturn(mockPerson);

        User mockUser = mock(User.class);
        when(mockUser.getId()).thenReturn(UserId.generate());
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);

        // When
        UserId result = service.registerTeacher(command);

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).existsByEmail(any(Email.class));
        verify(personRepository).save(any(Person.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when registering teacher with existing email")
    void shouldThrowExceptionWhenRegisteringTeacherWithExistingEmail() {
        // Given
        RegisterTeacherCommand command = new RegisterTeacherCommand(
                VALID_FIRST_NAME,
                VALID_LAST_NAME,
                VALID_EMAIL,
                VALID_PASSWORD,
                VALID_PHONE,
                VALID_GENDER
        );

        when(userRepository.existsByEmail(any(Email.class)))
                .thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> service.registerTeacher(command))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("Email already registered");

        verify(personRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    // ========================================
    // ✅ REGISTER STUDENT TESTS
    // ========================================

    @Test
    @DisplayName("Should register student successfully")
    void shouldRegisterStudentSuccessfully() {
        // Given
        RegisterStudentCommand command = new RegisterStudentCommand(
                VALID_FIRST_NAME,
                VALID_LAST_NAME,
                VALID_EMAIL,
                VALID_PASSWORD,
                VALID_STUDENT_ID,
                VALID_PHONE,
                VALID_GENDER
        );

        when(userRepository.existsByEmail(any(Email.class)))
                .thenReturn(false);
        when(passwordEncoder.encode(VALID_PASSWORD)).thenReturn("STUDENT_FAKE_HASH");
        Person mockPerson = mock(Person.class);
        when(mockPerson.getId()).thenReturn(PersonId.generate());
        when(personRepository.save(any(Person.class)))
                .thenReturn(mockPerson);

        User mockUser = mock(User.class);
        when(mockUser.getId()).thenReturn(UserId.generate());
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);

        // When
        UserId result = service.registerStudent(command);

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).existsByEmail(any(Email.class));
        verify(personRepository).save(any(Person.class));
        verify(userRepository).save(any(User.class));
    }

    // ========================================
    // ✅ REGISTER ADMIN TESTS
    // ========================================

    @Test
    @DisplayName("Should register admin successfully")
    void shouldRegisterAdminSuccessfully() {
        // Given
        RegisterAdminCommand command = new RegisterAdminCommand(
                "alndkjdsfjhk",
                "asjkdhdsjakhsdaj",
                "admin@example.com",
                VALID_PASSWORD,
                "+52 961 999 0000",
                "Male"
        );

        when(userRepository.existsByEmail(any(Email.class)))
                .thenReturn(false);
        Person mockPerson = mock(Person.class);
        when(mockPerson.getId()).thenReturn(PersonId.generate());
        when(passwordEncoder.encode(VALID_PASSWORD)).thenReturn("ADMIN_FAKE_HASH");

        when(personRepository.save(any(Person.class)))
                .thenReturn(mockPerson);

        User mockUser = mock(User.class);
        when(mockUser.getId()).thenReturn(UserId.generate());
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);

        // When
        UserId result = service.registerAdmin(command);

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    // ========================================
    // ✅ UPDATE USER PERSONAL INFO TESTS
    // ========================================

    @Test
    @DisplayName("Should update user personal info successfully")
    void shouldUpdateUserPersonalInfoSuccessfully() {
        // Given
        Person mockPerson = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        User mockUser = mock(User.class);
        when(mockUser.getPersonId()).thenReturn(mockPerson.getId());

        UpdateUserInfoCommand command = new UpdateUserInfoCommand(
                "USER-123",
                "Jane",
                "Smith",
                "Female",
                "+52 961 888 7777"
        );

        when(userRepository.findById(any(UserId.class)))
                .thenReturn(Optional.of(mockUser));
        when(personRepository.findById(any()))
                .thenReturn(Optional.of(mockPerson));
        when(personRepository.save(any(Person.class)))
                .thenReturn(mockPerson);

        // When
        service.updateUserPersonalInfo(command);

        // Then
        verify(userRepository).findById(any(UserId.class));
        verify(personRepository).findById(any());
        verify(personRepository).save(any(Person.class));
    }

    // ========================================
    // ✅ CHANGE EMAIL TESTS
    // ========================================

    @Test
    @DisplayName("Should change user email successfully")
    void shouldChangeUserEmailSuccessfully() {
        // Given
        User mockUser = mock(User.class);
        ChangeEmailCommand command = new ChangeEmailCommand(
                "USER-123",
                "newemail@example.com"
        );

        when(userRepository.findById(any(UserId.class)))
                .thenReturn(Optional.of(mockUser));
        when(userRepository.existsByEmail(any(Email.class)))
                .thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);

        // When
        service.changeUserEmail(command);

        // Then
        verify(mockUser).changeEmail(any(Email.class));
        verify(userRepository).save(mockUser);
    }

    @Test
    @DisplayName("Should throw exception when changing to existing email")
    void shouldThrowExceptionWhenChangingToExistingEmail() {
        // Given
        User mockUser = mock(User.class);
        ChangeEmailCommand command = new ChangeEmailCommand(
                "USER-123",
                "existing@example.com"
        );

        when(userRepository.findById(any(UserId.class)))
                .thenReturn(Optional.of(mockUser));
        when(userRepository.existsByEmail(any(Email.class)))
                .thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> service.changeUserEmail(command))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }

    // ========================================
    // ✅ CHANGE PASSWORD TESTS
    // ========================================

    @Test
    @DisplayName("Should change password successfully")
    void shouldChangePasswordSuccessfully() {
        // Given
        User mockUser = mock(User.class);
        when(mockUser.authenticate(anyString(), any(PasswordEncoder.class)))
                .thenReturn(true);

        ChangePasswordCommand command = new ChangePasswordCommand(
                "USER-123",
                "OldPassword123!",
                "NewPassword456!"
        );

        when(userRepository.findById(any(UserId.class)))
                .thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);
        when(passwordEncoder.encode(command.newPassword()))
                .thenReturn("NEW_PASSWORD_HASH");
        // When
        service.changeUserPassword(command);

        // Then
        verify(mockUser).authenticate("OldPassword123!", passwordEncoder);
        verify(mockUser).changePassword(any(Password.class));
        verify(userRepository).save(mockUser);
    }

    @Test
    @DisplayName("Should throw exception when current password is incorrect")
    void shouldThrowExceptionWhenCurrentPasswordIsIncorrect() {
        // Given
        User mockUser = mock(User.class);
        when(mockUser.authenticate(anyString(), any(PasswordEncoder.class)))
                .thenReturn(false);

        ChangePasswordCommand command = new ChangePasswordCommand(
                "USER-123",
                "WrongPassword",
                "NewPassword456!"
        );

        when(userRepository.findById(any(UserId.class)))
                .thenReturn(Optional.of(mockUser));

        // When/Then
        assertThatThrownBy(() -> service.changeUserPassword(command))
                .isInstanceOf(InvalidPasswordException.class)
                .hasMessageContaining("Current password is incorrect");

        verify(userRepository, never()).save(any());
    }

    // ========================================
    // ✅ ACTIVATE/DEACTIVATE TESTS
    // ========================================

    @Test
    @DisplayName("Should deactivate user successfully")
    void shouldDeactivateUserSuccessfully() {
        // Given
        User mockUser = mock(User.class);
        UserId userId = UserId.generate();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);

        // When
        service.deactivateUser(userId);

        // Then
        verify(mockUser).deactivate();
        verify(userRepository).save(mockUser);
    }

    @Test
    @DisplayName("Should activate user successfully")
    void shouldActivateUserSuccessfully() {
        // Given
        User mockUser = mock(User.class);
        UserId userId = UserId.generate();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class)))
                .thenReturn(mockUser);

        // When
        service.activateUser(userId);

        // Then
        verify(mockUser).activate();
        verify(userRepository).save(mockUser);
    }

    // ========================================
    // ✅ GET USER TESTS
    // ========================================

    @Test
    @DisplayName("Should get user by ID successfully")
    void shouldGetUserByIdSuccessfully() {
        // Given
        Person mockPerson = Person.create(VALID_FIRST_NAME, VALID_LAST_NAME);
        User mockUser = mock(User.class);
        when(mockUser.getId()).thenReturn(UserId.generate());
        when(mockUser.getPersonId()).thenReturn(mockPerson.getId());
        when(mockUser.getEmail()).thenReturn(new Email(VALID_EMAIL));
        when(mockUser.getRole()).thenReturn(Role.TEACHER);
        when(mockUser.isActive()).thenReturn(true);

        when(userRepository.findById(any(UserId.class)))
                .thenReturn(Optional.of(mockUser));
        when(personRepository.findById(any()))
                .thenReturn(Optional.of(mockPerson));

        // When
        UserDTO result = service.getUserById(mockUser.getId());

        // Then
        assertThat(result).isNotNull();
        verify(userRepository).findById(any(UserId.class));
        verify(personRepository).findById(any());
    }

    @Test
    @DisplayName("Should throw exception when user not found by ID")
    void shouldThrowExceptionWhenUserNotFoundById() {
        // Given
        UserId userId = UserId.generate();
        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> service.getUserById(userId))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    @DisplayName("Should check if email is available")
    void shouldCheckIfEmailIsAvailable() {
        // Given
        Email email = new Email(VALID_EMAIL);
        when(userRepository.existsByEmail(email))
                .thenReturn(false);

        // When
        boolean available = service.isEmailAvailable(email);

        // Then
        assertThat(available).isTrue();
        verify(userRepository).existsByEmail(email);
    }

    @Test
    @DisplayName("Should return false when email is not available")
    void shouldReturnFalseWhenEmailIsNotAvailable() {
        // Given
        Email email = new Email(VALID_EMAIL);
        when(userRepository.existsByEmail(email))
                .thenReturn(true);

        // When
        boolean available = service.isEmailAvailable(email);

        // Then
        assertThat(available).isFalse();
    }
}