package com.braintrust.identity.domain.model;

import com.braintrust.identity.domain.valueobjects.Address;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.shared.domain.Entity;

import java.time.LocalDate;

// 📍 identity/domain/model/Person.java
public class Person extends Entity<PersonId> {
    private String firstName;
    private String lastName;
    private String gender;
    private String phone;
    private LocalDate registrationDate;
    private String imagePath;
    private Address address;

    // Constructor privado para factory methods
    private Person(PersonId id, String firstName, String lastName) {
        this.id = id;
        this.firstName = validateName(firstName, "First name");
        this.lastName = validateName(lastName, "Last name");
        this.registrationDate = LocalDate.now();
    }

    // Factory Method - SRP: creación centralizada (to NEW ENTITY)
    public static Person create(String firstName, String lastName) {
        PersonId id = PersonId.generate();
        return new Person(id, firstName, lastName);
    }


    //  to rebuild One EXISTIN ENTITIY
    public static Person reconstitute(PersonId id, String firstName, String lastName,
                                      String gender, String phone, LocalDate registrationDate,
                                      String imagePath, Address address) {
        Person person = new Person(id, firstName, lastName);
        person.gender = gender;
        person.phone = phone;
        person.registrationDate = registrationDate;
        person.imagePath = imagePath;
        person.address = address;
        return person;
    }

    private String validateName(String name, String fieldName) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be null or empty");
        }
        if (name.length() > 255) {
            throw new IllegalArgumentException(fieldName + " cannot exceed 255 characters");
        }
        return name.trim();
    }

    // Comportamiento de dominio - sin events
    public void updatePersonalInfo(String firstName, String lastName, String gender, String phone) {
        this.firstName = validateName(firstName, "First name");
        this.lastName = validateName(lastName, "Last name");
        this.gender = gender;
        this.phone = phone;
    }

    public void updateAddress(Address newAddress) {
        this.address = newAddress;
    }

    public void updateImage(String image) {
        this.imagePath = image;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    // Getters con contrato definido
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getGender() { return gender; }
    public String getPhone() { return phone; }
    public String getPathImage() { return imagePath; }
    public LocalDate getRegistrationDate() { return registrationDate; }
    public Address getAddress() { return address; }
}
