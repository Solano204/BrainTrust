package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "persons")
public class PersonJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "first_name", length = 255, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 255, nullable = false)
    private String lastName;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "image_path", length = 500)
    private String imagePath;

    @Column(name = "address_street", length = 255)
    private String addressStreet;

    @Column(name = "address_colony", length = 100)
    private String addressColony;

    @Column(name = "address_municipality", length = 100)
    private String addressMunicipality;

    @Column(name = "address_state", length = 100)
    private String addressState;

    @Column(name = "address_postal_code", length = 10)
    private String addressPostalCode;

    public PersonJpaEntity() {}

    public PersonJpaEntity(String id, String firstName, String lastName, String gender,
                           String phone, LocalDate registrationDate, String imagePath,
                           String addressStreet, String addressColony, String addressMunicipality,
                           String addressState, String addressPostalCode) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.phone = phone;
        this.registrationDate = registrationDate;
        this.imagePath = imagePath;
        this.addressStreet = addressStreet;
        this.addressColony = addressColony;
        this.addressMunicipality = addressMunicipality;
        this.addressState = addressState;
        this.addressPostalCode = addressPostalCode;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

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