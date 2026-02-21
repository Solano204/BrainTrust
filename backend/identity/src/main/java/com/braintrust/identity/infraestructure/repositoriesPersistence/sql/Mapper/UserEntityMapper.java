package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;



import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class UserEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(UserEntityMapper.class);

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

    public User toDomain(UserJpaEntity entity) {
        log.debug("Mapping User JPA Entity {} back to Domain Model. Role: {}",
                entity.getId(), entity.getRole());

        PersonId personId = PersonId.fromString(entity.getPersonId());
        Email email = new Email(entity.getEmail());
        Password password = Password.fromHash(entity.getPasswordHash());
        Role role = Role.valueOf(entity.getRole().name());

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