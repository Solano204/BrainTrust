package com.braintrust.education.application.helpers.course;

import com.braintrust.education.application.dtos.commands.BulkEnrollCommand;
import com.braintrust.education.application.dtos.commands.BulkUnenrollCommand;
import com.braintrust.education.application.dtos.commands.EnrollStudentCommand;
import com.braintrust.education.application.dtos.commands.UnenrollStudentCommand;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.dtos.dtos.StudentSearchResultDTO;
import com.braintrust.education.application.mappers.CourseDtoMapper;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.model.Role;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;


@Component
public class CourseEnrollmentHelper {

    private static final Logger log = LoggerFactory.getLogger(CourseEnrollmentHelper.class);

    private final CourseRepository courseRepository;
    private final UserService userService;
    private final CourseDtoMapper courseDtoMapper;
    private final GradebookHelper gradebookHelper;

    public CourseEnrollmentHelper(
            CourseRepository courseRepository,
            UserService userService,
            CourseDtoMapper courseDtoMapper,
            GradebookHelper gradebookHelper) {
        this.courseRepository = courseRepository;
        this.userService = userService;
        this.courseDtoMapper = courseDtoMapper;
        this.gradebookHelper = gradebookHelper;
    }

    public EnrollmentId enrollStudent(EnrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Enrolling Student ID {} into Course ID {}", studentId.getValue(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);

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

        gradebookHelper.createEmptyGradebook(courseId, studentId);

        return enrollment.getId();
    }

    public List<EnrollmentId> bulkEnrollStudents(BulkEnrollCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Bulk enrolling {} students into Course ID: {}", command.studentIds().size(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);
        List<EnrollmentId> enrollmentIds = new ArrayList<>();

        Set<UserId> alreadyEnrolled = course.getEnrollments().stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .map(Enrollment::getStudentId)
                .collect(Collectors.toSet());

        for (String studentIdStr : command.studentIds()) {
            try {
                UserId studentId = UserId.fromString(studentIdStr);

                if (alreadyEnrolled.contains(studentId)) {
                    log.warn("Student {} is already enrolled, skipping", studentId.getValue());
                    continue;
                }

                Enrollment enrollment = course.enrollStudent(studentId);
                enrollmentIds.add(enrollment.getId());

                gradebookHelper.createEmptyGradebook(courseId, studentId);

                log.debug("Successfully enrolled Student ID: {}", studentId.getValue());
            } catch (Exception e) {
                log.error("Failed to enroll Student ID {}: {}", studentIdStr, e.getMessage());
            }
        }

        courseRepository.save(course);
        log.info("Bulk enrollment completed. Successfully enrolled {} students", enrollmentIds.size());

        return enrollmentIds;
    }

    public void unenrollStudent(UnenrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        log.warn("Unenrolling Student ID {} from Course ID {}", studentId.getValue(), courseId.getValue());

        Course course = findCourseByIdOrThrow(courseId);
        course.unenrollStudent(studentId);

        courseRepository.save(course);
        log.info("Student ID {} successfully unenrolled.", studentId.getValue());
    }

    /**
     * Unenrolls multiple students from a course
     */
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

    public List<EnrollmentDTO> getCourseEnrollments(CourseId courseId) {
        log.debug("Fetching enrollment list for Course ID: {}", courseId.getValue());
        Course course = findCourseByIdOrThrow(courseId);

        List<String> studentIds = course.getEnrollments().stream()
                .map(enrollment -> enrollment.getStudentId().getValue())
                .collect(Collectors.toList());

        List<UserDTO> userDetails = userService.getUsersByIds(studentIds);
        Map<String, UserDTO> userDetailsMap = userDetails.stream()
                .collect(Collectors.toMap(UserDTO::id, user -> user));

        return course.getEnrollments().stream()
                .map(enrollment -> {
                    var finalGrade = gradebookHelper.getFinalGrade(enrollment, courseId);
                    return courseDtoMapper.mapToEnrollmentDTO(enrollment, course, userDetailsMap, finalGrade);
                })
                .collect(Collectors.toList());
    }

    public List<StudentSearchResultDTO> searchStudentsForEnrollment(String searchQuery, CourseId courseId) {
        log.info("Searching students for enrollment in Course ID: {} with query: '{}'",
                courseId.getValue(), searchQuery);

        try {
            Course course = findCourseByIdOrThrow(courseId);

            Map<UserId, Enrollment> enrolledStudents = course.getEnrollments().stream()
                    .collect(Collectors.toMap(
                            Enrollment::getStudentId,
                            enrollment -> enrollment
                    ));

            List<MinimalUserInfoDTO> foundStudents = userService.searchUsersByName(searchQuery, Role.STUDENT);

            List<String> userIds = foundStudents.stream()
                    .map(MinimalUserInfoDTO::userId)
                    .collect(Collectors.toList());

            List<UserDTO> userDetails = userService.getUsersByIds(userIds);
            Map<String, UserDTO> userDetailsMap = userDetails.stream()
                    .collect(Collectors.toMap(UserDTO::id, user -> user));

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

    private Course findCourseByIdOrThrow(CourseId courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> {
                    log.warn("Course not found with ID: {}", courseId.getValue());
                    return new CourseNotFoundException("Course not found: " + courseId.getValue());
                });
    }
}