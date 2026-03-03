package com.braintrust.identity.domain.model;

import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.domain.Entity;

import java.time.LocalDate;
import java.time.Period;

/**
 * Modelo de dominio Person.
 *
 * Cambios:
 * - firstName  → primerNombre  (primer nombre de pila)
 * - Nuevo:       segundoNombre (segundo nombre de pila, opcional)
 * - lastName   → apellidoPaterno
 * - Nuevo:       apellidoMaterno (opcional)
 * - Nuevos:     curp, rfc, birthDate, age (calculada)
 *
 * Reglas de negocio:
 * - CURP y RFC no pueden modificarse una vez asignados.
 * - birthDate se deriva automáticamente del CURP.
 * - Rango de edad: 10–90 años.
 * - Una persona puede existir sin usuario.
 */
public class Person extends Entity<PersonId> {

    private String primerNombre;
    private String segundoNombre;      // opcional
    private String apellidoPaterno;
    private String apellidoMaterno;    // opcional

    private String curp;               // 18 chars, inmutable una vez asignado
    private String rfc;                // 13 chars, inmutable una vez asignado
    private LocalDate birthDate;       // derivada del CURP
    // age es calculada → siempre se computa desde birthDate

    private String gender;
    private String phone;
    private LocalDate registrationDate;
    private String imagePath;
    private Address address;

    // ── Constructor privado ──────────────────────────────────────────────────

    private Person(PersonId id, String primerNombre, String apellidoPaterno) {
        this.id = id;
        this.primerNombre    = validateName(primerNombre, "Primer nombre");
        this.apellidoPaterno = validateName(apellidoPaterno, "Apellido paterno");
        this.registrationDate = LocalDate.now();
    }

    // ── Fábricas ─────────────────────────────────────────────────────────────

    /**
     * Crea una persona nueva (sin usuario aún).
     * CURP y RFC son opcionales en la creación pero se pueden asignar después.
     */
    public static Person create(String primerNombre, String apellidoPaterno) {
        PersonId id = PersonId.generate();
        return new Person(id, primerNombre, apellidoPaterno);
    }

    /**
     * Crea una persona nueva con todos los campos de nombre.
     */
    public static Person createFull(
            String primerNombre,
            String segundoNombre,
            String apellidoPaterno,
            String apellidoMaterno,
            String curp,
            String rfc) {
        PersonId id = PersonId.generate();
        Person person = new Person(id, primerNombre, apellidoPaterno);
        person.segundoNombre   = segundoNombre;
        person.apellidoMaterno = apellidoMaterno;
        if (curp != null) person.assignCurp(curp);
        person.rfc = rfc;
        return person;
    }

    /**
     * Reconstituye una persona desde persistencia.
     */
    public static Person reconstitute(
            PersonId id,
            String primerNombre,
            String segundoNombre,
            String apellidoPaterno,
            String apellidoMaterno,
            String curp,
            String rfc,
            LocalDate birthDate,
            Integer age,
            String gender,
            String phone,
            LocalDate registrationDate,
            String imagePath,
            Address address) {

        Person person = new Person(id, primerNombre, apellidoPaterno);
        person.segundoNombre    = segundoNombre;
        person.apellidoMaterno  = apellidoMaterno;
        person.curp             = curp;
        person.rfc              = rfc;
        person.birthDate        = birthDate;
        person.gender           = gender;
        person.phone            = phone;
        person.registrationDate = registrationDate;
        person.imagePath        = imagePath;
        person.address          = address;
        return person;
    }

    /**
     * @deprecated Usar {@link #reconstitute(PersonId, String, String, String, String, String, String, LocalDate, Integer, String, String, LocalDate, String, Address)}
     * Mantenido por compatibilidad con código legacy.
     */
    @Deprecated
    public static Person reconstitute(PersonId id, String firstName, String lastName,
                                      String gender, String phone, LocalDate registrationDate,
                                      String imagePath, Address address) {
        Person person = new Person(id, firstName, lastName);
        person.gender           = gender;
        person.phone            = phone;
        person.registrationDate = registrationDate;
        person.imagePath        = imagePath;
        person.address          = address;
        return person;
    }

    // ── Comandos de dominio ───────────────────────────────────────────────────

    /**
     * Asigna la CURP. Solo puede hacerse una vez.
     * La fecha de nacimiento se extrae automáticamente.
     * Valida rango de 10 a 90 años.
     */
    public void assignCurp(String curp) {
        if (this.curp != null && !this.curp.isBlank()) {
            throw new IllegalStateException("El CURP no puede modificarse una vez registrado.");
        }
        String validated = validateCurp(curp);
        this.curp = validated;
        this.birthDate = extractBirthDateFromCurp(validated);
    }

    /**
     * Asigna el RFC. Solo puede hacerse una vez.
     */
    public void assignRfc(String rfc) {
        if (this.rfc != null && !this.rfc.isBlank()) {
            throw new IllegalStateException("El RFC no puede modificarse una vez registrado.");
        }
        this.rfc = validateRfc(rfc);
    }

    /**
     * Actualiza la información personal (excepto CURP y RFC).
     */
    public void updatePersonalInfo(String primerNombre, String segundoNombre,
                                   String apellidoPaterno, String apellidoMaterno,
                                   String gender, String phone) {
        this.primerNombre    = validateName(primerNombre, "Primer nombre");
        this.segundoNombre   = segundoNombre;
        this.apellidoPaterno = validateName(apellidoPaterno, "Apellido paterno");
        this.apellidoMaterno = apellidoMaterno;
        this.gender          = gender;
        this.phone           = phone;
    }

    /**
     * @deprecated Usar {@link #updatePersonalInfo(String, String, String, String, String, String)}
     */
    @Deprecated
    public void updatePersonalInfo(String firstName, String lastName, String gender, String phone) {
        this.primerNombre    = validateName(firstName, "Primer nombre");
        this.apellidoPaterno = validateName(lastName, "Apellido paterno");
        this.gender          = gender;
        this.phone           = phone;
    }

    public void updateAddress(Address newAddress) {
        this.address = newAddress;
    }

    public void updateImage(String image) {
        this.imagePath = image;
    }

    // ── Lógica de dominio ────────────────────────────────────────────────────

    /**
     * Calcula la edad a partir de birthDate.
     * @return edad en años, o null si birthDate es nulo.
     */
    public Integer getAge() {
        if (birthDate == null) return null;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    /**
     * Nombre completo: primerNombre [segundoNombre] apellidoPaterno [apellidoMaterno]
     */
    public String getFullName() {
        StringBuilder sb = new StringBuilder(primerNombre);
        if (segundoNombre != null && !segundoNombre.isBlank()) sb.append(" ").append(segundoNombre);
        sb.append(" ").append(apellidoPaterno);
        if (apellidoMaterno != null && !apellidoMaterno.isBlank()) sb.append(" ").append(apellidoMaterno);
        return sb.toString();
    }

    // ── Compatibilidad legacy ────────────────────────────────────────────────

    /** @deprecated usar {@link #getPrimerNombre()} */
    @Deprecated
    public String getFirstName() { return primerNombre; }

    /** @deprecated usar {@link #getApellidoPaterno()} */
    @Deprecated
    public String getLastName() { return apellidoPaterno; }

    // ── Validaciones privadas ────────────────────────────────────────────────

    private String validateName(String name, String fieldName) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " no puede estar vacío.");
        }
        if (name.length() > 100) {
            throw new IllegalArgumentException(fieldName + " no puede exceder 100 caracteres.");
        }
        return name.trim();
    }

    private String validateCurp(String curp) {
        if (curp == null || curp.isBlank()) {
            throw new IllegalArgumentException("El CURP no puede estar vacío.");
        }
        String upper = curp.trim().toUpperCase();
        if (upper.length() != 18) {
            throw new IllegalArgumentException("El CURP debe tener exactamente 18 caracteres.");
        }
        if (!upper.matches("^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$")) {
            throw new IllegalArgumentException("El CURP tiene un formato inválido.");
        }
        return upper;
    }

    private String validateRfc(String rfc) {
        if (rfc == null || rfc.isBlank()) return null;
        String upper = rfc.trim().toUpperCase();
        if (upper.length() < 12 || upper.length() > 13) {
            throw new IllegalArgumentException("El RFC debe tener 12 o 13 caracteres.");
        }
        return upper;
    }

    /**
     * Extrae la fecha de nacimiento del CURP.
     * Posiciones 5-10 (base 1): AAMMDD
     * Valida rango 10–90 años.
     */
    private LocalDate extractBirthDateFromCurp(String curp) {
        try {
            int yy = Integer.parseInt(curp.substring(4, 6));
            int mm = Integer.parseInt(curp.substring(6, 8));
            int dd = Integer.parseInt(curp.substring(8, 10));

            int currentYY = LocalDate.now().getYear() % 100;
            int year = (yy > currentYY) ? 1900 + yy : 2000 + yy;

            LocalDate date = LocalDate.of(year, mm, dd);

            LocalDate minDate = LocalDate.now().minusYears(90);
            LocalDate maxDate = LocalDate.now().minusYears(10);

            if (date.isBefore(minDate) || date.isAfter(maxDate)) {
                throw new IllegalArgumentException(
                        "La fecha de nacimiento derivada del CURP está fuera del rango permitido (10 a 90 años). " +
                                "Fecha calculada: " + date);
            }
            return date;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("El CURP contiene una fecha de nacimiento inválida.");
        }
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public String getPrimerNombre()    { return primerNombre; }
    public String getSegundoNombre()   { return segundoNombre; }
    public String getApellidoPaterno() { return apellidoPaterno; }
    public String getApellidoMaterno() { return apellidoMaterno; }
    public String getCurp()            { return curp; }
    public String getRfc()             { return rfc; }
    public LocalDate getBirthDate()    { return birthDate; }
    public String getGender()          { return gender; }
    public String getPhone()           { return phone; }
    public String getPathImage()       { return imagePath; }
    public LocalDate getRegistrationDate() { return registrationDate; }
    public Address getAddress()        { return address; }
}