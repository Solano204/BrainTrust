package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;



import com.braintrust.identity.application.ports.out.PersonRepository;
import com.braintrust.identity.domain.model.Person;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.PersonEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.PersonJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

@Repository
public class JpaPersonRepositoryAdapter implements PersonRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaPersonRepositoryAdapter.class);

    private final PersonJpaRepository jpaRepository;
    private final PersonEntityMapper mapper;

    public JpaPersonRepositoryAdapter(
            PersonJpaRepository jpaRepository,
            PersonEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaPersonRepositoryAdapter.");
    }

    @Override
    public Page<Person> findAll(Pageable pageable) {
        Page<PersonJpaEntity> entityPage = jpaRepository.findAll(pageable);
        return entityPage.map(mapper::toDomain);
    }

    @Override
    public Person save(Person person) {
        log.info("Saving Person ID {} (Name: {}).", person.getId().getValue(), person.getFullName());

        PersonJpaEntity entity = mapper.toEntity(person);
        PersonJpaEntity savedEntity = jpaRepository.save(entity);

        log.debug("Person saved/updated successfully.");
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(Person person) {
        log.warn("Deleting Person ID: {}", person.getId().getValue());
        jpaRepository.deleteById(person.getId().getValue());
        log.info("Person ID {} deleted successfully.", person.getId().getValue());
    }

    @Override
    public Optional<Person> findById(PersonId personId) {
        log.debug("Querying database for Person ID: {}", personId.getValue());
        return jpaRepository.findById(personId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Person> findAll() {
        log.debug("Fetching all Person records from the database.");
        return jpaRepository.findAll()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}