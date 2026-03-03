package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;

@Entity
@Table(name = "cat_paternal_lastnames")
public class CatPaternalLastnameJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "paternal_lastname", length = 100, nullable = false, unique = true)
    private String paternalLastname;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    public CatPaternalLastnameJpaEntity() {}

    public Integer getId() { return id; }
    public String getPaternalLastname() { return paternalLastname; }
    public void setPaternalLastname(String paternalLastname) { this.paternalLastname = paternalLastname; }
    public boolean isActive() { return active; }
}
