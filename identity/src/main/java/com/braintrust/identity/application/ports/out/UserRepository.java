package com.braintrust.identity.application.ports.out;

import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

public interface UserRepository {

    // Commands
    User save(User user);
    void delete(User user);

    // Queries
    Optional<User> findById(UserId userId);
    Optional<User> findByEmail(Email email);
    Optional<User> findByPersonId(PersonId personId);
    List<User> findByRole(Role role);
    List<User> findActiveUsers();
    boolean existsByEmail(Email email);
}