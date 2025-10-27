package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;


// 📍 identity/infrastructure/persistence/JpaUserRepositoryAdapter.java

import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper.UserEntityMapper;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.UserJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class JpaUserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;
    private final UserEntityMapper mapper;

    public JpaUserRepositoryAdapter(
            UserJpaRepository jpaRepository,
            UserEntityMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public User save(User user) {
        UserJpaEntity entity = mapper.toEntity(user);
        UserJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void delete(User user) {
        jpaRepository.deleteById(user.getId().getValue());
    }

    @Override
    public Optional<User> findById(UserId userId) {
        return jpaRepository.findById(userId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return jpaRepository.findByEmail(email.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<User> findByPersonId(PersonId personId) {
        return jpaRepository.findByPersonId(personId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<User> findByRole(Role role) {
        return jpaRepository.findByRole(role.name())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<User> findActiveUsers() {
        return jpaRepository.findByActiveTrue()
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByEmail(Email email) {
        return jpaRepository.existsByEmail(email.getValue());
    }
}