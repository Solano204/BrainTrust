
package com.braintrust.education.application.helpers.studentgroup;

import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentGroupEligibilityChecker {

    private final StudentGroupRepository groupRepository;
    private final UserService userService;

    public List<String> getEligibleStudentsForGroup(Course course, List<String> studentIds) {
        Set<String> enrolledStudentIds = getEnrolledStudentIds(course);

        List<String> enrolledToAdd = studentIds.stream()
                .filter(enrolledStudentIds::contains)
                .collect(Collectors.toList());

        if (enrolledToAdd.isEmpty()) {
            log.warn("No enrolled students found to add to group");
            return List.of();
        }

        Set<String> studentsInGroups = getAllStudentsInCourseGroups(course.getId());

        List<String> eligibleToAdd = enrolledToAdd.stream()
                .filter(id -> !studentsInGroups.contains(id))
                .collect(Collectors.toList());

        if (eligibleToAdd.isEmpty()) {
            log.warn("All selected students are already in groups");
            return List.of();
        }

        return eligibleToAdd;
    }

    public Set<String> getAllStudentsInCourseGroups(CourseId courseId) {
        List<StudentGroup> groups = groupRepository.findByCourseId(courseId);
        return groups.stream()
                .flatMap(group -> group.getMemberIds().stream())
                .map(UserId::getValue)
                .collect(Collectors.toSet());
    }

    public Set<String> getEnrolledStudentIds(Course course) {
        return course.getEnrollments().stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE)
                .map(enrollment -> enrollment.getStudentId().getValue())
                .collect(Collectors.toSet());
    }

    public List<UserDTO> getEnrolledStudents(Course course) {
        try {
            Set<String> enrolledStudentIds = getEnrolledStudentIds(course);

            if (enrolledStudentIds.isEmpty()) {
                return List.of();
            }

            return userService.getUsersByIds(new ArrayList<>(enrolledStudentIds));

        } catch (Exception e) {
            log.error("Failed to get enrolled students for course {}: {}",
                    course.getId().getValue(), e.getMessage());
            return List.of();
        }
    }

    public List<UserDTO> filterStudentsWithoutGroup(
            List<UserDTO> enrolledStudents,
            Set<String> studentsInGroups
    ) {
        return enrolledStudents.stream()
                .filter(student -> !studentsInGroups.contains(student.id()))
                .collect(Collectors.toList());
    }
}
