package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_maternal_lastnames")
public class CatMaternalLastnameJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "maternal_lastname", length = 100, nullable = false, unique = true)
    private String maternalLastname;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public CatMaternalLastnameJpaEntity() {}

    public Integer getId() { return id; }
    public String getMaternalLastname() { return maternalLastname; }
    public void setMaternalLastname(String maternalLastname) { this.maternalLastname = maternalLastname; }
    public boolean isActive() { return active; }
}
