package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.PageRepository;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.PageId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.PageEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.PageJpaEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Repository
@Transactional(readOnly = true)
public class JpaPageRepositoryAdapter implements PageRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaPageRepositoryAdapter.class);
    private final PageJpaRepository jpaRepository;
    private final PageEntityMapper mapper;

    public JpaPageRepositoryAdapter(
            PageJpaRepository jpaRepository,
            PageEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaPageRepositoryAdapter");
    }

    @Override
    @Transactional
    public Page save(Page page) {
        log.debug("Saving Page ID: {}", page.getId().getValue());
        PageJpaEntity entity = mapper.toEntity(page);
        PageJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void delete(Page page) {
        log.warn("Deleting Page ID: {}", page.getId().getValue());
        jpaRepository.deleteById(page.getId().getValue());
    }

    @Override
    public Optional<Page> findById(PageId pageId) {
        log.debug("Finding Page by ID: {}", pageId.getValue());
        return jpaRepository.findById(pageId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<Page> findByCourseId(CourseId courseId) {
        log.debug("Finding pages by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseId(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Page> findByUnitId(UnitId unitId) {
        log.debug("Finding pages by Unit ID: {}", unitId.getValue());
        return jpaRepository.findByUnitId(unitId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Page> findPublishedByCourseId(CourseId courseId) {
        log.debug("Finding published pages by Course ID: {}", courseId.getValue());
        return jpaRepository.findByCourseIdAndPublishedTrue(courseId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}