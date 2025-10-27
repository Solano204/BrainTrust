package com.braintrust.identity.application.Maps;

import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.exceptions.PersonNotFoundException;
import com.braintrust.identity.domain.exceptions.UserNotFoundException;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;

public final class RepositoryHelper {

    private RepositoryHelper() {
        // Private constructor to prevent instantiation
        throw new AssertionError("Cannot instantiate utility class");
    }

    // ✅ FIND USER BY ID OR THROW
    public static User findUserByIdOrThrow(UserId userId, UserRepository userRepository) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId.getValue()));
    }

    // ✅ FIND PERSON BY ID OR THROW
    public static Person findPersonByIdOrThrow(PersonId personId, PersonRepository personRepository) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person not found: " + personId.getValue()));
    }
}