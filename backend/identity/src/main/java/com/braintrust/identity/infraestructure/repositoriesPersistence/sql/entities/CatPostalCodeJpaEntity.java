
// CatPostalCodeJpaEntity.java
package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_postal_codes")
public class CatPostalCodeJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "colony_id", nullable = false)
    private Integer colonyId;

    @Column(name = "postal_code", length = 10, nullable = false)
    private String postalCode;

    public CatPostalCodeJpaEntity() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getColonyId() { return colonyId; }
    public void setColonyId(Integer colonyId) { this.colonyId = colonyId; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
}