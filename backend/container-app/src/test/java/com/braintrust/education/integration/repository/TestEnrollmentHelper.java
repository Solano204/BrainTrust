package com.braintrust.education.integration.repository;

import com.braintrust.education.domain.model.Enrollment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Test helper to insert enrollments directly via JDBC
 * Bypasses the JPA entity's insertable=false restriction
 */
@Component
public class TestEnrollmentHelper {

    private final JdbcTemplate jdbcTemplate;

    public TestEnrollmentHelper(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Inserts an enrollment directly using JDBC to bypass JPA restrictions
     * Also creates a dummy course if it doesn't exist to satisfy foreign key constraint
     */
    public void insertEnrollment(Enrollment enrollment) {
        // First, ensure the course exists (create a dummy one)
        ensureCourseExists(enrollment.getCourseId().getValue());

        String sql = """
            INSERT INTO enrollments 
            (id, course_id, student_id, enrollment_date, status, final_grade_value, final_grade_max_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;

        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (enrollment.getFinalGrade() != null) {
            gradeValue = enrollment.getFinalGrade().getValue();
            gradeMaxScore = enrollment.getFinalGrade().getMaxScore();
        }

        jdbcTemplate.update(
                sql,
                enrollment.getId().getValue(),
                enrollment.getCourseId().getValue(),
                enrollment.getStudentId().getValue(),
                enrollment.getEnrollmentDate(),
                enrollment.getStatus().name(),
                gradeValue,
                gradeMaxScore
        );
    }

    /**
     * Updates an enrollment directly using JDBC
     */
    public void updateEnrollment(Enrollment enrollment) {
        String sql = """
            UPDATE enrollments 
            SET course_id = ?,
                student_id = ?,
                enrollment_date = ?,
                status = ?,
                final_grade_value = ?,
                final_grade_max_score = ?
            WHERE id = ?
            """;

        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (enrollment.getFinalGrade() != null) {
            gradeValue = enrollment.getFinalGrade().getValue();
            gradeMaxScore = enrollment.getFinalGrade().getMaxScore();
        }

        jdbcTemplate.update(
                sql,
                enrollment.getCourseId().getValue(),
                enrollment.getStudentId().getValue(),
                enrollment.getEnrollmentDate(),
                enrollment.getStatus().name(),
                gradeValue,
                gradeMaxScore,
                enrollment.getId().getValue()
        );
    }

    /**
     * Ensures a course exists in the database (creates a dummy course for testing)
     */
    private void ensureCourseExists(String courseId) {
        String checkSql = "SELECT COUNT(*) FROM courses WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, courseId);

        if (count == null || count == 0) {
            String insertSql = """
                INSERT INTO courses 
                (id, code, name, description, teacher_id, active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

            jdbcTemplate.update(
                    insertSql,
                    courseId,
                    "TEST-" + courseId.substring(7, 15), // Extract part of UUID for unique code
                    "Test Course " + courseId.substring(7, 15),
                    "Test course created for enrollment testing",
                    "TEACHER-TEST-" + courseId.substring(7, 15), // Dummy teacher ID
                    true,
                    LocalDateTime.now()
            );
        }
    }

    /**
     * Deletes all enrollments and test courses - useful for test cleanup
     */
    public void deleteAll() {
        jdbcTemplate.execute("DELETE FROM enrollments");
        jdbcTemplate.execute("DELETE FROM courses WHERE code LIKE 'TEST-%'");
    }
}