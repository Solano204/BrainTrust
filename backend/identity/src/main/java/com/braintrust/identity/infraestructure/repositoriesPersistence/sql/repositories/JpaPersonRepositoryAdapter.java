package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;

// 📍 identity/infrastructure/persistence/JpaPersonRepositoryAdapter.java

import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.PersonEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JpaPersonRepositoryAdapter implements PersonRepository {

    private final PersonJpaRepository jpaRepository;
    private final PersonEntityMapper mapper;

    public JpaPersonRepositoryAdapter(
            PersonJpaRepository jpaRepository,
            PersonEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Person save(Person person) {
        PersonJpaEntity entity = mapper.toEntity(person);
        PersonJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Person person) {
        jpaRepository.deleteById(person.getId().getValue());
    }

    @Override
    public Optional<Person> findById(PersonId personId) {
        return jpaRepository.findById(personId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Person> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}