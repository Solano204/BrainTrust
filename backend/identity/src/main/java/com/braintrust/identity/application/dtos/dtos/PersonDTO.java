package com.braintrust.identity.application.dtos.dtos;


/**
 * DTO de lectura de una persona con todos sus campos nuevos.
 */
public record PersonDTO(
        String id,
        String curp,
        String rfc,
        String primerNombre,
        String segundoNombre,
        String apellidoPaterno,
        String apellidoMaterno,
        String nombreCompleto,
        String gender,
        String phone,
        String birthDate,        // ISO date string "YYYY-MM-DD"
        Integer age,             // calculada
        String registrationDate,
        String imagePath,
        AddressDTO address,
        boolean tieneUsuario     // indica si tiene al menos un user vinculado
) {
    // ── Compatibilidad legacy con código que usaba firstName / lastName ──────
    /** @deprecated usar {@link #primerNombre()} */
    @Deprecated
    public String firstName() { return primerNombre; }
    /** @deprecated usar {@link #apellidoPaterno()} */
    @Deprecated
    public String lastName()  { return apellidoPaterno; }
    /** @deprecated usar {@link #nombreCompleto()} */
    @Deprecated
    public String fullName()  { return nombreCompleto; }
}