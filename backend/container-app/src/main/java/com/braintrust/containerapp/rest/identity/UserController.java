package com.braintrust.containerapp.rest.identity;


import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.ErrorResponseDTO;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ REGISTRATION ENDPOINTS

    @PostMapping("/register/teacher")
    public ResponseEntity<SuccessResponseDTO> registerTeacher(@RequestBody RegisterTeacherCommand command) {
        UserId userId = userService.registerTeacher(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Teacher registered successfully", userId.getValue()));
    }

    @PostMapping("/register/student")
    public ResponseEntity<SuccessResponseDTO> registerStudent(@RequestBody RegisterStudentCommand command) {
        UserId userId = userService.registerStudent(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Student registered successfully", userId.getValue()));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<SuccessResponseDTO> registerAdmin(@RequestBody RegisterAdminCommand command) {
        UserId userId = userService.registerAdmin(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Admin registered successfully", userId.getValue()));
    }

    // ✅ AUTHENTICATION ENDPOINT

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticateUserCommand command) {
        AuthenticationResult result = userService.authenticate(command);

        if (result.success()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponseDTO(
                            java.time.Instant.now().toString(),
                            401,
                            "Unauthorized",
                            result.failureReason(),
                            "/api/users/authenticate"
                    ));
        }
    }

    // ✅ UPDATE ENDPOINTS

    @PutMapping("/personal-info")
    public ResponseEntity<SuccessResponseDTO> updatePersonalInfo(@RequestBody UpdateUserInfoCommand command) {
        userService.updateUserPersonalInfo(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Personal information updated successfully", null));
    }

    @PutMapping("/email")
    public ResponseEntity<SuccessResponseDTO> changeEmail(@RequestBody ChangeEmailCommand command) {
        userService.changeUserEmail(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Email changed successfully", null));
    }

    @PutMapping("/password")
    public ResponseEntity<SuccessResponseDTO> changePassword(@RequestBody ChangePasswordCommand command) {
        userService.changeUserPassword(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Password changed successfully", null));
    }

    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<SuccessResponseDTO> deactivateUser(@PathVariable String userId) {
        userService.deactivateUser(UserId.fromString(userId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "User deactivated successfully", null));
    }

    @PutMapping("/{userId}/activate")
    public ResponseEntity<SuccessResponseDTO> activateUser(@PathVariable String userId) {
        userService.activateUser(UserId.fromString(userId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "User activated successfully", null));
    }

    // ✅ QUERY ENDPOINTS

    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String userId) {
        UserDTO user = userService.getUserById(UserId.fromString(userId));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(new Email(email));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<UserDTO> getUserByPersonId(@PathVariable String personId) {
        UserDTO user = userService.getUserByPersonId(PersonId.fromString(personId));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        List<UserDTO> users = userService.getUsersByRole(Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserDTO>> getActiveUsers() {
        List<UserDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/email-available/{email}")
    public ResponseEntity<Boolean> isEmailAvailable(@PathVariable String email) {
        boolean available = userService.isEmailAvailable(new Email(email));
        return ResponseEntity.ok(available);
    }
}