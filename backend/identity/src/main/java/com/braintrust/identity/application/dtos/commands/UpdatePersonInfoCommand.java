package com.braintrust.identity.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Comando para actualizar datos personales.
 * CURP y RFC NO son modificables una vez registrados → no se incluyen.
 */
public record UpdatePersonInfoCommand(

        @NotBlank(message = "El ID de la persona es obligatorio")
        String personId,

        @NotBlank(message = "El primer nombre es obligatorio")
        String primerNombre,

        String segundoNombre,

        @NotBlank(message = "El apellido paterno es obligatorio")
        String apellidoPaterno,

        String apellidoMaterno,

        String gender,
        String phone
) {
    // ── Compatibilidad legacy ────────────────────────────────────────────────
    /** @deprecated usar {@link #primerNombre()} */
    @Deprecated
    public String firstName() { return primerNombre; }
    /** @deprecated usar {@link #apellidoPaterno()} */
    @Deprecated
    public String lastName()  { return apellidoPaterno; }
}