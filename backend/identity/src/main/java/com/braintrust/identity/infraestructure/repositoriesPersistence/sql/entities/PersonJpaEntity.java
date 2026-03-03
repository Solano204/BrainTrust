package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Entidad JPA para la tabla persons.
 *
 * Cambios aplicados:
 * - first_name_id → primer_nombre_id  (primer nombre)
 * - Nuevo: segundo_nombre_id          (segundo nombre)
 * - last_name_id  → apellido_paterno_id
 * - Nuevo: apellido_materno_id
 * - Nuevos campos: curp (único), rfc (único), birth_date, age (generado en DB)
 */
@Entity
@Table(name = "persons", indexes = {
        @Index(name = "idx_persons_curp",          columnList = "curp"),
        @Index(name = "idx_persons_rfc",           columnList = "rfc"),
        @Index(name = "idx_persons_primer_nombre", columnList = "primer_nombre_id"),
        @Index(name = "idx_persons_apellido_pat",  columnList = "apellido_paterno_id")
})
public class PersonJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    // ── Nombre ─────────────────────────────────────────────────────────────────

    /** ID en cat_first_names (primer nombre de pila) */
    @Column(name = "primer_nombre_id")
    private Integer primerNombreId;

    /** ID en cat_second_names (segundo nombre de pila, opcional) */
    @Column(name = "segundo_nombre_id")
    private Integer segundoNombreId;

    /** ID en cat_paternal_lastnames (apellido paterno) */
    @Column(name = "apellido_paterno_id")
    private Integer apellidoPaternoId;

    /** ID en cat_maternal_lastnames (apellido materno, opcional) */
    @Column(name = "apellido_materno_id")
    private Integer apellidoMaternoId;

    // ── Identificaciones oficiales ──────────────────────────────────────────────

    /** CURP — 18 caracteres, único, no modificable una vez registrado */
    @Column(name = "curp", length = 18, unique = true)
    private String curp;

    /** RFC — hasta 13 caracteres, único */
    @Column(name = "rfc", length = 13, unique = true)
    private String rfc;

    /** Fecha de nacimiento — derivada automáticamente del CURP por trigger en DB */
    @Column(name = "birth_date")
    private LocalDate birthDate;

    /**
     * Edad — columna GENERATED ALWAYS en PostgreSQL (calculada por la BD).
     * Se mapea como insertable=false, updatable=false.
     */
    @Column(name = "age", insertable = false, updatable = false)
    private Integer age;

    // ── Datos generales ─────────────────────────────────────────────────────────

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    // ── Dirección (IDs a catálogos) ─────────────────────────────────────────────

    @Column(name = "street_id")
    private Integer streetId;

    @Column(name = "colony_id")
    private Integer colonyId;

    @Column(name = "municipality_id")
    private Integer municipalityId;

    @Column(name = "state_id")
    private Integer stateId;

    @Column(name = "postal_code_id")
    private Integer postalCodeId;

    // ── Campos transientes (resueltos vía join/catalogs) ───────────────────────

    @Transient private String primerNombre;
    @Transient private String segundoNombre;
    @Transient private String apellidoPaterno;
    @Transient private String apellidoMaterno;

    @Transient private String addressStreet;
    @Transient private String addressColony;
    @Transient private String addressMunicipality;
    @Transient private String addressState;
    @Transient private String addressPostalCode;

    // ── Compatibilidad con código legacy ────────────────────────────────────────
    // Estos getters permiten que código antiguo siga compilando

    /** @deprecated usar {@link #getPrimerNombreId()} */
    @Deprecated
    public Integer getFirstNameId() { return primerNombreId; }
    /** @deprecated usar {@link #setPrimerNombreId(Integer)} */
    @Deprecated
    public void setFirstNameId(Integer id) { this.primerNombreId = id; }

    /** @deprecated usar {@link #getApellidoPaternoId()} */
    @Deprecated
    public Integer getLastNameId() { return apellidoPaternoId; }
    /** @deprecated usar {@link #setApellidoPaternoId(Integer)} */
    @Deprecated
    public void setLastNameId(Integer id) { this.apellidoPaternoId = id; }

    /** @deprecated usar {@link #getPrimerNombre()} */
    @Deprecated
    public String getFirstName() { return primerNombre; }
    /** @deprecated usar {@link #setPrimerNombre(String)} */
    @Deprecated
    public void setFirstName(String name) { this.primerNombre = name; }

    /** @deprecated usar {@link #getApellidoPaterno()} */
    @Deprecated
    public String getLastName() { return apellidoPaterno; }
    /** @deprecated usar {@link #setApellidoPaterno(String)} */
    @Deprecated
    public void setLastName(String name) { this.apellidoPaterno = name; }

    // ── Constructores ────────────────────────────────────────────────────────────

    public PersonJpaEntity() {}

    // ── Getters y Setters ────────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getPrimerNombreId() { return primerNombreId; }
    public void setPrimerNombreId(Integer primerNombreId) { this.primerNombreId = primerNombreId; }

    public Integer getSegundoNombreId() { return segundoNombreId; }
    public void setSegundoNombreId(Integer segundoNombreId) { this.segundoNombreId = segundoNombreId; }

    public Integer getApellidoPaternoId() { return apellidoPaternoId; }
    public void setApellidoPaternoId(Integer apellidoPaternoId) { this.apellidoPaternoId = apellidoPaternoId; }

    public Integer getApellidoMaternoId() { return apellidoMaternoId; }
    public void setApellidoMaternoId(Integer apellidoMaternoId) { this.apellidoMaternoId = apellidoMaternoId; }

    public String getCurp() { return curp; }
    public void setCurp(String curp) { this.curp = curp; }

    public String getRfc() { return rfc; }
    public void setRfc(String rfc) { this.rfc = rfc; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public Integer getAge() { return age; }
    // age no tiene setter → es GENERATED ALWAYS en la DB

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public Integer getStreetId() { return streetId; }
    public void setStreetId(Integer streetId) { this.streetId = streetId; }

    public Integer getColonyId() { return colonyId; }
    public void setColonyId(Integer colonyId) { this.colonyId = colonyId; }

    public Integer getMunicipalityId() { return municipalityId; }
    public void setMunicipalityId(Integer municipalityId) { this.municipalityId = municipalityId; }

    public Integer getStateId() { return stateId; }
    public void setStateId(Integer stateId) { this.stateId = stateId; }

    public Integer getPostalCodeId() { return postalCodeId; }
    public void setPostalCodeId(Integer postalCodeId) { this.postalCodeId = postalCodeId; }

    // Transientes
    public String getPrimerNombre() { return primerNombre; }
    public void setPrimerNombre(String primerNombre) { this.primerNombre = primerNombre; }

    public String getSegundoNombre() { return segundoNombre; }
    public void setSegundoNombre(String segundoNombre) { this.segundoNombre = segundoNombre; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }

    public String getAddressStreet() { return addressStreet; }
    public void setAddressStreet(String addressStreet) { this.addressStreet = addressStreet; }

    public String getAddressColony() { return addressColony; }
    public void setAddressColony(String addressColony) { this.addressColony = addressColony; }

    public String getAddressMunicipality() { return addressMunicipality; }
    public void setAddressMunicipality(String addressMunicipality) { this.addressMunicipality = addressMunicipality; }

    public String getAddressState() { return addressState; }
    public void setAddressState(String addressState) { this.addressState = addressState; }

    public String getAddressPostalCode() { return addressPostalCode; }
    public void setAddressPostalCode(String addressPostalCode) { this.addressPostalCode = addressPostalCode; }
}