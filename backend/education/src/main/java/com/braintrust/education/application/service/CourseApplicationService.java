package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.application.ports.out.EnrollmentRepository;
import com.braintrust.education.application.ports.out.GradebookRepository;
import com.braintrust.education.domain.exceptions.CourseCodeAlreadyExistsException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseMapper;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.concurrent.Future;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class CourseApplicationService implements CourseService {

    private static final Logger log =
            LoggerFactory.getLogger(CourseApplicationService.class);

    private final CourseRepository courseRepository;
    private final GradebookRepository gradebookRepository;
    private final UserService userService;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseMapper courseMapper;

    public CourseApplicationService(CourseRepository courseRepository,
                                    GradebookRepository gradebookRepository,
                                    UserService userService, EnrollmentRepository enrollmentRepository, CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.gradebookRepository = gradebookRepository;
        this.userService = userService;
        this.enrollmentRepository = enrollmentRepository;
        this.courseMapper = courseMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO findCourseByUnitId(UnitId unitId) {
        log.debug("Finding course containing Unit ID: {}", unitId.getValue());
        Course course = findCourseByUnitIdOrThrow(unitId);
        return courseMapper.mapToCourseDTO(course);
    }




    // ------------------------------------------------------------------
    // ✅ COURSE COMMANDS (SYNC)
    // ------------------------------------------------------------------


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

    // ------------------------------------------------------------------
    // ✅ LEGACY METHODS (for backward compatibility)
    // ------------------------------------------------------------------

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

        // Update basic details
        course.updateDetails(
                command.name(),
                command.description(),
                command.grade(),
                command.group()
        );

        // Update image URL if provided
        if (command.imageUrl() != null && !command.imageUrl().trim().isEmpty()) {
            course.setUrlImage(command.imageUrl().trim());
            log.debug("Course ID {} image URL updated.", courseId.getValue());
        }

        // Update teacher ID if provided and different
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
    public void deleteCourse(CourseId courseId) {
        log.warn("🗑️ Deleting Course ID: {} with cascade", courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        // Delete associated gradebooks first
        deleteCourseGradebooks(courseId);

        // Delete the course
        courseRepository.delete(course);

        log.info("✅ Course ID {} deleted successfully with cascade", courseId.getValue());
    }

    private void deleteCourseGradebooks(CourseId courseId) {
        try {
            List<Gradebook> gradebooks = gradebookRepository.findByCourseId(courseId);
            if (!gradebooks.isEmpty()) {
                log.info("🗑️ Deleting {} gradebooks for Course ID: {}", gradebooks.size(), courseId.getValue());
                for (Gradebook gradebook : gradebooks) {
                    gradebookRepository.delete(gradebook);
                }
                log.info("✅ Gradebooks deleted for Course ID: {}", courseId.getValue());
            }
        } catch (Exception e) {
            log.error("❌ Failed to delete gradebooks for Course ID {}: {}", courseId.getValue(), e.getMessage());
        }
    }

    // ------------------------------------------------------------------
    // ✅ ENROLLMENT COMMANDS (SYNC)
    // ------------------------------------------------------------------

    @Override
    public EnrollmentId enrollStudent(EnrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Enrolling Student ID {} into Course ID {}", studentId.getValue(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        // Check if student is already enrolled
        boolean alreadyEnrolled = course.getEnrollments().stream()
                .anyMatch(e -> e.getStudentId().equals(studentId) &&
                        e.getStatus() == EnrollmentStatus.ACTIVE);

        if (alreadyEnrolled) {
            log.warn("Student {} is already enrolled in course {}",
                    studentId.getValue(), courseId.getValue());
            throw new IllegalStateException("Student is already enrolled in this course");
        }

        Enrollment enrollment = course.enrollStudent(studentId);
        courseRepository.save(course);

        log.info("Student ID {} successfully enrolled. Enrollment ID: {}",
                studentId.getValue(), enrollment.getId().getValue());

        createEmptyGradebook(courseId, studentId);

        return enrollment.getId();
    }

    @Override
    public List<EnrollmentId> bulkEnrollStudents(BulkEnrollCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Bulk enrolling {} students into Course ID: {}", command.studentIds().size(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);
        List<EnrollmentId> enrollmentIds = new ArrayList<>();

        // Get current enrollments for quick lookup
        Set<UserId> alreadyEnrolled = course.getEnrollments().stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .map(Enrollment::getStudentId)
                .collect(Collectors.toSet());

        for (String studentIdStr : command.studentIds()) {
            try {
                UserId studentId = UserId.fromString(studentIdStr);

                // Skip if already enrolled
                if (alreadyEnrolled.contains(studentId)) {
                    log.warn("Student {} is already enrolled, skipping", studentId.getValue());
                    continue;
                }

                Enrollment enrollment = course.enrollStudent(studentId);
                enrollmentIds.add(enrollment.getId());

                // Create gradebook for each student
                createEmptyGradebook(courseId, studentId);

                log.debug("Successfully enrolled Student ID: {}", studentId.getValue());
            } catch (Exception e) {
                log.error("Failed to enroll Student ID {}: {}", studentIdStr, e.getMessage());
            }
        }

        courseRepository.save(course);
        log.info("Bulk enrollment completed. Successfully enrolled {} students", enrollmentIds.size());

        return enrollmentIds;
    }

    @Override
    public void bulkUnenrollStudents(BulkUnenrollCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Bulk unenrolling {} students from Course ID: {}", command.studentIds().size(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        for (String studentIdStr : command.studentIds()) {
            try {
                UserId studentId = UserId.fromString(studentIdStr);
                course.unenrollStudent(studentId);
                log.debug("Successfully unenrolled Student ID: {}", studentId.getValue());
            } catch (Exception e) {
                log.error("Failed to unenroll Student ID {}: {}", studentIdStr, e.getMessage());
            }
        }

        courseRepository.save(course);
        log.info("Bulk unenrollment completed for Course ID: {}", courseId.getValue());
    }

    @Override
    public void updateCourseInformation(UpdateCourseInformationCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Updating comprehensive information for Course ID: {}", courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

        // Update basic course details
        course.updateDetails(
                command.name(),
                command.description(),
                command.grade(),
                command.group()
        );

        // Update image if provided
        if (command.imageUrl() != null) {
            course.setUrlImage(command.imageUrl());
        }

        courseRepository.save(course);
        log.info("Comprehensive course information updated for Course ID: {}", courseId.getValue());
    }

    private void createEmptyGradebook(CourseId courseId, UserId studentId) {
        try {
            boolean gradebookExists = gradebookRepository.existsByCourseAndStudent(courseId, studentId);

            if (!gradebookExists) {
                log.info("📚 Creating empty Gradebook for Student {} in Course {}",
                        studentId.getValue(), courseId.getValue());

                Gradebook emptyGradebook = Gradebook.create(courseId, studentId);
                gradebookRepository.save(emptyGradebook);

                log.info("✅ Empty Gradebook created for Student {} in Course {}",
                        studentId.getValue(), courseId.getValue());
            } else {
                log.debug("📚 Gradebook already exists for Student {} in Course {}",
                        studentId.getValue(), courseId.getValue());
            }

        } catch (Exception e) {
            log.error("❌ Failed to create Gradebook for Student {} in Course {}: {}",
                    studentId.getValue(), courseId.getValue(), e.getMessage(), e);
        }
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
    // ✅ UNIT COMMANDS (SYNC)
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
    @Transactional(readOnly = true)
    public CourseUnitDTO getUnitById(UnitId unitId) {
        log.debug("Getting unit by ID: {}", unitId.getValue());
        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Unit not found in course"));

        return courseMapper.mapToUnitDTO(unit);
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
        unit.setUrlImage(command.urlImage());

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

    @Override
    public void deleteUnit(UnitId unitId) {
        log.warn("🗑️ Deleting Unit ID: {} with cascade", unitId.getValue());

        Course course = findCourseByUnitIdOrThrow(unitId);

        boolean removed = course.removeUnit(unitId);

        if (removed) {
            courseRepository.save(course);
            log.info("✅ Unit ID {} deleted successfully from Course ID {}",
                    unitId.getValue(), course.getId().getValue());
        } else {
            log.error("❌ Unit ID {} not found in Course ID {}",
                    unitId.getValue(), course.getId().getValue());
            throw new IllegalStateException("Unit not found in course");
        }
    }

    // ------------------------------------------------------------------
    // ✅ COURSE QUERIES (SYNC)
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(CourseId courseId) {
        log.debug("Fetching Course DTO by ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);
        return courseMapper.mapToCourseDTO(course);
    }


    @Override
    public CourseStatsDTO getCourseStatsAdmin() {
        log.info("Calculating course statistics for admin dashboard");

        try {
            // Get all courses
            List<com.braintrust.education.domain.model.Course> allCourses =
                    courseRepository.findAll(); // You'll need to add this method

            if (allCourses == null || allCourses.isEmpty()) {
                log.warn("No courses found for statistics");
                return getEmptyStats();
            }

            // Calculate statistics
            int totalCourses = allCourses.size();
            int activeCourses = (int) allCourses.stream()
                    .filter(com.braintrust.education.domain.model.Course::isActive)
                    .count();
            int inactiveCourses = totalCourses - activeCourses;

            // Count total students (unique across all courses)
            Set<String> uniqueStudentIds = new HashSet<>();
            Set<String> uniqueTeacherIds = new HashSet<>();
            int totalEnrolledStudents = 0;

            for (com.braintrust.education.domain.model.Course course : allCourses) {
                // Add teacher
                uniqueTeacherIds.add(course.getTeacherId().getValue());

                // Count enrolled students in this course
                int enrolledStudents = enrollmentRepository.countByCourseAndStatus(
                        course.getId(), EnrollmentStatus.ACTIVE);
                totalEnrolledStudents += enrolledStudents;

                // Get unique student IDs for this course
                List<String> courseStudentIds = enrollmentRepository.findStudentIdsByCourse(
                        course.getId(), EnrollmentStatus.ACTIVE);
                uniqueStudentIds.addAll(courseStudentIds);
            }

            int totalStudents = uniqueStudentIds.size();
            int totalTeachers = uniqueTeacherIds.size();

            // Calculate average students per course
            double averageStudentsPerCourse = totalCourses > 0
                    ? (double) totalEnrolledStudents / totalCourses
                    : 0;

            // Round to 2 decimal places
            averageStudentsPerCourse = BigDecimal.valueOf(averageStudentsPerCourse)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();

            CourseStatsDTO stats = new CourseStatsDTO(
                    totalCourses,
                    activeCourses,
                    inactiveCourses,
                    totalStudents,
                    totalTeachers,
                    averageStudentsPerCourse
            );

            log.info("Course statistics calculated: {} courses, {} students, {} teachers",
                    totalCourses, totalStudents, totalTeachers);

            return stats;

        } catch (Exception e) {
            log.error("Failed to calculate course statistics: {}", e.getMessage(), e);
            return getEmptyStats();
        }
    }

    private CourseStatsDTO getEmptyStats() {
        return new CourseStatsDTO(0, 0, 0, 0, 0, 0.0);
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
    public List<StudentSearchResultDTO> searchStudentsForEnrollment(String searchQuery, CourseId courseId) {
        log.info("Searching students for enrollment in Course ID: {} with query: '{}'",
                courseId.getValue(), searchQuery);

        try {
            // 1. Get the course to check existing enrollments
            Course course = findCourseByIdOrThrow(courseId);

            // Create map of enrolled students for quick lookup
            Map<UserId, Enrollment> enrolledStudents = course.getEnrollments().stream()
                    .collect(Collectors.toMap(
                            Enrollment::getStudentId,
                            enrollment -> enrollment
                    ));

            // 2. Search students by name
            List<MinimalUserInfoDTO> foundStudents = userService.searchUsersByName(searchQuery, Role.STUDENT);

            // 3. Get additional user details for email and student ID
            List<String> userIds = foundStudents.stream()
                    .map(MinimalUserInfoDTO::userId)
                    .collect(Collectors.toList());

            List<UserDTO> userDetails = userService.getUsersByIds(userIds);
            Map<String, UserDTO> userDetailsMap = userDetails.stream()
                    .collect(Collectors.toMap(UserDTO::id, user -> user));

            // 4. Map to result DTO
            List<StudentSearchResultDTO> results = foundStudents.stream()
                    .map(student -> {
                        UserDTO userDetail = userDetailsMap.get(student.userId());
                        UserId userId = UserId.fromString(student.userId());

                        boolean isAlreadyEnrolled = enrolledStudents.containsKey(userId);
                        Enrollment enrollment = isAlreadyEnrolled ? enrolledStudents.get(userId) : null;

                        return new StudentSearchResultDTO(
                                student.userId(),
                                student.personId(),
                                student.firstName(),
                                student.lastName(),
                                student.fullName(),
                                userDetail != null ? userDetail.email() : "",
                                userDetail != null ? userDetail.studentId() : "",
                                isAlreadyEnrolled,
                                enrollment != null ? enrollment.getId().getValue() : null,
                                enrollment != null ? enrollment.getStatus().name() : null
                        );
                    })
                    .collect(Collectors.toList());

            log.info("Found {} students for enrollment search in course {}",
                    results.size(), courseId.getValue());
            return results;

        } catch (Exception e) {
            log.error("Failed to search students for enrollment in course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to search students for enrollment", e);
        }
    }



    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getCourseEnrollments(CourseId courseId) {
        log.debug("Fetching enrollment list for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        // Get all student IDs for batch fetching
        List<String> studentIds = course.getEnrollments().stream()
                .map(enrollment -> enrollment.getStudentId().getValue())
                .collect(Collectors.toList());

        // Get user details in batch
        List<UserDTO> userDetails = userService.getUsersByIds(studentIds);
        Map<String, UserDTO> userDetailsMap = userDetails.stream()
                .collect(Collectors.toMap(UserDTO::id, user -> user));

        return course.getEnrollments().stream()
                .map(enrollment -> mapToEnrollmentDTO(enrollment, course, userDetailsMap))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseUnitDTO> getCourseUnits(CourseId courseId) {
        log.debug("Fetching unit list for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        return course.getUnits().stream()
                .map(courseMapper::mapToUnitDTO)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // ✅ ASYNC ENTRY POINTS USING VIRTUAL THREADS
    // ------------------------------------------------------------------

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

    private EnrollmentDTO mapToEnrollmentDTO(Enrollment enrollment, Course course,
                                             Map<String, UserDTO> userDetailsMap) {
        try {
            UserDTO userDetail = userDetailsMap.get(enrollment.getStudentId().getValue());

            String studentName = userDetail != null ? userDetail.person().fullName() : "Unknown Student";
            String studentEmail = userDetail != null ? userDetail.email() : "";
            String studentRefId = userDetail != null ? userDetail.studentId() : "";

            // Get final grade
            GradeDTO finalGradeDTO = getFinalGrade(enrollment, course.getId());

            return new EnrollmentDTO(
                    enrollment.getId().getValue(),
                    course.getId().getValue(),
                    course.getName(),
                    enrollment.getStudentId().getValue(),
                    studentName,
                    studentEmail,
                    studentRefId,
                    enrollment.getEnrollmentDate().toString(),
                    enrollment.getStatus().name(),
                    finalGradeDTO
            );
        } catch (Exception e) {
            log.warn("Failed to map enrollment {}, using fallback: {}",
                    enrollment.getId().getValue(), e.getMessage());
            return mapToEnrollmentDTOFallback(enrollment, course);
        }
    }

    private GradeDTO getFinalGrade(Enrollment enrollment, CourseId courseId) {
        try {
            // If enrollment has finalGrade
            if (enrollment.getFinalGrade() != null) {
                Grade grade = enrollment.getFinalGrade();
                return new GradeDTO(
                        grade.getValue().toString(),
                        grade.getMaxScore().toString(),
                        grade.getPercentage().toString()
                );
            }

            // Try to get from gradebook
            try {
                Optional<Gradebook> gradebook = gradebookRepository.findByCourseAndStudent(
                        courseId, enrollment.getStudentId());

                if (gradebook.isPresent() && gradebook.get().getFinalGrade() != null) {
                    Grade grade =  new Grade( gradebook.get().getFinalGrade(), gradebook.get().getFinalGrade());
                    return new GradeDTO(
                            grade.getValue().toString(),
                            grade.getMaxScore().toString(),
                            grade.getPercentage().toString()
                    );
                }
            } catch (Exception e) {
                log.debug("No gradebook found for student {} in course {}",
                        enrollment.getStudentId().getValue(), courseId.getValue());
            }

            return null;
        } catch (Exception e) {
            log.warn("Failed to get final grade for enrollment {}: {}",
                    enrollment.getId().getValue(), e.getMessage());
            return null;
        }
    }

    private EnrollmentDTO mapToEnrollmentDTOFallback(Enrollment enrollment, Course course) {
        GradeDTO gradeDTO = null;
        if (enrollment.getFinalGrade() != null) {
            Grade grade = enrollment.getFinalGrade();
            gradeDTO = new GradeDTO(
                    grade.getValue().toString(),
                    grade.getMaxScore().toString(),
                    grade.getPercentage().toString()
            );
        }

        return new EnrollmentDTO(
                enrollment.getId().getValue(),
                course.getId().getValue(),
                course.getName(),
                enrollment.getStudentId().getValue(),
                "Student Name",
                "",
                "",
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }
}