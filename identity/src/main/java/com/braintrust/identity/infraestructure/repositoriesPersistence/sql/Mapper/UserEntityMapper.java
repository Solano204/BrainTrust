package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;

// 📍 identity/infrastructure/persistence/mappers/UserEntityMapper.java

import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class UserEntityMapper {

    public UserJpaEntity toEntity(User user) {
        return new UserJpaEntity(
                user.getId().getValue(),
                user.getPersonId().getValue(),
                user.getEmail().getValue(),
                user.getPassword().getHash(),
                user.getRole().name(),
                user.isActive(),
                user.getStudentId(),
                user.getCreatedAt()
        );
    }

    public User toDomain(UserJpaEntity entity) {
        PersonId personId = PersonId.fromString(entity.getPersonId());
        Email email = new Email(entity.getEmail());
        Password password = Password.fromHash(entity.getPasswordHash());
        Role role = Role.valueOf(entity.getRole());

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