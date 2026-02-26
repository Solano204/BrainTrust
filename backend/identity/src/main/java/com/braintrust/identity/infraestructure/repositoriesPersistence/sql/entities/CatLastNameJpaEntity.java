package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_last_names")
public class CatLastNameJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "last_name", length = 100, nullable = false, unique = true)
    private String lastName;

    public CatLastNameJpaEntity() {}
    public CatLastNameJpaEntity(String lastName) { this.lastName = lastName; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
}