package com.braintrust.containerapp.rest.identity;

import com.braintrust.education.application.dtos.dtos.PaginatedResponse;
import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.AuthenticationResult;
import com.braintrust.identity.application.dtos.dtos.CompleteUserDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Tag(
        name = "User Management (Identity)",
        description = "APIs for user registration, authentication, and core profile management."
)
public class UserController {

    private static final Logger log =
            LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(
            summary = "Create complete user with all information",
            description = "Creates a user with complete personal information, address, and account details in a single operation. Reduces multiple API calls into one efficient transaction."
    )
    @ApiResponse(responseCode = "201", description = "User created successfully with all information")
    @ApiResponse(responseCode = "400", description = "Invalid input or email already registered")
    @PostMapping("/register/complete")
    public ResponseEntity<CompleteUserDTO> createCompleteUser(
            @RequestBody @Valid CreateCompleteUserCommand command) {

        log.info("Creating complete user: {} {} ({})",
                command.firstName(), command.lastName(), command.role());

        CompleteUserDTO result = userService.createCompleteUser(command);

        log.info("Complete user created successfully. User ID: {}, Person ID: {}",
                result.userId(), result.personId());

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }


    @Operation(
            summary = "Get all users with pagination",
            description = "Retrieves a paginated list of all users. Supports sorting and filtering by page/size."
    )
    @ApiResponse(responseCode = "200", description = "Paginated users retrieved successfully")
    @GetMapping("/paginated")
    public ResponseEntity<PaginatedResponse<UserDTO>> getAllUsersPaginated(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Number of items per page", example = "20")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Sort by field (e.g., 'email,asc' or 'createdAt,desc')",
                    example = "createdAt,desc")
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        log.info("Fetching paginated users. Page: {}, Size: {}, Sort: {}", page, size, sort);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<UserDTO> userPage = userService.getAllUsers(pageable);

        PaginatedResponse<UserDTO> response = PaginatedResponse.fromPage(userPage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get users by role with pagination",
            description = "Retrieves a paginated list of users filtered by role."
    )
    @ApiResponse(responseCode = "200", description = "Paginated users by role retrieved successfully")
    @GetMapping("/role/{role}/paginated")
    public ResponseEntity<PaginatedResponse<UserDTO>> getUsersByRolePaginated(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        log.info("Fetching paginated users with role: {}. Page: {}, Size: {}", role, page, size);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<UserDTO> userPage = userService.getUsersByRole(
                Role.valueOf(role.toUpperCase()),
                pageable
        );

        PaginatedResponse<UserDTO> response = PaginatedResponse.fromPage(userPage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search users by name",
            description = "Searches users by name (first name, last name, or full name) with pagination support."
    )
    @ApiResponse(responseCode = "200", description = "Users found successfully")
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<UserDTO>> searchUsersByName(
            @Parameter(description = "Name to search for", required = true)
            @RequestParam String name,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Searching users by name: '{}'. Page: {}, Size: {}", name, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<UserDTO> userPage = userService.searchUsersByName(name, pageable);

        PaginatedResponse<UserDTO> response = PaginatedResponse.fromPage(userPage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search users by name and role",
            description = "Searches users by name within a specific role with pagination."
    )
    @ApiResponse(responseCode = "200", description = "Users found successfully")
    @GetMapping("/search/{role}")
    public ResponseEntity<PaginatedResponse<UserDTO>> searchUsersByNameAndRole(
            @PathVariable String role,
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "firstName,asc") String sort) {

        log.info("Searching users by name: '{}' with role: {}. Page: {}, Size: {}",
                name, role, page, size);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<UserDTO> userPage = userService.searchUsersByNameAndRole(
                name,
                Role.valueOf(role.toUpperCase()),
                pageable
        );

        PaginatedResponse<UserDTO> response = PaginatedResponse.fromPage(userPage);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Authenticate user and get access tokens", description = "Exchanges email and password for a short-lived Access Token and a long-lived Refresh Token.")
    @ApiResponse(responseCode = "200", description = "Authentication successful",
            content = @Content(schema = @Schema(implementation = AuthenticationResult.class)))
    @ApiResponse(responseCode = "401", description = "Invalid credentials or account inactive",
            content = @Content(schema = @Schema(implementation = AuthenticationResult.class)))
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResult> authenticate(
            @RequestBody @Valid AuthenticateUserCommand command) {

        log.debug("Authentication attempt for email: {}", command.email());

        AuthenticationResult result = userService.authenticate(command);

        if (result.success()) {
            log.info("Authentication successful for user: {}", command.email());
            return ResponseEntity.ok(result);
        } else {
            log.warn("Authentication failed for email: {}. Reason: Invalid credentials or account state.", command.email());
            return ResponseEntity.status(401).body(result);
        }
    }

    @Operation(summary = "Refresh access token", description = "Uses a valid Refresh Token to generate a new Access Token without re-authenticating.")
    @ApiResponse(responseCode = "200", description = "Token refresh successful",
            content = @Content(schema = @Schema(implementation = AuthenticationResult.class)))
    @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token",
            content = @Content(schema = @Schema(implementation = AuthenticationResult.class)))
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResult> refreshToken(
            @RequestBody @Valid RefreshTokenCommand command) {

        log.debug("Refresh token request received for token starting with: {}...",
                command.refreshToken().substring(0, 10));

        AuthenticationResult result = userService.refreshToken(command);

        if (result.success()) {
            log.info("Token refresh successful. New token issued.");
            return ResponseEntity.ok(result);
        } else {
            log.warn("Token refresh failed. Old token likely expired or invalid.");
            return ResponseEntity.status(401).body(result);
        }
    }

    @Operation(summary = "Client-side logout (informational)", description = "Informs the backend of a client-side logout. No server-side session change in stateless JWT (optional token blacklisting).")
    @ApiResponse(responseCode = "200", description = "Logout acknowledged")
    @PostMapping("/logout")
    public ResponseEntity<SuccessResponseDTO> logout() {
        log.info("Logout request received. Token presumed invalidated client-side.");
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Logged out successfully", null)
        );
    }

    @Operation(summary = "Update user's personal information (PII)", description = "Updates first name, last name, gender, and phone number for the associated person record.")
    @ApiResponse(responseCode = "200", description = "Information updated successfully")
    @PutMapping("/personal-info")
    public ResponseEntity<SuccessResponseDTO> updatePersonalInfo(@RequestBody UpdateUserInfoCommand command) {
        log.info("Updating personal info for User ID: {}", command.userId());
        userService.updateUserPersonalInfo(command);
        log.debug("Personal information updated successfully for ID: {}", command.userId());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Personal information updated successfully", null));
    }

    @Operation(summary = "Change user's login email address", description = "Updates the user's primary login email address.")
    @ApiResponse(responseCode = "200", description = "Email changed successfully")
    @ApiResponse(responseCode = "400", description = "New email is already in use")
    @PutMapping("/email")
    public ResponseEntity<SuccessResponseDTO> changeEmail(@RequestBody ChangeEmailCommand command) {
        log.info("Attempting email change for User ID: {}", command.userId());
        userService.changeUserEmail(command);
        log.info("Email successfully changed for ID: {}", command.userId());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Email changed successfully", null));
    }

    @Operation(summary = "Change user's password", description = "Requires the current password to be verified before setting a new password.")
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "400", description = "Current password was incorrect")
    @PutMapping("/password")
    public ResponseEntity<SuccessResponseDTO> changePassword(@RequestBody ChangePasswordCommand command) {
        log.warn("Attempting password change for User ID: {}", command.userId());
        userService.changeUserPassword(command);
        log.info("Password successfully changed for ID: {}", command.userId());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Password changed successfully", null));
    }

    @Operation(summary = "Deactivate user account (Admin/Self)", description = "Sets the user's active status to FALSE, preventing future logins.")
    @ApiResponse(responseCode = "200", description = "User deactivated successfully")
    @Parameter(name = "userId", description = "The ID of the user to deactivate", required = true)
    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<SuccessResponseDTO> deactivateUser(@PathVariable String userId) {
        log.warn("Deactivation request received for User ID: {}", userId);
        userService.deactivateUser(UserId.fromString(userId));
        log.info("User ID {} deactivated successfully.", userId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "User deactivated successfully", null));
    }

    @Operation(summary = "Activate user account (Admin)", description = "Sets the user's active status to TRUE.")
    @ApiResponse(responseCode = "200", description = "User activated successfully")
    @Parameter(name = "userId", description = "The ID of the user to activate", required = true)
    @PutMapping("/{userId}/activate")
    public ResponseEntity<SuccessResponseDTO> activateUser(@PathVariable String userId) {
        log.info("Activation request received for User ID: {}", userId);
        userService.activateUser(UserId.fromString(userId));
        log.info("User ID {} activated successfully.", userId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "User activated successfully", null));
    }

    @Operation(summary = "Get user by ID", description = "Retrieves complete user and person information by UserId.")
    @ApiResponse(responseCode = "200", description = "User data retrieved")
    @ApiResponse(responseCode = "404", description = "User not found")
    @Parameter(name = "userId", description = "The ID of the user", required = true)
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String userId) {
        log.debug("Fetching user details for User ID: {}", userId);
        UserDTO user = userService.getUserById(UserId.fromString(userId));
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get users by role", description = "Retrieves a list of all users filtered by their primary role (e.g., ADMIN, STUDENT).")
    @ApiResponse(responseCode = "200", description = "List of users retrieved")
    @Parameter(name = "role", description = "The role name (e.g., STUDENT)", required = true)
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        log.debug("Fetching all users with role: {}", role.toUpperCase());
        List<UserDTO> users = userService.getUsersByRole(Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(users);
    }


    @Operation(
            summary = "Delete user by ID",
            description = "Permanently deletes a user from the system. This action cannot be undone."
    )
    @ApiResponse(responseCode = "200", description = "User deleted successfully")
    @ApiResponse(responseCode = "404", description = "User not found")
    @ApiResponse(responseCode = "400", description = "Invalid user ID or constraint violation")
    @Parameter(name = "userId", description = "The ID of the user to delete", required = true)
    @DeleteMapping("/{userId}")
    public ResponseEntity<SuccessResponseDTO> deleteUser(@PathVariable String userId) {
        log.warn("Delete request received for User ID: {}", userId);

            userService.deleteUser(UserId.fromString(userId));

            log.info("User ID {} deleted successfully.", userId);

            return ResponseEntity.ok(
                    new SuccessResponseDTO(true, "User deleted successfully", null)
            );


    }



    @Operation(
            summary = "Admin: Reset user password (privileged operation)",
            description = "Allows administrators to change any user's password without knowing the current password. " +
                    "This is a privileged operation for account recovery and administrative purposes.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "Password reset successfully")
    @ApiResponse(responseCode = "403", description = "Forbidden: Caller does not have ADMIN role")
    @ApiResponse(responseCode = "404", description = "User not found")

    @PutMapping("/admin/reset-password")
    public ResponseEntity<SuccessResponseDTO> adminResetPassword(
            @RequestBody @Valid AdminChangePasswordCommand command) {

        log.warn("ADMIN password reset requested by admin for User ID: {}", command.userId());

        userService.adminChangePassword(command);

        log.warn("ADMIN password reset completed for User ID: {}", command.userId());

        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Password reset successfully", null)
        );
    }

}