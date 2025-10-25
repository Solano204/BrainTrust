package com.braintrust.education.application.service;

// 📍 education/application/services/CourseApplicationService.java
import com.braintrust.education.application.Maps.CourseMapper;
import com.braintrust.education.application.dtos.*;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.CourseCodeAlreadyExistsException;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.exceptions.StudentAlreadyEnrolledException;
import com.braintrust.education.domain.exceptions.UnitNotFoundException;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static com.braintrust.education.application.Maps.CourseMapper.mapToCourseDTO;


@Service
@Transactional
public class CourseApplicationService implements CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UnitRepository unitRepository;

    public CourseApplicationService(
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            UnitRepository unitRepository
    ) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.unitRepository = unitRepository;
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

        if (enrollmentRepository.existsByCourseAndStudent(courseId, studentId)) {
            throw new StudentAlreadyEnrolledException("Student already enrolled in this course");
        }

        Enrollment enrollment = course.enrollStudent(studentId);
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        // Save course to persist enrollment relationship
        courseRepository.save(course);

        return savedEnrollment.getId();
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

        CourseUnit savedUnit = unitRepository.save(unit);
        courseRepository.save(course);

        return savedUnit.getId();
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

        CourseUnit savedUnit = unitRepository.save(unit);
        courseRepository.save(course);

        return savedUnit.getId();
    }

    @Override
    public void updateUnit(UpdateUnitCommand command) {
        UnitId unitId = UnitId.fromString(command.unitId());
        CourseUnit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found: " + command.unitId()));

        unit.updateDetails(command.name(), command.description());
        unitRepository.save(unit);
    }

    @Override
    public void updateUnitImage(UnitId unitId, String imageUrl) {
        CourseUnit unit = unitRepository.findById(unitId)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found"));

        unit.setUrlImage(imageUrl);
        unitRepository.save(unit);
    }

    // ✅ COURSE QUERIES

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(CourseId courseId) {
        Course course = findCourseByIdOrThrow(courseId);
        return mapToCourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDTO getCourseByCode(CourseCode code) {
        Course course = courseRepository.findByCode(code)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with code: " + code.getValue()));
        return mapToCourseDTO(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDTO> getCoursesByTeacher(UserId teacherId) {
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        return courses.stream()
                .map(CourseMapper::mapToCourseDTO) // ✅ Use static method reference
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
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        return enrollments.stream()
                .map(CourseMapper::mapToEnrollmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseUnitDTO> getCourseUnits(CourseId courseId) {
        List<CourseUnit> units = unitRepository.findByCourseIdOrderByNumber(courseId);
        return units.stream()
                .map(CourseMapper::mapToUnitDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(CourseId courseId, UserId studentId) {
        return enrollmentRepository.existsByCourseAndStudent(courseId, studentId);
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

}