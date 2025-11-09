package com.braintrust.education.integration.repository;

import com.braintrust.containerapp.BrainTrustApplication;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.CourseUnitJpaRepository;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.CourseUnitRepositoryAdapter;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseUnitEntityMapper;
import com.braintrust.education.integration.config.BaseIntegrationTest;
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
@Import({CourseUnitRepositoryAdapter.class, CourseUnitEntityMapper.class})
@DisplayName("CourseUnit Repository Integration Tests")
class UnitRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private CourseUnitRepositoryAdapter unitRepository;

    @Autowired
    private CourseUnitJpaRepository jpaRepository;

    private CourseId testCourseId;
    private CourseUnit testUnit;

    @BeforeEach
    void setUp() {
        // Clean database before each test
        jpaRepository.deleteAll();

        // Generate a valid CourseId with a non-null value
        testCourseId = CourseId.generate();

        // Verify CourseId is valid
        assertThat(testCourseId).isNotNull();
        assertThat(testCourseId.getValue())
                .isNotNull()
                .isNotBlank();

        // Create test unit
        testUnit = createTestUnit();

        // Verify test unit is properly configured
        assertThat(testUnit.getCourseId()).isEqualTo(testCourseId);
        assertThat(testUnit.getCourseId().getValue())
                .isNotNull()
                .isNotBlank();
    }

    // ========================================
    // 🔍 DEBUG TEST - Remove after fixing
    // ========================================

    @Test
    @DisplayName("DEBUG: Verify CourseId is not null before save")
    void debugCourseIdBeforeSave() {
        // Verify domain object
        System.out.println("=== DOMAIN OBJECT ===");
        System.out.println("CourseUnit.id: " + testUnit.getId().getValue());
        System.out.println("CourseUnit.courseId: " + testUnit.getCourseId());
        System.out.println("CourseUnit.courseId.getValue(): " + testUnit.getCourseId().getValue());

        // Verify mapper output
        CourseUnitEntityMapper mapper = new CourseUnitEntityMapper();
        var entity = mapper.toEntity(testUnit);

        System.out.println("=== JPA ENTITY ===");
        System.out.println("Entity.id: " + entity.getId());
        System.out.println("Entity.courseId: " + entity.getCourseId());

        // This should NOT be null
        assertThat(entity.getCourseId())
                .as("JPA Entity courseId MUST NOT be null")
                .isNotNull()
                .isNotBlank();
    }

    // ========================================
    // ✅ SAVE AND FIND TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve unit by ID")
    void shouldSaveAndRetrieveUnitById() {
        // When
        CourseUnit saved = unitRepository.save(testUnit);

        // Then - Verify saved entity
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCourseId()).isNotNull();
        assertThat(saved.getCourseId().getValue())
                .isNotNull()
                .isNotBlank();

        // Verify retrieval
        Optional<CourseUnit> retrieved = unitRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();

        CourseUnit retrievedUnit = retrieved.get();
        assertThat(retrievedUnit.getName()).isEqualTo("Unit 1: Introduction");
        assertThat(retrievedUnit.getNumUnity()).isEqualTo(1);
        assertThat(retrievedUnit.getCourseId()).isEqualTo(testCourseId);
        assertThat(retrievedUnit.getCourseId().getValue())
                .isNotNull()
                .isEqualTo(testCourseId.getValue());
    }

    @Test
    @DisplayName("Should save unit with image URL")
    void shouldSaveUnitWithImageUrl() {
        // Given
        CourseUnit unitWithImage = CourseUnit.createWithImage(
                testCourseId,
                "Unit with Image",
                1,
                "Description",
                "https://example.com/unit.jpg"
        );

        // Verify courseId before saving
        assertThat(unitWithImage.getCourseId()).isNotNull();
        assertThat(unitWithImage.getCourseId().getValue())
                .isNotNull()
                .isNotBlank()
                .isEqualTo(testCourseId.getValue());

        // When
        CourseUnit saved = unitRepository.save(unitWithImage);

        // Then - Verify saved entity has courseId
        assertThat(saved.getCourseId()).isNotNull();
        assertThat(saved.getCourseId().getValue())
                .isNotNull()
                .isEqualTo(testCourseId.getValue());

        // Verify retrieval
        Optional<CourseUnit> retrieved = unitRepository.findById(saved.getId());
        assertThat(retrieved).isPresent();

        CourseUnit retrievedUnit = retrieved.get();
        assertThat(retrievedUnit.getUrlImage()).isEqualTo("https://example.com/unit.jpg");
        assertThat(retrievedUnit.getCourseId()).isEqualTo(testCourseId);
        assertThat(retrievedUnit.getCourseId().getValue()).isEqualTo(testCourseId.getValue());
    }

    @Test
    @DisplayName("Should update existing unit")
    void shouldUpdateExistingUnit() {
        // Given - Save initial unit
        CourseUnit saved = unitRepository.save(testUnit);

        // Verify saved entity has valid courseId
        assertThat(saved.getCourseId()).isNotNull();
        assertThat(saved.getCourseId().getValue())
                .isNotNull()
                .isEqualTo(testCourseId.getValue());

        // Update details
        saved.updateDetails("Updated Name", "Updated Description");

        // When - Save updated unit
        CourseUnit updated = unitRepository.save(saved);

        // Then - Verify update
        assertThat(updated.getCourseId()).isNotNull();
        assertThat(updated.getCourseId().getValue()).isEqualTo(testCourseId.getValue());

        Optional<CourseUnit> retrieved = unitRepository.findById(updated.getId());
        assertThat(retrieved).isPresent();

        CourseUnit retrievedUnit = retrieved.get();
        assertThat(retrievedUnit.getName()).isEqualTo("Updated Name");
        assertThat(retrievedUnit.getDescription()).isEqualTo("Updated Description");
        assertThat(retrievedUnit.getCourseId()).isEqualTo(testCourseId);
        assertThat(retrievedUnit.getCourseId().getValue()).isEqualTo(testCourseId.getValue());
    }



    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete unit")
    void shouldDeleteUnit() {
        // Given - Save a unit
        CourseUnit saved = unitRepository.save(testUnit);

        // Verify it was saved with valid courseId
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCourseId()).isNotNull();
        assertThat(saved.getCourseId().getValue())
                .isNotNull()
                .isEqualTo(testCourseId.getValue());

        UnitId savedId = saved.getId();

        // When - Delete the unit
        unitRepository.delete(saved);

        // Then - Verify it was deleted
        Optional<CourseUnit> retrieved = unitRepository.findById(savedId);
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private CourseUnit createTestUnit() {
        CourseUnit unit = CourseUnit.create(
                testCourseId,
                "Unit 1: Introduction",
                1,
                "Introduction to the course"
        );

        // Verify the created unit has proper courseId
        assertThat(unit.getCourseId())
                .isNotNull()
                .isEqualTo(testCourseId);
        assertThat(unit.getCourseId().getValue())
                .isNotNull()
                .isNotBlank()
                .isEqualTo(testCourseId.getValue());

        return unit;
    }
}