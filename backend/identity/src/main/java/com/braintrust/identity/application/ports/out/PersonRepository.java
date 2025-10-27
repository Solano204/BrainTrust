package com.braintrust.identity.application.ports.out;

import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.PersonId;

import java.util.List;
import java.util.Optional;

public interface PersonRepository {

    // Commands
    Person save(Person person);
    void delete(Person person);

    // Queries
    Optional<Person> findById(PersonId personId);
    List<Person> findAll();
}