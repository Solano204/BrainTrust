package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_colonies")
public class CatColonyJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "municipality_id", nullable = false)
    private Integer municipalityId;

    @Column(name = "colony_name", length = 100, nullable = false)
    private String colonyName;

    public CatColonyJpaEntity() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getMunicipalityId() { return municipalityId; }
    public void setMunicipalityId(Integer municipalityId) { this.municipalityId = municipalityId; }
    public String getColonyName() { return colonyName; }
    public void setColonyName(String colonyName) { this.colonyName = colonyName; }
}