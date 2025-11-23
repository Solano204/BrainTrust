package com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.education.application.ports.out.UnitGradeRepository;
import com.braintrust.education.domain.model.UnitGrade;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitGradeId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.UnitGradeEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.UnitGradeJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
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
public class JpaUnitGradeRepositoryAdapter implements UnitGradeRepository {

    private static final Logger log =
            LoggerFactory.getLogger(JpaUnitGradeRepositoryAdapter.class);
    private final UnitGradeJpaRepository jpaRepository;
    private final UnitGradeEntityMapper mapper;

    public JpaUnitGradeRepositoryAdapter(
            UnitGradeJpaRepository jpaRepository,
            UnitGradeEntityMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
        log.info("Initialized JpaUnitGradeRepositoryAdapter");
    }

    @Override
    @Transactional
    public UnitGrade save(UnitGrade unitGrade) {
        log.debug("Saving UnitGrade ID: {}", unitGrade.getId().getValue());
        UnitGradeJpaEntity entity = mapper.toEntity(unitGrade);
        UnitGradeJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void delete(UnitGrade unitGrade) {
        log.warn("Deleting UnitGrade ID: {}", unitGrade.getId().getValue());
        jpaRepository.deleteById(unitGrade.getId().getValue());
    }

    @Override
    public Optional<UnitGrade> findById(UnitGradeId unitGradeId) {
        log.debug("Finding UnitGrade by ID: {}", unitGradeId.getValue());
        return jpaRepository.findById(unitGradeId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public Optional<UnitGrade> findByUnitAndStudent(UnitId unitId, UserId studentId) {
        log.debug("Finding UnitGrade by Unit ID: {} and Student ID: {}",
                unitId.getValue(), studentId.getValue());
        return jpaRepository.findByUnitIdAndStudentId(unitId.getValue(), studentId.getValue())
                .map(mapper::toDomain);
    }

    @Override
    public List<UnitGrade> findByUnitId(UnitId unitId) {
        log.debug("Finding unit grades by Unit ID: {}", unitId.getValue());
        return jpaRepository.findByUnitId(unitId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<UnitGrade> findByStudentId(UserId studentId) {
        log.debug("Finding unit grades by Student ID: {}", studentId.getValue());
        return jpaRepository.findByStudentId(studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }


    @Override
    public List<UnitGrade> findByCourseAndStudent(CourseId courseId, UserId studentId) {
        log.debug("Finding unit grades by Course ID: {} and Student ID: {}",
                courseId.getValue(), studentId.getValue());

        // This requires a JOIN with units to get the course_id
        return jpaRepository.findByCourseIdAndStudentId(courseId.getValue(), studentId.getValue())
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

}