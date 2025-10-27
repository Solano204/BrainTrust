package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;


import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.EnrollmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EnrollmentEntityMapper {

    public EnrollmentJpaEntity toEntity(Enrollment enrollment) {
        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (enrollment.getFinalGrade() != null) {
            gradeValue = enrollment.getFinalGrade().getValue();
            gradeMaxScore = enrollment.getFinalGrade().getMaxScore();
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
        EnrollmentId id = EnrollmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        UserId studentId = UserId.fromString(entity.getStudentId());
        EnrollmentStatus status = EnrollmentStatus.valueOf(entity.getStatus());

        Grade finalGrade = null;
        if (entity.getFinalGradeValue() != null && entity.getFinalGradeMaxScore() != null) {
            finalGrade = new Grade(entity.getFinalGradeValue(), entity.getFinalGradeMaxScore());
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