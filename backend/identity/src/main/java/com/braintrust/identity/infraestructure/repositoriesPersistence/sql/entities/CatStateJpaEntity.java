
// CatStateJpaEntity.java
package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "cat_states")
public class CatStateJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "state_name", length = 100, nullable = false, unique = true)
    private String stateName;

    public CatStateJpaEntity() {}
    public CatStateJpaEntity(String stateName) { this.stateName = stateName; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getStateName() { return stateName; }
    public void setStateName(String stateName) { this.stateName = stateName; }
}