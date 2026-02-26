package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_roles")
public class CatRoleJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", length = 30, nullable = false, unique = true)
    private String code;

    @Column(name = "description", length = 100, nullable = false)
    private String description;

    public CatRoleJpaEntity() {}

    public CatRoleJpaEntity(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}