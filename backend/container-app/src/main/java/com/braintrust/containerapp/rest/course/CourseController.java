package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// other imports...
@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")

public class CourseController {

    private static final Logger log =
            LoggerFactory.getLogger(CourseController.class);

    // ...rest of the controller...

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ========================================
    // ✅ COURSE COMMANDS
    // ========================================

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> createCourse(@RequestBody CreateCourseCommand command) {
        log.info("Request to create new course: {}", command.name());
        CourseId courseId = courseService.createCourse(command);
        log.info("Course created successfully with ID: {}", courseId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Course created successfully", courseId.getValue()));
    }

    @PostMapping("/with-image")
    public ResponseEntity<SuccessResponseDTO> createCourseWithImage(@RequestBody CreateCourseWithImageCommand command) {
        log.info("Request to create new course with image: {}", command.name());
        CourseId courseId = courseService.createCourseWithImage(command);
        log.info("Course created with image. ID: {}", courseId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Course created successfully with image", courseId.getValue()));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<SuccessResponseDTO> updateCourse(
            @PathVariable String courseId,
            @RequestBody UpdateCourseCommand command
    ) {
        log.info("Request to update details for Course ID: {}", courseId);
        courseService.updateCourseDetails(command);
        log.debug("Course ID {} details updated.", courseId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course updated successfully", null));
    }

    @PutMapping("/{courseId}/image")
    public ResponseEntity<SuccessResponseDTO> updateCourseImage(
            @PathVariable String courseId,
            @RequestBody UpdateImageRequest request
    ) {
        log.info("Updating image URL for Course ID: {}", courseId);
        courseService.updateCourseImage(CourseId.fromString(courseId), request.imageUrl());
        log.debug("Course ID {} image updated.", courseId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course image updated successfully", null));
    }

    /*
    @PutMapping("/{courseId}/activate")
    public ResponseEntity<SuccessResponseDTO> activateCourse(@PathVariable String courseId) {
        log.info("Activating Course ID: {}", courseId);
        courseService.activateCourse(CourseId.fromString(courseId));
        log.info("Course ID {} status set to active.", courseId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course activated successfully", null));
    }
    */

    /*
    @PutMapping("/{courseId}/deactivate")
    public ResponseEntity<SuccessResponseDTO> deactivateCourse(@PathVariable String courseId) {
        log.warn("Deactivating Course ID: {}", courseId);
        courseService.deactivateCourse(CourseId.fromString(courseId));
        log.warn("Course ID {} status set to inactive.", courseId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course deactivated successfully", null));
    }
    */

    // NEW: Delete course with cascade
    @DeleteMapping("/{courseId}")
    public ResponseEntity<SuccessResponseDTO> deleteCourse(@PathVariable String courseId) {
        log.warn("Deleting Course ID: {} with cascade", courseId);
        courseService.deleteCourse(CourseId.fromString(courseId));
        log.info("Course ID {} deleted successfully with cascade", courseId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course deleted successfully", null));
    }

    // ========================================
    // ✅ ENROLLMENT COMMANDS
    // ========================================

    @PostMapping("/{courseId}/enrollments")
    public ResponseEntity<SuccessResponseDTO> enrollStudent(
            @PathVariable String courseId,
            @RequestBody EnrollStudentRequest request
    ) {
        log.info("Enrolling Student ID {} into Course ID {}", request.studentId(), courseId);
        EnrollStudentCommand command = new EnrollStudentCommand(courseId, request.studentId());
        EnrollmentId enrollmentId = courseService.enrollStudent(command);
        log.info("Enrollment ID {} created.", enrollmentId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Student enrolled successfully", enrollmentId.getValue()));
    }

    @DeleteMapping("/{courseId}/enrollments/{studentId}")
    public ResponseEntity<SuccessResponseDTO> unenrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentId
    ) {
        log.warn("Unenrolling Student ID {} from Course ID {}", studentId, courseId);
        courseService.unenrollStudent(new UnenrollStudentCommand(courseId, studentId));
        log.info("Student ID {} successfully unenrolled.", studentId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Student unenrolled successfully", null));
    }

    // ========================================
    // ✅ UNIT COMMANDS
    // ========================================

    @PostMapping("/{courseId}/units")
    public ResponseEntity<SuccessResponseDTO> addUnit(
            @PathVariable String courseId,
            @RequestBody AddUnitRequest request
    ) {
        log.info("Adding new unit '{}' to Course ID: {}", request.name(), courseId);
        AddUnitCommand command = new AddUnitCommand(
                courseId,
                request.name(),
                request.order(),
                request.description()
        );
        UnitId unitId = courseService.addUnit(command);
        log.info("Unit ID {} added to course.", unitId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Unit added successfully", unitId.getValue()));
    }

    @PostMapping("/{courseId}/units/with-image")
    public ResponseEntity<SuccessResponseDTO> addUnitWithImage(
            @PathVariable String courseId,
            @RequestBody AddUnitWithImageRequest request
    ) {
        log.info("Adding unit with image to Course ID: {}", courseId);
        AddUnitWithImageCommand command = new AddUnitWithImageCommand(
                courseId,
                request.name(),
                request.order(),
                request.description(),
                request.imageUrl()
        );
        UnitId unitId = courseService.addUnitWithImage(command);
        log.info("Unit ID {} (with image) added to course.", unitId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Unit added successfully with image", unitId.getValue()));
    }

    @PutMapping("/units/{unitId}")
    public ResponseEntity<SuccessResponseDTO> updateUnit(
            @PathVariable String unitId,
            @RequestBody UpdateUnitRequest request
    ) {
        log.info("Updating Unit ID: {}", unitId);
        UpdateUnitCommand command = new UpdateUnitCommand(
                unitId,
                request.name(),
                request.description(),
                request.urlImage()
        );
        courseService.updateUnit(command);
        log.debug("Unit ID {} updated.", unitId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit updated successfully", null));
    }

    @PutMapping("/units/{unitId}/image")
    public ResponseEntity<SuccessResponseDTO> updateUnitImage(
            @PathVariable String unitId,
            @RequestBody UpdateImageRequest request
    ) {
        log.info("Updating image for Unit ID: {}", unitId);
        courseService.updateUnitImage(UnitId.fromString(unitId), request.imageUrl());
        log.debug("Unit ID {} image URL updated.", unitId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit image updated successfully", null));
    }

    // NEW: Delete unit with cascade
    @DeleteMapping("/units/{unitId}")
    public ResponseEntity<SuccessResponseDTO> deleteUnit(@PathVariable String unitId) {
        log.warn("Deleting Unit ID: {} with cascade", unitId);
        courseService.deleteUnit(UnitId.fromString(unitId));
        log.info("Unit ID {} deleted successfully with cascade", unitId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit deleted successfully", null));
    }

    // ========================================
    // ✅ COURSE QUERIES
    // ========================================

    /*
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        log.debug("Fetching all active courses.");
        List<CourseDTO> courses = courseService.getActiveCourses();
        return ResponseEntity.ok(courses);
    }
    */

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String courseId) {
        log.debug("Querying details for Course ID: {}", courseId);
        CourseDTO course = courseService.getCourseById(CourseId.fromString(courseId));
        return ResponseEntity.ok(course);
    }

    /*
    @GetMapping("/code/{code}")
    public ResponseEntity<CourseDTO> getCourseByCode(@PathVariable String code) {
        log.debug("Querying course by code: {}", code);
        CourseDTO course = courseService.getCourseByCode(new CourseCode(code));
        return ResponseEntity.ok(course);
    }
    */

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByTeacher(@PathVariable String teacherId) {
        log.debug("Fetching courses by Teacher ID: {}", teacherId);
        List<CourseDTO> courses = courseService.getCoursesByTeacher(UserId.fromString(teacherId));
        return ResponseEntity.ok(courses);
    }

    // NEW: Get courses for student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByStudent(@PathVariable String studentId) {
        log.debug("Fetching courses for Student ID: {}", studentId);
        List<CourseDTO> courses = courseService.getCoursesByStudent(UserId.fromString(studentId));
        return ResponseEntity.ok(courses);
    }

    /*
    @GetMapping("/active")
    public ResponseEntity<List<CourseDTO>> getActiveCourses() {
        log.debug("Fetching all active courses (via dedicated endpoint).");
        List<CourseDTO> courses = courseService.getActiveCourses();
        return ResponseEntity.ok(courses);
    }
    */

    /*
    @GetMapping("/grade/{grade}/group/{group}")
    public ResponseEntity<List<CourseDTO>> getCoursesByGradeAndGroup(
            @PathVariable String grade,
            @PathVariable String group
    ) {
        log.debug("Fetching courses for Grade {} and Group {}", grade, group);
        List<CourseDTO> courses = courseService.getCoursesByGradeAndGroup(grade, group);
        return ResponseEntity.ok(courses);
    }
    */

    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getCourseEnrollments(@PathVariable String courseId) {
        log.debug("Fetching enrollments for Course ID: {}", courseId);
        List<EnrollmentDTO> enrollments = courseService.getCourseEnrollments(CourseId.fromString(courseId));
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/{courseId}/units")
    public ResponseEntity<List<CourseUnitDTO>> getCourseUnits(@PathVariable String courseId) {
        log.debug("Fetching units list for Course ID: {}", courseId);
        List<CourseUnitDTO> units = courseService.getCourseUnits(CourseId.fromString(courseId));
        return ResponseEntity.ok(units);
    }

    /*
    @GetMapping("/{courseId}/enrollments/student/{studentId}/exists")
    public ResponseEntity<Boolean> isStudentEnrolled(
            @PathVariable String courseId,
            @PathVariable String studentId
    ) {
        log.trace("Checking if Student ID {} is enrolled in Course ID {}", studentId, courseId);
        boolean enrolled = courseService.isStudentEnrolled(
                CourseId.fromString(courseId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(enrolled);
    }
    */

    /*
    @GetMapping("/code/{code}/available")
    public ResponseEntity<Boolean> isCourseCodeAvailable(@PathVariable String code) {
        log.trace("Checking availability of course code: {}", code);
        boolean available = courseService.isCourseCodeAvailable(new CourseCode(code));
        return ResponseEntity.ok(available);
    }
    */
}