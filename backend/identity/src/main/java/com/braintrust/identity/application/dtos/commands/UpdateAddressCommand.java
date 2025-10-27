package com.braintrust.identity.application.dtos.commands;

import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;

public record UpdateAddressCommand(
        PersonId personId,
        Address address
) {}