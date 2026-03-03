package com.braintrust.identity.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Comando para crear una persona.
 * CURP y RFC son opcionales en la creación.
 * Si se provee CURP, se valida y se extrae la fecha de nacimiento automáticamente.
 */
public record CreatePersonCommand(

        @NotBlank(message = "El primer nombre es obligatorio")
        String primerNombre,

        String segundoNombre,

        @NotBlank(message = "El apellido paterno es obligatorio")
        String apellidoPaterno,

        String apellidoMaterno,

        @Pattern(
                regexp = "^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$",
                message = "El CURP debe tener el formato estándar mexicano de 18 caracteres"
        )
        String curp,

        @Size(min = 12, max = 13, message = "El RFC debe tener 12 o 13 caracteres")
        String rfc,

        String gender,
        String phone,

        // ── Dirección (todos opcionales) ──────────────────────────────────────
        String street,
        String colony,
        String municipality,
        String state,
        String postalCode

) {
    @Deprecated public String firstName() { return primerNombre; }
    @Deprecated public String lastName()  { return apellidoPaterno; }

    /** Indica si el comando incluye dirección completa para persistirla. */
    public boolean hasAddress() {
        return street != null && !street.isBlank()
                && postalCode != null && !postalCode.isBlank();
    }
}