package com.braintrust.identity.application.ports.in;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;

// 📍 identity/application/ports/in/UserService.java
public interface UserService {
    
    // Commands
    UserId registerTeacher(RegisterTeacherCommand command);
    UserId registerStudent(RegisterStudentCommand command);
    UserId registerAdmin(RegisterAdminCommand command);
    
    void updateUserPersonalInfo(UpdateUserInfoCommand command);
    void changeUserEmail(ChangeEmailCommand command);
    void changeUserPassword(ChangePasswordCommand command);
    void deactivateUser(UserId userId);
    void activateUser(UserId userId);

    // Queries
    UserDTO getUserById(UserId userId);
    UserDTO getUserByEmail(Email email);
    UserDTO getUserByPersonId(PersonId personId);
    List<UserDTO> getUsersByRole(Role role);
    List<UserDTO> getActiveUsers();
    boolean isEmailAvailable(Email email);

    // Authentication
    // ✅ AUTHENTICATION
    AuthenticationResult authenticate(AuthenticateUserCommand command);
    AuthenticationResult refreshToken(RefreshTokenCommand command);
}