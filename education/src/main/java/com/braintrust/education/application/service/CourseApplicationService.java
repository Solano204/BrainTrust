package com.braintrust.education.application.service;


// 📍 education/infrastructure/persistence/JpaCourseRepositoryAdapter.java

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.CourseCodeAlreadyExistsException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseMapper;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseApplicationService implements CourseService {

    private final CourseRepository courseRepository;

    public CourseApplicationService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // ✅ COURSE COMMANDS

    @Override
    public CourseId createCourse(CreateCourseCommand command) {
        CourseCode code = new CourseCode(command.code());

        if (courseRepository.existsByCode(code)) {
            throw new CourseCodeAlreadyExistsException("Course code already exists: " + command.code());
        }

        UserId teacherId = UserId.fromString(command.teacherId());

        Course course = Course.create(
                code,
                command.name(),
                command.description(),
                command.grade(),
                command.group(),
                teacherId
        );

        Course savedCourse = courseRepository.save(course);
        return savedCourse.getId();
    }

    @Override
    public CourseId createCourseWithImage(CreateCourseWithImageCommand command) {
        CourseCode code = new CourseCode(command.code());

        if (courseRepository.existsByCode(code)) {
            throw new CourseCodeAlreadyExistsException("Course code already exists");
        }

        UserId teacherId = UserId.fromString(command.teacherId());

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
        return savedCourse.getId();
    }

    @Override
    public void updateCourseDetails(UpdateCourseCommand command) {
        Course course = findCourseByIdOrThrow(CourseId.fromString(command.courseId()));

        course.updateDetails(
                command.name(),
                command.description(),
                command.grade(),
                command.group()
        );

        courseRepository.save(course);
    }

    @Override
    public void updateCourseImage(CourseId courseId, String imageUrl) {
        Course course = findCourseByIdOrThrow(courseId);
        course.setUrlImage(imageUrl);
        courseRepository.save(course);
    }

    @Override
    public void activateCourse(CourseId courseId) {
        Course course = findCourseByIdOrThrow(courseId);
        course.activate();
        courseRepository.save(course);
    }

    @Override
    public void deactivateCourse(CourseId courseId) {
        Course course = findCourseByIdOrThrow(courseId);
        course.deactivate();
        courseRepository.save(course);
    }

    // ✅ ENROLLMENT COMMANDS

    @Override
    public EnrollmentId enrollStudent(EnrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        Course course = findCourseByIdOrThrow(courseId);

        Enrollment enrollment = course.enrollStudent(studentId);

        // ✅ ONLY save the aggregate root - JPA cascades to enrollments
        courseRepository.save(course);

        return enrollment.getId();
    }

    @Override
    public void unenrollStudent(UnenrollStudentCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UserId studentId = UserId.fromString(command.studentId());

        Course course = findCourseByIdOrThrow(courseId);
        course.unenrollStudent(studentId);

        courseRepository.save(course);
    }

    // ✅ UNIT COMMANDS

    @Override
    public UnitId addUnit(AddUnitCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        Course course = findCourseByIdOrThrow(courseId);

        CourseUnit unit = course.addUnit(
                command.name(),
                command.order(),
                command.description()
        );

        // ✅ ONLY save the aggregate root - JPA cascades to units
        courseRepository.save(course);

        return unit.getId();
    }

    @Override
    public UnitId addUnitWithImage(AddUnitWithImageCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        Course course = findCourseByIdOrThrow(courseId);

        CourseUnit unit = course.addUnitWithImage(
                command.name(),
                command.order(),
                command.description(),
                command.imageUrl()
        );

        courseRepository.save(course);

        return unit.getId();
    }

    @Override
    public void updateUnit(UpdateUnitCommand command) {
        UnitId unitId = UnitId.fromString(command.unitId());

        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Unit not found in course"));

        unit.updateDetails(command.name(), command.description());

        courseRepository.save(course);
    }

    @Override
    public void updateUnitImage(UnitId unitId, String imageUrl) {
        Course course = findCourseByUnitIdOrThrow(unitId);

        CourseUnit unit = course.getUnits().stream()
                .filter(u -> u.getId().equals(unitId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Unit not found in course"));

        unit.setUrlImage(imageUrl);

        courseRepository.save(course);
    }

    // ✅ COURSE QUERIES

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(CourseId courseId) {
        Course course = findCourseByIdOrThrow(courseId);
        return CourseMapper.mapToCourseDTO(course); // ✅ FIXED
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseByCode(CourseCode code) {
        Course course = courseRepository.findByCode(code)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with code: " + code.getValue()));
        return CourseMapper.mapToCourseDTO(course); // ✅ FIXED
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByTeacher(UserId teacherId) {
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getActiveCourses() {
        List<Course> courses = courseRepository.findActiveCourses();
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByGradeAndGroup(String grade, String group) {
        List<Course> courses = courseRepository.findByGradeAndGroup(grade, group);
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getCourseEnrollments(CourseId courseId) {
        Course course = findCourseByIdOrThrow(courseId);

        return course.getEnrollments().stream()
                .map(CourseMapper::mapToEnrollmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseUnitDTO> getCourseUnits(CourseId courseId) {
        Course course = findCourseByIdOrThrow(courseId);

        return course.getUnits().stream()
                .map(CourseMapper::mapToUnitDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(CourseId courseId, UserId studentId) {
        Course course = findCourseByIdOrThrow(courseId);

        return course.getEnrollments().stream()
                .anyMatch(enrollment -> enrollment.getStudentId().equals(studentId)
                        && enrollment.isActive());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCourseCodeAvailable(CourseCode code) {
        return !courseRepository.existsByCode(code);
    }

    // ✅ PRIVATE HELPER METHODS

    private Course findCourseByIdOrThrow(CourseId courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found: " + courseId.getValue()));
    }

    private Course findCourseByUnitIdOrThrow(UnitId unitId) {
        return courseRepository.findByUnitId(unitId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found for unit: " + unitId.getValue()));
    }
}
