package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "persons")
public class PersonJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "first_name_id", nullable = false)
    private Integer firstNameId;

    @Column(name = "last_name_id", nullable = false)
    private Integer lastNameId;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "image_path", length = 500)
    private String imagePath;

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

    // Transient fields for display (populated via joins/queries)
    @Transient
    private String firstName;

    @Transient
    private String lastName;

    @Transient
    private String addressStreet;

    @Transient
    private String addressColony;

    @Transient
    private String addressMunicipality;

    @Transient
    private String addressState;

    @Transient
    private String addressPostalCode;

    public PersonJpaEntity() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Integer getFirstNameId() { return firstNameId; }
    public void setFirstNameId(Integer firstNameId) { this.firstNameId = firstNameId; }

    public Integer getLastNameId() { return lastNameId; }
    public void setLastNameId(Integer lastNameId) { this.lastNameId = lastNameId; }

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

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

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
