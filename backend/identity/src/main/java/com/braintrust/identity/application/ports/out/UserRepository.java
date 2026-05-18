package com.braintrust.identity.application.ports.out;

import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;

import java.util.List;
import java.util.Optional;


import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    void deleteById(UserId userId);


    User save(User user);
    void delete(User user);


    Optional<User> findById(UserId userId);
    Optional<User> findByEmail(Email email);
    Optional<User> findByPersonId(PersonId personId);
    List<User> findByRole(Role role);
    List<User> findActiveUsers();
    boolean existsByEmail(Email email);


    Page<User> findAll(Pageable pageable);
    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByNameContaining(String name, Pageable pageable);
    Page<User> findByNameContainingAndRole(String name, Role role, Pageable pageable);
}