package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;

// 📍 identity/infrastructure/persistence/mappers/UserEntityMapper.java

import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

@Component
@Slf4j // ⬅️ Enable the 'log' variable
public class UserEntityMapper {

    /**
     * Converts a User Domain Model to a JPA Entity.
     * Logs PII (Email) at debug level for auditing.
     */
    public UserJpaEntity toEntity(User user) {
        log.debug("Mapping User Domain ID {} to JPA Entity. Email: {}",
                user.getId().getValue(), user.getEmail().getValue());

        return new UserJpaEntity(
                user.getId().getValue(),
                user.getPersonId().getValue(),
                user.getEmail().getValue(),
                user.getPassword().getHash(), // Storing hash
                user.getRole().name(),
                user.isActive(),
                user.getStudentId(),
                user.getCreatedAt()
        );
    }

    /**
     * Converts a User JPA Entity back to a Domain User model.
     * Logs reconstitution for state tracking.
     */
    public User toDomain(UserJpaEntity entity) {
        log.debug("Mapping User JPA Entity {} back to Domain Model. Role: {}",
                entity.getId(), entity.getRole());

        PersonId personId = PersonId.fromString(entity.getPersonId());
        Email email = new Email(entity.getEmail());
        Password password = Password.fromHash(entity.getPasswordHash());
        Role role = Role.valueOf(entity.getRole().name());

        // Use reconstitute pattern for existing entities
        return User.reconstitute(
                UserId.fromString(entity.getId()),
                personId,
                email,
                password,
                role,
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getStudentId()
        );
    }
}