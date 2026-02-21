package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.CourseStatsDTO;
import com.braintrust.education.application.ports.in.CourseService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.FileUploadDTO;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import com.braintrust.shared.application.ports.in.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private static final Logger log = LoggerFactory.getLogger(CourseController.class);

    private final CourseService courseService;
    private final StorageService storageService;



    public CourseController(CourseService courseService, StorageService storageService) {
        this.courseService = courseService;
        this.storageService = storageService;
    }

    @Operation(
            summary = "Get all courses with pagination",
            description = "Retrieves a paginated list of all courses. Supports sorting and filtering by page/size."
    )
    @ApiResponse(responseCode = "200", description = "Paginated courses retrieved successfully")
    @GetMapping("/paginated")
    public ResponseEntity<PaginatedResponse<CourseDTO>> getAllCoursesPaginated(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Number of items per page", example = "20")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Sort by field (e.g., 'name,asc' or 'createdAt,desc')",
                    example = "createdAt,desc")
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        log.info("📊 Fetching paginated courses. Page: {}, Size: {}, Sort: {}", page, size, sort);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<CourseDTO> coursePage = courseService.getAllCourses(pageable);

        PaginatedResponse<CourseDTO> response = PaginatedResponse.fromPage(coursePage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get active courses with pagination",
            description = "Retrieves a paginated list of all active courses."
    )
    @ApiResponse(responseCode = "200", description = "Paginated active courses retrieved successfully")
    @GetMapping("/active/paginated")
    public ResponseEntity<PaginatedResponse<CourseDTO>> getActiveCoursesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {

        log.info("📊 Fetching paginated active courses. Page: {}, Size: {}", page, size);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<CourseDTO> coursePage = courseService.getActiveCourses(pageable);

        PaginatedResponse<CourseDTO> response = PaginatedResponse.fromPage(coursePage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get teacher's courses with pagination",
            description = "Retrieves a paginated list of courses taught by a specific teacher."
    )
    @ApiResponse(responseCode = "200", description = "Teacher's paginated courses retrieved successfully")
    @GetMapping("/teacher/{teacherId}/paginated")
    public ResponseEntity<PaginatedResponse<CourseDTO>> getCoursesByTeacherPaginated(
            @PathVariable String teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {

        log.info("📊 Fetching paginated courses for Teacher ID: {}. Page: {}, Size: {}", teacherId, page, size);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<CourseDTO> coursePage = courseService.getCoursesByTeacher(UserId.fromString(teacherId), pageable);

        PaginatedResponse<CourseDTO> response = PaginatedResponse.fromPage(coursePage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get student's enrolled courses with pagination",
            description = "Retrieves a paginated list of courses a student is enrolled in."
    )
    @ApiResponse(responseCode = "200", description = "Student's paginated courses retrieved successfully")
    @GetMapping("/student/{studentId}/paginated")
    public ResponseEntity<PaginatedResponse<CourseDTO>> getCoursesByStudentPaginated(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {

        log.info("📊 Fetching paginated courses for Student ID: {}. Page: {}, Size: {}", studentId, page, size);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<CourseDTO> coursePage = courseService.getCoursesByStudent(UserId.fromString(studentId), pageable);

        PaginatedResponse<CourseDTO> response = PaginatedResponse.fromPage(coursePage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Search courses by name",
            description = "Searches courses by name with pagination support."
    )
    @ApiResponse(responseCode = "200", description = "Courses found successfully")
    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<CourseDTO>> searchCoursesByName(
            @Parameter(description = "Course name to search for", required = true)
            @RequestParam String name,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {

        log.info("🔍 Searching courses by name: '{}'. Page: {}, Size: {}", name, page, size);

        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Page<CourseDTO> allCoursesPage = courseService.getAllCourses(pageable);

        List<CourseDTO> filteredCourses = allCoursesPage.getContent().stream()
                .filter(course -> course.name().toLowerCase().contains(name.toLowerCase()))
                .collect(Collectors.toList());

        Page<CourseDTO> filteredPage = new PageImpl<>(
                filteredCourses,
                pageable,
                allCoursesPage.getTotalElements()
        );

        PaginatedResponse<CourseDTO> response = PaginatedResponse.fromPage(filteredPage);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get all active courses (legacy)",
            description = "Retrieves all active courses without pagination. Use /active/paginated endpoint for better performance with large datasets."
    )
    @ApiResponse(responseCode = "200", description = "All active courses retrieved")
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        log.debug("Fetching all active courses (legacy endpoint).");
        List<CourseDTO> courses = courseService.getActiveCourses();
        return ResponseEntity.ok(courses);
    }

    @Operation(
            summary = "Get teacher's courses (legacy)",
            description = "Retrieves all courses taught by a teacher without pagination."
    )
    @ApiResponse(responseCode = "200", description = "Teacher's courses retrieved")
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByTeacher(@PathVariable String teacherId) {
        log.info("Fetching courses by Teacher ID: {} (legacy endpoint)", teacherId);
        List<CourseDTO> courses = courseService.getCoursesByTeacher(UserId.fromString(teacherId));
        return ResponseEntity.ok(courses);
    }

    @Operation(
            summary = "Get student's courses (legacy)",
            description = "Retrieves all courses a student is enrolled in without pagination."
    )
    @ApiResponse(responseCode = "200", description = "Student's courses retrieved")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByStudent(@PathVariable String studentId) {
        log.info("Fetching courses for Student ID: {} (legacy endpoint)", studentId);
        List<CourseDTO> courses = courseService.getCoursesByStudent(UserId.fromString(studentId));
        return ResponseEntity.ok(courses);
    }


    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseCommand command) {
        log.info("Request to create new course: {}", command.name());
        CourseId courseId = courseService.createCourse(command);
        CourseDTO createdCourse = courseService.getCourseById(courseId);
        log.info("Course created successfully with ID: {}", courseId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
    }

    @PostMapping("/with-image")
    public ResponseEntity<CourseDTO> createCourseWithImage(@RequestBody CreateCourseWithImageCommand command) {
        log.info("Request to create new course with image: {}", command.name());
        CourseId courseId = courseService.createCourseWithImage(command);
        CourseDTO createdCourse = courseService.getCourseById(courseId);
        log.info("Course created with image. ID: {}", courseId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
    }



    @PutMapping("/{courseId}")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable String courseId,
            @RequestBody UpdateCourseCommand command
    ) {
        log.info("Request to update details for Course ID: {}", courseId);
        courseService.updateCourseDetails(command);
        CourseDTO updatedCourse = courseService.getCourseById(CourseId.fromString(courseId));
        log.debug("Course ID {} details updated.", courseId);
        return ResponseEntity.ok(updatedCourse);
    }

    @PostMapping(value = "/{courseId}/image/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseDTO> uploadCourseImage(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading course image for Course ID: {}", courseId);

        try {
            FileUploadDTO uploadResult = storageService.uploadFile(file, "courses/" + courseId + "/images");

            courseService.updateCourseImage(CourseId.fromString(courseId), uploadResult.url());

            CourseDTO updatedCourse = courseService.getCourseById(CourseId.fromString(courseId));

            return ResponseEntity.ok(updatedCourse);

        } catch (Exception e) {
            log.error("Failed to upload course image for Course ID {}: {}", courseId, e.getMessage(), e);
            throw new RuntimeException("Failed to upload course image", e);
        }
    }

    @PostMapping("/{courseId}/units")
    public ResponseEntity<CourseUnitDTO> addUnit(
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

        CourseUnitDTO createdUnit = courseService.getUnitById(unitId);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUnit);
    }

    @PostMapping("/{courseId}/units/with-image")
    public ResponseEntity<CourseUnitDTO> addUnitWithImage(
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

        CourseUnitDTO createdUnit = courseService.getUnitById(unitId);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUnit);
    }

    @PutMapping("/units/{unitId}")
    public ResponseEntity<CourseUnitDTO> updateUnit(
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

        CourseUnitDTO updatedUnit = courseService.getUnitById(UnitId.fromString(unitId));

        return ResponseEntity.ok(updatedUnit);
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


    @DeleteMapping("/{courseId}")
    public ResponseEntity<SuccessResponseDTO> deleteCourse(@PathVariable String courseId) {
        log.warn("Deleting Course ID: {} with cascade", courseId);
        courseService.deleteCourse(CourseId.fromString(courseId));
        log.info("Course ID {} deleted successfully with cascade", courseId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course deleted successfully", null));
    }

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


    @PostMapping(value = "/units/{unitId}/image/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SuccessResponseDTO> uploadUnitImage(
            @PathVariable String unitId,
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading unit image for Unit ID: {}", unitId);

        try {
            FileUploadDTO uploadResult = storageService.uploadFile(file, "units/" + unitId + "/images");

            courseService.updateUnitImage(UnitId.fromString(unitId), uploadResult.url());

            Map<String, Object> data = new HashMap<>();
            data.put("url", uploadResult.url());
            data.put("unitId", unitId);

            return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit image uploaded successfully", data));

        } catch (Exception e) {
            log.error("Failed to upload unit image for Unit ID {}: {}", unitId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SuccessResponseDTO(false, "Failed to upload unit image: " + e.getMessage(), null));
        }
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

    @DeleteMapping("/units/{unitId}")
    public ResponseEntity<SuccessResponseDTO> deleteUnit(@PathVariable String unitId) {
        log.warn("Deleting Unit ID: {} with cascade", unitId);
        courseService.deleteUnit(UnitId.fromString(unitId));
        log.info("Unit ID {} deleted successfully with cascade", unitId);
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Unit deleted successfully", null));
    }


    @GetMapping("/courses/stats")
    public ResponseEntity<CourseStatsDTO> getCourseStatsAdmin() {
        log.info("Fetching course statistics for admin dashboard");
        CourseStatsDTO stats = courseService.getCourseStatsAdmin();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String courseId) {
        log.debug("Querying details for Course ID: {}", courseId);
        CourseDTO course = courseService.getCourseById(CourseId.fromString(courseId));
        return ResponseEntity.ok(course);
    }

    @GetMapping("/{courseId}/enrollments/search")
    public ResponseEntity<List<StudentSearchResultDTO>> searchStudentsForEnrollment(
            @PathVariable String courseId,
            @RequestParam String query) {

        log.info("Searching students for enrollment in course {} with query: '{}'", courseId, query);

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(List.of());
        }

        List<StudentSearchResultDTO> results = courseService.searchStudentsForEnrollment(
                query.trim(),
                CourseId.fromString(courseId)
        );

        return ResponseEntity.ok(results);
    }

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

    @PostMapping("/{courseId}/enrollments/bulk")
    public ResponseEntity<SuccessResponseDTO> bulkEnrollStudents(
            @PathVariable String courseId,
            @RequestBody BulkEnrollRequest request) {

        log.info("Bulk enrolling {} students into Course ID: {}", request.studentIds().size(), courseId);

        BulkEnrollCommand command = new BulkEnrollCommand(courseId, request.studentIds());
        List<EnrollmentId> enrollmentIds = courseService.bulkEnrollStudents(command);

        log.info("Bulk enrollment completed. Created {} enrollments", enrollmentIds.size());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Students enrolled successfully",
                        enrollmentIds.stream().map(EnrollmentId::getValue).collect(Collectors.toList())));
    }


    @DeleteMapping("/{courseId}/enrollments/bulk")
    public ResponseEntity<SuccessResponseDTO> bulkUnenrollStudents(
            @PathVariable String courseId,
            @RequestBody BulkUnenrollRequest request) {

        log.warn("Bulk unenrolling {} students from Course ID: {}", request.studentIds().size(), courseId);

        BulkUnenrollCommand command = new BulkUnenrollCommand(courseId, request.studentIds());
        courseService.bulkUnenrollStudents(command);

        log.info("Bulk unenrollment completed for {} students", request.studentIds().size());

        return ResponseEntity.ok(new SuccessResponseDTO(true, "Students unenrolled successfully", null));
    }

    @PutMapping("/{courseId}/information")
    public ResponseEntity<SuccessResponseDTO> updateCourseInformation(
            @PathVariable String courseId,
            @RequestBody UpdateCourseInformationCommand command) {

        log.info("Updating comprehensive course information for Course ID: {}", courseId);
        courseService.updateCourseInformation(command);
        log.debug("Course ID {} information updated.", courseId);

        return ResponseEntity.ok(new SuccessResponseDTO(true, "Course information updated successfully", null));
    }

}