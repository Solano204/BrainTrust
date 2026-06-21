package com.braintrust.identity.infraestructure.repositoriesPersistence.sql.Mapper;



import com.braintrust.identity.domain.model.*;
import com.braintrust.identity.domain.valueobjects.*;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.CatRoleJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.UserJpaEntity;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.repositories.CatRoleJpaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class UserEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(UserEntityMapper.class);

    private final CatRoleJpaRepository catRoleJpaRepository;

    public UserEntityMapper(CatRoleJpaRepository catRoleJpaRepository) {
        this.catRoleJpaRepository = catRoleJpaRepository;
    }

    public UserJpaEntity toEntity(User user) {
        CatRoleJpaEntity roleEntity = catRoleJpaRepository
                .findByCodeIgnoreCase(user.getRole().name())
                .orElseThrow(() -> new IllegalStateException(
                        "Role not found: " + user.getRole().name()));

        UserJpaEntity entity = new UserJpaEntity(
                user.getId().getValue(),
                user.getPersonId().getValue(),
                user.getEmail().getValue(),
                user.getPassword().getHash(),
                user.getRole().name(),
                user.isActive(),
                user.getStudentId(),
                user.getCreatedAt()
        );
        entity.setRoleEntity(roleEntity);
        return entity;
    }

    public User toDomain(UserJpaEntity entity) {
        return User.reconstitute(
                UserId.fromString(entity.getId()),
                PersonId.fromString(entity.getPersonId()),
                new Email(entity.getEmail()),
                Password.fromHash(entity.getPasswordHash()),
                Role.valueOf(entity.getRole().name()),
                entity.isActive(),
                entity.getCreatedAt(),
                entity.getStudentId()
        );
    }
}