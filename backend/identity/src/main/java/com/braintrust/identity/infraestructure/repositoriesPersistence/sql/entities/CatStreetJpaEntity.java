
// CatStreetJpaEntity.java
package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_streets")
public class CatStreetJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "colony_id", nullable = false)
    private Integer colonyId;

    @Column(name = "street_name", length = 255, nullable = false)
    private String streetName;

    public CatStreetJpaEntity() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getColonyId() { return colonyId; }
    public void setColonyId(Integer colonyId) { this.colonyId = colonyId; }
    public String getStreetName() { return streetName; }
    public void setStreetName(String streetName) { this.streetName = streetName; }
}