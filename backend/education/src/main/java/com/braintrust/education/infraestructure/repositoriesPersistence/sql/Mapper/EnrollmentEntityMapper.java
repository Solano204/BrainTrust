package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.EnrollmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class EnrollmentEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(EnrollmentEntityMapper.class);

    public EnrollmentJpaEntity toEntity(Enrollment enrollment) {
        log.debug("Mapping Enrollment Domain ID {} to JPA Entity.", enrollment.getId().getValue());

        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (enrollment.getFinalGrade() != null) {
            gradeValue = enrollment.getFinalGrade().getValue();
            gradeMaxScore = enrollment.getFinalGrade().getMaxScore();
            log.trace("Mapping final grade: {}/{}", gradeValue, gradeMaxScore);
        }

        return new EnrollmentJpaEntity(
                enrollment.getId().getValue(),
                enrollment.getCourseId().getValue(),
                enrollment.getStudentId().getValue(),
                enrollment.getEnrollmentDate(),
                enrollment.getStatus().name(),
                gradeValue,
                gradeMaxScore
        );
    }


    public Enrollment toDomain(EnrollmentJpaEntity entity) {
        log.debug("Mapping Enrollment JPA Entity {} back to Domain Model.", entity.getId());

        EnrollmentId id = EnrollmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        UserId studentId = UserId.fromString(entity.getStudentId());
        EnrollmentStatus status = EnrollmentStatus.valueOf(entity.getStatus());

        Grade finalGrade = null;
        if (entity.getFinalGradeValue() != null && entity.getFinalGradeMaxScore() != null) {
            finalGrade = new Grade(entity.getFinalGradeValue(), entity.getFinalGradeMaxScore());
            log.trace("Reconstituting final grade: {}/{}", finalGrade.getValue(), finalGrade.getMaxScore());
        }

        return Enrollment.reconstitute(
                id,
                courseId,
                studentId,
                entity.getEnrollmentDate(),
                status,
                finalGrade
        );
    }
}