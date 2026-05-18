package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.CourseStatsDTO;
import com.braintrust.education.application.helpers.course.*;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.exceptions.CourseCodeAlreadyExistsException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseMapper;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseApplicationService implements CourseService {

    private static final Logger log = LoggerFactory.getLogger(CourseApplicationService.class);

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    private final CourseEnrollmentHelper enrollmentHelper;
    private final CourseUnitHelper unitHelper;
    private final CourseStatsHelper statsHelper;
    private final GradebookHelper gradebookHelper;

    public CourseApplicationService(
            CourseRepository courseRepository,
            CourseMapper courseMapper,
            CourseEnrollmentHelper enrollmentHelper,
            CourseUnitHelper unitHelper,
            CourseStatsHelper statsHelper,
            GradebookHelper gradebookHelper) {
        this.courseRepository = courseRepository;
        this.courseMapper = courseMapper;
        this.enrollmentHelper = enrollmentHelper;
        this.unitHelper = unitHelper;
        this.statsHelper = statsHelper;
        this.gradebookHelper = gradebookHelper;
        log.info("✅ CourseApplicationService initialized with refactored helpers");
    }

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

        if (command.imageUrl() != null && !command.imageUrl().trim().isEmpty()) {
            course.setUrlImage(command.imageUrl().trim());
            log.debug("Course ID {} image URL updated.", courseId.getValue());
        }

        if (command.teacherId() != null && !command.teacherId().trim().isEmpty()) {
            UserId newTeacherId = UserId.fromString(command.teacherId().trim());
            if (!course.getTeacherId().equals(newTeacherId)) {
                course.setTeacherId(newTeacherId);
                log.info("Course ID {} teacher changed from {} to {}",
                        courseId.getValue(),
                        course.getTeacherId().getValue(),
                        newTeacherId.getValue());
            } else {
                log.debug("Teacher ID unchanged for Course ID: {}", courseId.getValue());
            }
        }

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
    public void updateCourseInformation(UpdateCourseInformationCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Updating comprehensive information for Course ID: {}", courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        course.updateDetails(
                command.name(),
                command.description(),
                command.grade(),
                command.group()
        );

        if (command.imageUrl() != null) {
            course.setUrlImage(command.imageUrl());
        }

        courseRepository.save(course);
        log.info("Comprehensive course information updated for Course ID: {}", courseId.getValue());
    }

    @Override
    public void deleteCourse(CourseId courseId) {
        log.warn("🗑️ Deleting Course ID: {} with cascade", courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        gradebookHelper.deleteCourseGradebooks(courseId);

        courseRepository.delete(course);

        log.info("✅ Course ID {} deleted successfully with cascade", courseId.getValue());
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(CourseId courseId) {
        log.debug("Fetching Course DTO by ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);
        return courseMapper.mapToCourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO findCourseByUnitId(UnitId unitId) {
        log.debug("Finding course containing Unit ID: {}", unitId.getValue());
        Course course = findCourseByUnitIdOrThrow(unitId);
        return courseMapper.mapToCourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByTeacher(UserId teacherId) {
        log.debug("Fetching courses taught by Teacher ID: {}", teacherId.getValue());
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        return courses.stream()
                .map(courseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByStudent(UserId studentId) {
        log.debug("Fetching courses for Student ID: {}", studentId.getValue());
        List<Course> courses = courseRepository.findByStudentId(studentId);
        return courses.stream()
                .map(courseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getActiveCourses() {
        log.debug("📊 Fetching all active courses (legacy method)");
        List<Course> courses = courseRepository.findActiveCourses();
        return courses.stream()
                .map(courseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDTO> getAllCourses(Pageable pageable) {
        log.debug("📊 Fetching paginated courses. Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<Course> coursePage = courseRepository.findAll(pageable);

            List<CourseDTO> dtos = coursePage.getContent().stream()
                    .map(courseMapper::mapToCourseDTO)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} courses (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(),
                    coursePage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, coursePage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated courses: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated courses", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDTO> getActiveCourses(Pageable pageable) {
        log.debug("📊 Fetching paginated active courses. Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<Course> coursePage = courseRepository.findActiveCourses(pageable);

            List<CourseDTO> dtos = coursePage.getContent().stream()
                    .map(courseMapper::mapToCourseDTO)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} active courses (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(),
                    coursePage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, coursePage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated active courses: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated active courses", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDTO> getCoursesByTeacher(UserId teacherId, Pageable pageable) {
        log.debug("📊 Fetching paginated courses for Teacher ID: {}. Page: {}, Size: {}",
                teacherId.getValue(), pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<Course> coursePage = courseRepository.findByTeacherId(teacherId, pageable);

            List<CourseDTO> dtos = coursePage.getContent().stream()
                    .map(courseMapper::mapToCourseDTO)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} courses for Teacher {} (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(), teacherId.getValue(),
                    coursePage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, coursePage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated courses for teacher {}: {}",
                    teacherId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated courses for teacher", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDTO> getCoursesByStudent(UserId studentId, Pageable pageable) {
        log.debug("📊 Fetching paginated courses for Student ID: {}. Page: {}, Size: {}",
                studentId.getValue(), pageable.getPageNumber(), pageable.getPageSize());
        long startTime = System.currentTimeMillis();

        try {
            Page<Course> coursePage = courseRepository.findByStudentId(studentId, pageable);

            List<CourseDTO> dtos = coursePage.getContent().stream()
                    .map(courseMapper::mapToCourseDTO)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("✅ Retrieved page {} of {} courses for Student {} (total: {}) in {}ms",
                    pageable.getPageNumber(), dtos.size(), studentId.getValue(),
                    coursePage.getTotalElements(), duration);

            return new PageImpl<>(dtos, pageable, coursePage.getTotalElements());

        } catch (Exception e) {
            log.error("❌ Failed to fetch paginated courses for student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch paginated courses for student", e);
        }
    }

    @Override
    public EnrollmentId enrollStudent(EnrollStudentCommand command) {
        return enrollmentHelper.enrollStudent(command);
    }

    @Override
    public List<EnrollmentId> bulkEnrollStudents(BulkEnrollCommand command) {
        return enrollmentHelper.bulkEnrollStudents(command);
    }

    @Override
    public void unenrollStudent(UnenrollStudentCommand command) {
        enrollmentHelper.unenrollStudent(command);
    }

    @Override
    public void bulkUnenrollStudents(BulkUnenrollCommand command) {
        enrollmentHelper.bulkUnenrollStudents(command);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getCourseEnrollments(CourseId courseId) {
        return enrollmentHelper.getCourseEnrollments(courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentSearchResultDTO> searchStudentsForEnrollment(String searchQuery, CourseId courseId) {
        return enrollmentHelper.searchStudentsForEnrollment(searchQuery, courseId);
    }

    // ========================================
    // UNIT OPERATIONS - DELEGATED
    // ========================================

    @Override
    public UnitId addUnit(AddUnitCommand command) {
        return unitHelper.addUnit(command);
    }

    @Override
    public UnitId addUnitWithImage(AddUnitWithImageCommand command) {
        return unitHelper.addUnitWithImage(command);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseUnitDTO getUnitById(UnitId unitId) {
        return unitHelper.getUnitById(unitId);
    }

    @Override
    public void updateUnit(UpdateUnitCommand command) {
        unitHelper.updateUnit(command);
    }

    @Override
    public void updateUnitImage(UnitId unitId, String imageUrl) {
        unitHelper.updateUnitImage(unitId, imageUrl);
    }

    @Override
    public void deleteUnit(UnitId unitId) {
        unitHelper.deleteUnit(unitId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseUnitDTO> getCourseUnits(CourseId courseId) {
        return unitHelper.getCourseUnits(courseId);
    }

    @Override
    public CourseStatsDTO getCourseStatsAdmin() {
        return statsHelper.getCourseStatsAdmin();
    }

    @Async("virtualThreadExecutor")
    public Future<CourseId> createCourseAsync(CreateCourseCommand command) {
        return new AsyncResult<>(createCourse(command));
    }

    @Async("virtualThreadExecutor")
    public Future<CourseId> createCourseWithImageAsync(CreateCourseWithImageCommand command) {
        return new AsyncResult<>(createCourseWithImage(command));
    }

    @Async("virtualThreadExecutor")
    public Future<EnrollmentId> enrollStudentAsync(EnrollStudentCommand command) {
        return new AsyncResult<>(enrollStudent(command));
    }

    @Async("virtualThreadExecutor")
    public Future<Void> deleteCourseAsync(CourseId courseId) {
        deleteCourse(courseId);
        return AsyncResult.forValue(null);
    }

    @Async("virtualThreadExecutor")
    public Future<UnitId> addUnitAsync(AddUnitCommand command) {
        return new AsyncResult<>(addUnit(command));
    }

    @Async("virtualThreadExecutor")
    public Future<UnitId> addUnitWithImageAsync(AddUnitWithImageCommand command) {
        return new AsyncResult<>(addUnitWithImage(command));
    }

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