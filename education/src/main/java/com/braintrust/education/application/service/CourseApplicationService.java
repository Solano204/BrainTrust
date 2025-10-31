package com.braintrust.education.application.service;

// 📍 education/infrastructure/persistence/JpaCourseRepositoryAdapter.java

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.exceptions.CourseCodeAlreadyExistsException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseMapper;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j // ⬅️ Enable the 'log' variable
public class CourseApplicationService implements CourseService {

    private final CourseRepository courseRepository;

    public CourseApplicationService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // ------------------------------------------------------------------
    // ✅ COURSE COMMANDS
    // ------------------------------------------------------------------

    @Override
    public CourseId createCourse(CreateCourseCommand command) {
        CourseCode code = new CourseCode(command.code());

        if (courseRepository.existsByCode(code)) {
            log.warn("Attempted to create course with duplicate code: {}", command.code());
            throw new CourseCodeAlreadyExistsException("Course code already exists: " + command.code());
        }

        UserId teacherId = UserId.fromString(command.teacherId());
        log.info("Creating new course '{}' for Teacher ID: {}", command.name(), teacherId.getValue());

        Course course = Course.create(
                code,
                command.name(),
                command.description(),
                command.grade(),
                command.group(),
                teacherId
        );

        Course savedCourse = courseRepository.save(course);
        log.info("Course created and saved. ID: {}", savedCourse.getId().getValue());
        return savedCourse.getId();
    }

    @Override
    public CourseId createCourseWithImage(CreateCourseWithImageCommand command) {
        CourseCode code = new CourseCode(command.code());

        if (courseRepository.existsByCode(code)) {
            log.warn("Attempted to create course with image and duplicate code: {}", command.code());
            throw new CourseCodeAlreadyExistsException("Course code already exists");
        }

        UserId teacherId = UserId.fromString(command.teacherId());
        log.info("Creating course '{}' with image for Teacher ID: {}", command.name(), teacherId.getValue());

        Course course = Course.createWithImage(
                code,
                command.name(),
                command.description(),
                command.grade(),
                command.group(),
                teacherId,
                command.imageUrl()
        );

        Course savedCourse = courseRepository.save(course);
        log.info("Course with image created and saved. ID: {}", savedCourse.getId().getValue());
        return savedCourse.getId();
    }

    @Override
    public void updateCourseDetails(UpdateCourseCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Updating details for Course ID: {}", courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        course.updateDetails(
                command.name(),
                command.description(),
                command.grade(),
                command.group()
        );

        courseRepository.save(course);
        log.debug("Course ID {} details updated and saved.", courseId.getValue());
    }

    @Override
    public void updateCourseImage(CourseId courseId, String imageUrl) {
        log.info("Updating image URL for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);
        course.setUrlImage(imageUrl);
        courseRepository.save(course);
        log.debug("Course ID {} image URL updated.", courseId.getValue());
    }

    @Override
    public void activateCourse(CourseId courseId) {
        log.info("Activating Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);
        course.activate();
        courseRepository.save(course);
        log.info("Course ID {} status set to active.", courseId.getValue());
    }

    @Override
    public void deactivateCourse(CourseId courseId) {
        log.warn("Deactivating Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);
        course.deactivate();
        courseRepository.save(course);
        log.warn("Course ID {} status set to inactive.", courseId.getValue());
    }

    // ------------------------------------------------------------------
    // ✅ ENROLLMENT COMMANDS
    // ------------------------------------------------------------------

    @Override
    public EnrollmentId enrollStudent(EnrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Enrolling Student ID {} into Course ID {}", studentId.getValue(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);
        Enrollment enrollment = course.enrollStudent(studentId);

        // ✅ ONLY save the aggregate root - JPA cascades to enrollments
        courseRepository.save(course);
        log.info("Student ID {} successfully enrolled. Enrollment ID: {}", studentId.getValue(), enrollment.getId().getValue());

        return enrollment.getId();
    }

    @Override
    public void unenrollStudent(UnenrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.warn("Unenrolling Student ID {} from Course ID {}", studentId.getValue(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);
        course.unenrollStudent(studentId);

        courseRepository.save(course);
        log.info("Student ID {} successfully unenrolled.", studentId.getValue());
    }

    // ------------------------------------------------------------------
    // ✅ UNIT COMMANDS
    // ------------------------------------------------------------------

    @Override
    public UnitId addUnit(AddUnitCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        log.info("Adding Unit '{}' to Course ID {}", command.name(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        CourseUnit unit = course.addUnit(
                command.name(),
                command.order(),
                command.description()
        );

        // ✅ ONLY save the aggregate root - JPA cascades to units
        courseRepository.save(course);
        log.info("Unit ID {} added successfully.", unit.getId().getValue());

        return unit.getId();
    }

    @Override
    public UnitId addUnitWithImage(AddUnitWithImageCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        log.info("Adding Unit '{}' with image to Course ID {}", command.name(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        CourseUnit unit = course.addUnitWithImage(
                command.name(),
                command.order(),
                command.description(),
                command.imageUrl()
        );

        courseRepository.save(course);
        log.info("Unit ID {} (with image) added successfully.", unit.getId().getValue());

        return unit.getId();
    }

    @Override
    public void updateUnit(UpdateUnitCommand command) {
        UnitId unitId = UnitId.fromString(command.unitId());
        log.info("Updating Unit ID: {}", unitId.getValue());

        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Attempted to update Unit ID {} but it was not found in the course aggregate.", unitId.getValue());
                    return new IllegalStateException("Unit not found in course");
                });

        unit.updateDetails(command.name(), command.description());

        courseRepository.save(course);
        log.debug("Unit ID {} details updated.", unitId.getValue());
    }

    @Override
    public void updateUnitImage(UnitId unitId, String imageUrl) {
        log.info("Updating image for Unit ID: {}", unitId.getValue());
        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Attempted to update image for Unit ID {} but it was not found in the course aggregate.", unitId.getValue());
                    return new IllegalStateException("Unit not found in course");
                });

        unit.setUrlImage(imageUrl);

        courseRepository.save(course);
        log.debug("Unit ID {} image updated.", unitId.getValue());
    }

    // ------------------------------------------------------------------
    // ✅ COURSE QUERIES
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(CourseId courseId) {
        log.debug("Fetching Course DTO by ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);
        return CourseMapper.mapToCourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseByCode(CourseCode code) {
        log.debug("Fetching Course DTO by Code: {}", code.getValue());
        Course course = courseRepository.findByCode(code)
                .orElseThrow(() -> {
                    log.warn("Course not found with code: {}", code.getValue());
                    return new CourseNotFoundException("Course not found with code: " + code.getValue());
                });
        return CourseMapper.mapToCourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByTeacher(UserId teacherId) {
        log.debug("Fetching courses taught by Teacher ID: {}", teacherId.getValue());
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getActiveCourses() {
        log.debug("Fetching all active courses.");
        List<Course> courses = courseRepository.findActiveCourses();
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByGradeAndGroup(String grade, String group) {
        log.debug("Fetching courses by Grade {} and Group {}", grade, group);
        List<Course> courses = courseRepository.findByGradeAndGroup(grade, group);
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getCourseEnrollments(CourseId courseId) {
        log.debug("Fetching enrollment list for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        return course.getEnrollments().stream()
                .map(CourseMapper::mapToEnrollmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseUnitDTO> getCourseUnits(CourseId courseId) {
        log.debug("Fetching unit list for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        return course.getUnits().stream()
                .map(CourseMapper::mapToUnitDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(CourseId courseId, UserId studentId) {
        log.trace("Checking enrollment status for Student ID {} in Course ID {}", studentId.getValue(), courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        return course.getEnrollments().stream()
                .anyMatch(enrollment -> enrollment.getStudentId().equals(studentId)
                        && enrollment.isActive());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCourseCodeAvailable(CourseCode code) {
        log.trace("Checking availability of Course Code: {}", code.getValue());
        return !courseRepository.existsByCode(code);
    }

    // ------------------------------------------------------------------
    // ✅ PRIVATE HELPER METHODS
    // ------------------------------------------------------------------

    private Course findCourseByIdOrThrow(CourseId courseId) {
        log.trace("Attempting to retrieve Course ID: {}", courseId.getValue());
        return courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found with ID: {}", courseId.getValue());
                    return new CourseNotFoundException("Course not found: " + courseId.getValue());
                });
    }

    private Course findCourseByUnitIdOrThrow(UnitId unitId) {
        log.trace("Attempting to find Course containing Unit ID: {}", unitId.getValue());
        return courseRepository.findByUnitId(unitId)
                .orElseThrow(() -> {
                    log.warn("Course not found containing Unit ID: {}", unitId.getValue());
                    return new CourseNotFoundException("Course not found for unit: " + unitId.getValue());
                });
    }
}