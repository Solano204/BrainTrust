package com.braintrust.identity.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

public class Address extends ValueObject {
    private final String street;
    private final String colony;
    private final String municipality;
    private final String state;
    private final String postalCode;

    public Address(String street, String colony, String municipality, String state, String postalCode) {
        this.street = validateStreet(street);
        this.colony = validateColony(colony);
        this.municipality = validateMunicipality(municipality);
        this.state = validateState(state);
        this.postalCode = validatePostalCode(postalCode);
    }

    private String validateStreet(String street) {
        if (street == null || street.trim().isEmpty()) {
            throw new IllegalArgumentException("Street cannot be null or empty");
        }
        return street.trim();
    }

    private String validatePostalCode(String postalCode) {
        if (postalCode == null || !postalCode.matches("\\d{5}")) {
            throw new IllegalArgumentException("Postal code must be 5 digits");
        }
        return postalCode;
    }

    private String validateColony(String colony) {
        return colony != null ? colony.trim() : null;
    }

    private String validateMunicipality(String municipality) {
        return municipality != null ? municipality.trim() : null;
    }

    private String validateState(String state) {
        return state != null ? state.trim() : null;
    }

    public String getStreet() { return street; }
    public String getColony() { return colony; }
    public String getMunicipality() { return municipality; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }

    public boolean isComplete() {
        return street != null && !street.isEmpty() &&
                postalCode != null && !postalCode.isEmpty();
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{street, colony, municipality, state, postalCode};
    }
}