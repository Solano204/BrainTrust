package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;

@Entity
@Table(name = "cat_second_names")
public class CatSecondNameJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "second_name", length = 100, nullable = false, unique = true)
    private String secondName;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public CatSecondNameJpaEntity() {}

    public Integer getId() { return id; }
    public String getSecondName() { return secondName; }
    public void setSecondName(String secondName) { this.secondName = secondName; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
