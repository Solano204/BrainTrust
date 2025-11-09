package com.braintrust.education.integration.repository;


import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseUnitEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.EnrollmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.CourseJpaRepository;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.JpaCourseRepositoryAdapter;
import com.braintrust.education.application.Maps.CourseEntityMapper;
import com.braintrust.education.integration.config.BaseIntegrationTest;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@ContextConfiguration(classes = BrainTrustApplication.class)
@Import({
        JpaCourseRepositoryAdapter.class,
        CourseEntityMapper.class,
        CourseUnitEntityMapper.class,
        EnrollmentEntityMapper.class // <--- ADD THE MISSING MAPPER HERE
})
@DisplayName("Course Repository Integration Tests")
class CourseRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private JpaCourseRepositoryAdapter courseRepository;

    @Autowired
    private CourseJpaRepository jpaRepository;

    private UserId testTeacherId;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        jpaRepository.deleteAll();
        testTeacherId = UserId.generate();
        testCourse = createTestCourse();
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve course by ID")
    void shouldSaveAndRetrieveCourseById() {
        // When
        Course saved = courseRepository.save(testCourse);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();

        // Verify retrieval
        Optional<Course> retrieved = courseRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getName()).isEqualTo("Integration Test Course");
        assertThat(retrieved.get().getCode().getValue()).isEqualTo("TEST-101");
    }

    @Test
    @DisplayName("Should save course with image URL")
    void shouldSaveCourseWithImageUrl() {
        // Given
        Course courseWithImage = Course.createWithImage(
                new CourseCode("IMG-101"),
                "Course with Image",
                "Description",
                "10th",
                "A",
                testTeacherId,
                "https://example.com/image.jpg"
        );

        // When
        Course saved = courseRepository.save(courseWithImage);

        // Then
        Optional<Course> retrieved = courseRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getUrlImage()).isEqualTo("https://example.com/image.jpg");
    }

    @Test
    @DisplayName("Should update existing course")
    void shouldUpdateExistingCourse() {
        // Given
        Course saved = courseRepository.save(testCourse);
        saved.updateDetails("Updated Name", "Updated Description", "11th", "B");

        // When
        Course updated = courseRepository.save(saved);

        // Then
        Optional<Course> retrieved = courseRepository.findById(updated.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getName()).isEqualTo("Updated Name");
        assertThat(retrieved.get().getGrade()).isEqualTo("11th");
        assertThat(retrieved.get().getGroup()).isEqualTo("B");
    }

    // ========================================
    // ✅ FIND BY CODE TESTS
    // ========================================

    @Test
    @DisplayName("Should find course by code")
    void shouldFindCourseByCode() {
        // Given
        courseRepository.save(testCourse);
        CourseCode code = new CourseCode("TEST-101");

        // When
        Optional<Course> result = courseRepository.findByCode(code);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo(code);
    }

    @Test
    @DisplayName("Should return empty when course code not found")
    void shouldReturnEmptyWhenCourseCodeNotFound() {
        // Given
        CourseCode nonExistentCode = new CourseCode("NOTFOUND-999");

        // When
        Optional<Course> result = courseRepository.findByCode(nonExistentCode);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should check if course code exists")
    void shouldCheckIfCourseCodeExists() {
        // Given
        courseRepository.save(testCourse);
        CourseCode code = new CourseCode("TEST-101");

        // When
        boolean exists = courseRepository.existsByCode(code);

        // Then
        assertThat(exists).isTrue();
    }

    // ========================================
    // ✅ FIND BY TEACHER TESTS
    // ========================================

    @Test
    @DisplayName("Should find courses by teacher ID")
    void shouldFindCoursesByTeacherId() {
        // Given
        Course course1 = testCourse;
        Course course2 = Course.create(
                new CourseCode("TEST-102"),
                "Second Course",
                "Description 2",
                "10th",
                "B",
                testTeacherId
        );

        courseRepository.save(course1);
        courseRepository.save(course2);

        // When
        List<Course> results = courseRepository.findByTeacherId(testTeacherId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Course::getTeacherId)
                .containsOnly(testTeacherId);
    }

    // ========================================
    // ✅ FIND ACTIVE COURSES TESTS
    // ========================================

    @Test
    @DisplayName("Should find only active courses")
    void shouldFindOnlyActiveCourses() {
        // Given
        Course activeCourse = testCourse;
        Course inactiveCourse = Course.create(
                new CourseCode("INACTIVE-101"),
                "Inactive Course",
                "Description",
                "10th",
                "C",
                testTeacherId
        );
        inactiveCourse.deactivate();

        courseRepository.save(activeCourse);
        courseRepository.save(inactiveCourse);

        // When
        List<Course> results = courseRepository.findActiveCourses();

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).isActive()).isTrue();
    }

    // ========================================
    // ✅ FIND BY GRADE AND GROUP TESTS
    // ========================================

    @Test
    @DisplayName("Should find courses by grade and group")
    void shouldFindCoursesByGradeAndGroup() {
        // Given
        Course course1 = testCourse; // 10th, A
        Course course2 = Course.create(
                new CourseCode("TEST-102"),
                "Course 2",
                "Description",
                "10th",
                "A",
                testTeacherId
        );
        Course course3 = Course.create(
                new CourseCode("TEST-103"),
                "Course 3",
                "Description",
                "11th",
                "B",
                testTeacherId
        );

        courseRepository.save(course1);
        courseRepository.save(course2);
        courseRepository.save(course3);

        // When
        List<Course> results = courseRepository.findByGradeAndGroup("10th", "A");

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(c -> c.getGrade().equals("10th") && c.getGroup().equals("A"));
    }

    // ========================================
    // ✅ ENROLLMENT CASCADE TESTS
    // ========================================

    @Test
    @DisplayName("Should save course with enrollments")
    void shouldSaveCourseWithEnrollments() {
        // Given
        UserId student1 = UserId.generate();
        UserId student2 = UserId.generate();

        testCourse.enrollStudent(student1);
        testCourse.enrollStudent(student2);

        // When
        Course saved = courseRepository.save(testCourse);

        // Then
        Optional<Course> retrieved = courseRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getEnrollments()).hasSize(2);
    }

    // ========================================
    // ✅ UNIT CASCADE TESTS
    // ========================================

    @Test
    @DisplayName("Should save course with units")
    void shouldSaveCourseWithUnits() {
        // Given
        testCourse.addUnit("Unit 1", 1, "Description 1");
        testCourse.addUnit("Unit 2", 2, "Description 2");

        // When
        Course saved = courseRepository.save(testCourse);

        // Then
        Optional<Course> retrieved = courseRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getUnits()).hasSize(2);
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete course")
    void shouldDeleteCourse() {
        // Given
        Course saved = courseRepository.save(testCourse);

        // When
        courseRepository.delete(saved);

        // Then
        Optional<Course> retrieved = courseRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    @Test
    @DisplayName("Should delete course with enrollments and units")
    void shouldDeleteCourseWithEnrollmentsAndUnits() {
        // Given
        testCourse.enrollStudent(UserId.generate());
        testCourse.addUnit("Unit 1", 1, "Description");
        Course saved = courseRepository.save(testCourse);

        // When
        courseRepository.delete(saved);

        // Then
        Optional<Course> retrieved = courseRepository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private Course createTestCourse() {
        return Course.create(
                new CourseCode("TEST-101"),
                "Integration Test Course",
                "Test Description",
                "10th",
                "A",
                testTeacherId
        );
    }
}