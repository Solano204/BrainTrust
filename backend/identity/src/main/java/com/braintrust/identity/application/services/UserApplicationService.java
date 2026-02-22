package com.braintrust.identity.application.services;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.*;
import com.braintrust.identity.application.helpers.user.*;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserApplicationService implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserApplicationService.class);

    private final UserRegistrationHelper registrationHelper;
    private final UserAuthenticationHelper authenticationHelper;
    private final UserManagementHelper managementHelper;
    private final UserQueryHelper queryHelper;

    public UserApplicationService(
            UserRegistrationHelper registrationHelper,
            UserAuthenticationHelper authenticationHelper,
            UserManagementHelper managementHelper,
            UserQueryHelper queryHelper) {

        this.registrationHelper = registrationHelper;
        this.authenticationHelper = authenticationHelper;
        this.managementHelper = managementHelper;
        this.queryHelper = queryHelper;

        log.info("✅ UserApplicationService initialized with specialized helpers");
    }

    @Override
    public UserId registerTeacher(RegisterTeacherCommand command) {
        return registrationHelper.registerTeacher(command);
    }

    @Override
    public UserId registerStudent(RegisterStudentCommand command) {
        return registrationHelper.registerStudent(command);
    }

    @Override
    public UserId registerAdmin(RegisterAdminCommand command) {
        return registrationHelper.registerAdmin(command);
    }

    @Override
    public CompleteUserDTO createCompleteUser(CreateCompleteUserCommand command) {
        return registrationHelper.createCompleteUser(command);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(Email email) {
        return registrationHelper.isEmailAvailable(email);
    }

    // ==================== AUTHENTICATION OPERATIONS ====================

    @Override
    public AuthenticationResult authenticate(AuthenticateUserCommand command) {
        return authenticationHelper.authenticate(command);
    }

    @Override
    public AuthenticationResult refreshToken(RefreshTokenCommand command) {
        return authenticationHelper.refreshToken(command);
    }

    // ==================== USER MANAGEMENT OPERATIONS ====================

    @Override
    public void updateUserPersonalInfo(UpdateUserInfoCommand command) {
        managementHelper.updateUserPersonalInfo(command);
    }

    @Override
    public void changeUserEmail(ChangeEmailCommand command) {
        managementHelper.changeUserEmail(command);
    }

    @Override
    public void changeUserPassword(ChangePasswordCommand command) {
        managementHelper.changeUserPassword(command);
    }

    @Override
    public void adminChangePassword(AdminChangePasswordCommand command) {
        managementHelper.adminChangePassword(command);
    }

    @Override
    public void activateUser(UserId userId) {
        managementHelper.activateUser(userId);
    }

    @Override
    public void deactivateUser(UserId userId) {
        managementHelper.deactivateUser(userId);
    }

    @Override
    public void deleteUser(UserId userId) {
        managementHelper.deleteUser(userId);
    }

    // ==================== QUERY OPERATIONS ====================

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserById(UserId userId) {
        return queryHelper.getUserById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByEmail(Email email) {
        return queryHelper.getUserByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserByPersonId(PersonId personId) {
        return queryHelper.getUserByPersonId(personId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return queryHelper.getAllUsers(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersByRole(Role role, Pageable pageable) {
        return queryHelper.getUsersByRole(role, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(Role role) {
        return queryHelper.getUsersByRole(role);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByName(String name, Pageable pageable) {
        return queryHelper.searchUsersByName(name, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsersByNameAndRole(String name, Role role, Pageable pageable) {
        return queryHelper.searchUsersByNameAndRole(name, role, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> searchUsersByName(String searchQuery, Role role) {
        return queryHelper.searchUsersByName(searchQuery, role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getActiveUsers() {
        return queryHelper.getActiveUsers();
    }

    @Override
    @Transactional(readOnly = true)
    public MinimalUserInfoDTO getMinimalUserInfo(UserId userId) {
        return queryHelper.getMinimalUserInfo(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MinimalUserInfoDTO> getMinimalUserInfoByIds(List<String> userIds) {
        return queryHelper.getMinimalUserInfoByIds(userIds);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByIds(List<String> userIds) {
        return queryHelper.getUsersByIds(userIds);
    }
}