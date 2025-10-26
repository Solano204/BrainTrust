package com.braintrust.containerapp.rest.course;

// 📍 education/infrastructure/rest/CourseController.java
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ========================================
    // ✅ COURSE COMMANDS
    // ========================================

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> createCourse(@RequestBody CreateCourseCommand command) {
        CourseId courseId = courseService.createCourse(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Course created successfully", courseId.getValue()));
    }

    @PostMapping("/with-image")
    public ResponseEntity<SuccessResponseDTO> createCourseWithImage(@RequestBody CreateCourseWithImageCommand command) {
        CourseId courseId = courseService.createCourseWithImage(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Course created successfully with image", courseId.getValue()));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<SuccessResponseDTO> updateCourse(
            @PathVariable String courseId,
            @RequestBody UpdateCourseCommand command
    ) {
        courseService.updateCourseDetails(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course updated successfully", null));
    }

    @PutMapping("/{courseId}/image")
    public ResponseEntity<SuccessResponseDTO> updateCourseImage(
            @PathVariable String courseId,
            @RequestBody UpdateImageRequest request
    ) {
        courseService.updateCourseImage(CourseId.fromString(courseId), request.imageUrl());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course image updated successfully", null));
    }

    @PutMapping("/{courseId}/activate")
    public ResponseEntity<SuccessResponseDTO> activateCourse(@PathVariable String courseId) {
        courseService.activateCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course activated successfully", null));
    }

    @PutMapping("/{courseId}/deactivate")
    public ResponseEntity<SuccessResponseDTO> deactivateCourse(@PathVariable String courseId) {
        courseService.deactivateCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course deactivated successfully", null));
    }

    // ========================================
    // ✅ ENROLLMENT COMMANDS
    // ========================================




    @PostMapping("/{courseId}/enrollments")
    public ResponseEntity<SuccessResponseDTO> enrollStudent(
            @PathVariable String courseId,
            @RequestBody EnrollStudentRequest request
    ) {
        EnrollStudentCommand command = new EnrollStudentCommand(courseId, request.studentId());
        EnrollmentId enrollmentId = courseService.enrollStudent(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Student enrolled successfully", enrollmentId.getValue()));
    }

    @DeleteMapping("/{courseId}/enrollments/{studentId}")
    public ResponseEntity<SuccessResponseDTO> unenrollStudent(
            @PathVariable String courseId,
            @PathVariable String studentId
    ) {
        courseService.unenrollStudent(new UnenrollStudentCommand(courseId, studentId));
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
        AddUnitCommand command = new AddUnitCommand(
                courseId,
                request.name(),
                request.order(),
                request.description()
        );
        UnitId unitId = courseService.addUnit(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Unit added successfully", unitId.getValue()));
    }

    @PostMapping("/{courseId}/units/with-image")
    public ResponseEntity<SuccessResponseDTO> addUnitWithImage(
            @PathVariable String courseId,
            @RequestBody AddUnitWithImageRequest request
    ) {
        AddUnitWithImageCommand command = new AddUnitWithImageCommand(
                courseId,
                request.name(),
                request.order(),
                request.description(),
                request.imageUrl()
        );
        UnitId unitId = courseService.addUnitWithImage(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Unit added successfully with image", unitId.getValue()));
    }

    @PutMapping("/units/{unitId}")
    public ResponseEntity<SuccessResponseDTO> updateUnit(
            @PathVariable String unitId,
            @RequestBody UpdateUnitRequest request
    ) {
        UpdateUnitCommand command = new UpdateUnitCommand(
                unitId,
                request.name(),
                request.description() ,
                request.urlImage()
        );
        courseService.updateUnit(command);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit updated successfully", null));
    }

    @PutMapping("/units/{unitId}/image")
    public ResponseEntity<SuccessResponseDTO> updateUnitImage(
            @PathVariable String unitId,
            @RequestBody UpdateImageRequest request
    ) {
        courseService.updateUnitImage(UnitId.fromString(unitId), request.imageUrl());
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit image updated successfully", null));
    }

    // ========================================
    // ✅ COURSE QUERIES
    // ========================================

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> courses = courseService.getActiveCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String courseId) {
        CourseDTO course = courseService.getCourseById(CourseId.fromString(courseId));
        return ResponseEntity.ok(course);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<CourseDTO> getCourseByCode(@PathVariable String code) {
        CourseDTO course = courseService.getCourseByCode(new CourseCode(code));
        return ResponseEntity.ok(course);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByTeacher(@PathVariable String teacherId) {
        List<CourseDTO> courses = courseService.getCoursesByTeacher(UserId.fromString(teacherId));
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CourseDTO>> getActiveCourses() {
        List<CourseDTO> courses = courseService.getActiveCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/grade/{grade}/group/{group}")
    public ResponseEntity<List<CourseDTO>> getCoursesByGradeAndGroup(
            @PathVariable String grade,
            @PathVariable String group
    ) {
        List<CourseDTO> courses = courseService.getCoursesByGradeAndGroup(grade, group);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<List<EnrollmentDTO>> getCourseEnrollments(@PathVariable String courseId) {
        List<EnrollmentDTO> enrollments = courseService.getCourseEnrollments(CourseId.fromString(courseId));
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/{courseId}/units")
    public ResponseEntity<List<CourseUnitDTO>> getCourseUnits(@PathVariable String courseId) {
        List<CourseUnitDTO> units = courseService.getCourseUnits(CourseId.fromString(courseId));
        return ResponseEntity.ok(units);
    }

    @GetMapping("/{courseId}/enrollments/student/{studentId}/exists")
    public ResponseEntity<Boolean> isStudentEnrolled(
            @PathVariable String courseId,
            @PathVariable String studentId
    ) {
        boolean enrolled = courseService.isStudentEnrolled(
                CourseId.fromString(courseId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(enrolled);
    }

    @GetMapping("/code/{code}/available")
    public ResponseEntity<Boolean> isCourseCodeAvailable(@PathVariable String code) {
        boolean available = courseService.isCourseCodeAvailable(new CourseCode(code));
        return ResponseEntity.ok(available);
    }
}