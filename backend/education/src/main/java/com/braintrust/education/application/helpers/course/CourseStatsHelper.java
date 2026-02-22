package com.braintrust.education.application.helpers.course;

import com.braintrust.education.application.dtos.dtos.CourseStatsDTO;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.application.ports.out.EnrollmentRepository;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.EnrollmentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class CourseStatsHelper {

    private static final Logger log = LoggerFactory.getLogger(CourseStatsHelper.class);

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseStatsHelper(
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public CourseStatsDTO getCourseStatsAdmin() {
        log.info("Calculating course statistics for admin dashboard");

        try {
            List<Course> allCourses = courseRepository.findAll();

            if (allCourses == null || allCourses.isEmpty()) {
                log.warn("No courses found for statistics");
                return getEmptyStats();
            }

            int totalCourses = allCourses.size();
            int activeCourses = (int) allCourses.stream()
                    .filter(Course::isActive)
                    .count();
            int inactiveCourses = totalCourses - activeCourses;

            Set<String> uniqueStudentIds = new HashSet<>();
            Set<String> uniqueTeacherIds = new HashSet<>();
            int totalEnrolledStudents = 0;

            for (Course course : allCourses) {
                uniqueTeacherIds.add(course.getTeacherId().getValue());

                int enrolledStudents = enrollmentRepository.countByCourseAndStatus(
                        course.getId(), EnrollmentStatus.ACTIVE);
                totalEnrolledStudents += enrolledStudents;

                List<String> courseStudentIds = enrollmentRepository.findStudentIdsByCourse(
                        course.getId(), EnrollmentStatus.ACTIVE);
                uniqueStudentIds.addAll(courseStudentIds);
            }

            int totalStudents = uniqueStudentIds.size();
            int totalTeachers = uniqueTeacherIds.size();

            double averageStudentsPerCourse = totalCourses > 0
                    ? (double) totalEnrolledStudents / totalCourses
                    : 0;

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
}