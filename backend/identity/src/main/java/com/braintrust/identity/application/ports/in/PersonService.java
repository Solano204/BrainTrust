package com.braintrust.identity.application.ports.in;

import com.braintrust.identity.application.dtos.commands.*;
import com.braintrust.identity.application.dtos.dtos.PersonDTO;
import com.braintrust.identity.application.dtos.dtos.PersonSummaryDTO;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PersonService {

    /** Crea una persona. Puede existir sin usuario. */
    PersonId createPerson(CreatePersonCommand command);

    /**
     * Actualiza datos personales. CURP y RFC NO son modificables.
     */
    void updatePersonalInfo(UpdatePersonInfoCommand command);

    void updateAddress(UpdatePersonAddressCommand command);

    void updateImage(UpdateImageCommand command);
    List<PersonSummaryDTO> getAllPersonsSummary();

    /**
     * Elimina una persona.
     * Lanza PersonHasLinkedUserException si tiene usuarios vinculados.
     */
    void deletePerson(PersonId personId);

    PersonDTO getPersonById(PersonId personId);

    /** @deprecated */
    @Deprecated
    PersonDTO getPersonByUserId(UserId userId);

    Page<PersonDTO> getAllPersons(Pageable pageable);
}