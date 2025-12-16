package com.braintrust.identity.application.ports.in;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PersonService {

    // Commands
    PersonId createPerson(CreatePersonCommand command);

    void updatePersonalInfo(UpdatePersonInfoCommand command);

    void updateAddress(UpdatePersonAddressCommand command);

    void updateImage(UpdateImageCommand command);

    // Queries
    PersonDTO getPersonById(PersonId personId);

    PersonDTO getPersonByUserId(UserId userId);

    Page<PersonDTO> getAllPersons(Pageable pageable);
}