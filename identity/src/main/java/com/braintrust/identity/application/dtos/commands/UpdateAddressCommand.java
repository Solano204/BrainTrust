package com.braintrust.identity.application.dtos.commands;

import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record UpdateAddressCommand(
        @NotNull(message = "Person ID is required")
        PersonId personId,

        @NotNull(message = "Address is required")
        @Valid
        Address address
) {}