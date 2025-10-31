package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.domain.valueobjects.Email;
import com.braintrust.identity.domain.valueobjects.PersonId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface UserJpaRepository extends JpaRepository<UserJpaEntity, String> {

    Optional<UserJpaEntity> findByEmail(String email);
    Optional<UserJpaEntity> findByPersonId(String personId);
    List<UserJpaEntity> findByRole(Role role);
    List<UserJpaEntity> findByActiveTrue();
    boolean existsByEmail(String email);
}


