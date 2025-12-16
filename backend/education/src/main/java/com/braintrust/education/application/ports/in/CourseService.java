package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.dtos.dtos.StudentSearchResultDTO;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourseService {

    // Commands
    CourseId createCourse(CreateCourseCommand command);
    CourseId createCourseWithImage(CreateCourseWithImageCommand command);
    void updateCourseDetails(UpdateCourseCommand command);
    void updateCourseImage(CourseId courseId, String imageUrl);

    // ✅ NEW: Pagination methods
    Page<CourseDTO> getAllCourses(Pageable pageable);
    Page<CourseDTO> getActiveCourses(Pageable pageable);
    Page<CourseDTO> getCoursesByTeacher(UserId teacherId, Pageable pageable);
    Page<CourseDTO> getCoursesByStudent(UserId studentId, Pageable pageable);

    /*
    void activateCourse(CourseId courseId);
    */
    CourseDTO findCourseByUnitId(UnitId unitId);

    /*
    void deactivateCourse(CourseId courseId);
    */

    // NEW: Delete course with cascade
    void deleteCourse(CourseId courseId);

    EnrollmentId enrollStudent(EnrollStudentCommand command);
    void unenrollStudent(UnenrollStudentCommand command);

    UnitId addUnit(AddUnitCommand command);
    UnitId addUnitWithImage(AddUnitWithImageCommand command);
    void updateUnit(UpdateUnitCommand command);
    void updateUnitImage(UnitId unitId, String imageUrl);

    // NEW: Delete unit with cascade
    void deleteUnit(UnitId unitId);
    CourseUnitDTO getUnitById(UnitId unitId);

    // Queries
    CourseDTO getCourseById(CourseId courseId);
    CourseStatsDTO getCourseStatsAdmin();

    /*
    CourseDTO getCourseByCode(CourseCode code);
    */

    List<CourseDTO> getCoursesByTeacher(UserId teacherId);

    // NEW: Get courses for student
    List<CourseDTO> getCoursesByStudent(UserId studentId);

    List<StudentSearchResultDTO> searchStudentsForEnrollment(String searchQuery, CourseId courseId);

    List<CourseDTO> getActiveCourses();

    /*
    List<CourseDTO> getCoursesByGradeAndGroup(String grade, String group);
    */

    List<EnrollmentDTO> getCourseEnrollments(CourseId courseId);
    List<CourseUnitDTO> getCourseUnits(CourseId courseId);

    /*
    boolean isStudentEnrolled(CourseId courseId, UserId studentId);
    */

    /*
    boolean isCourseCodeAvailable(CourseCode code);
    */

    // NEW: Bulk enrollment operations
    List<EnrollmentId> bulkEnrollStudents(BulkEnrollCommand command);
    void bulkUnenrollStudents(BulkUnenrollCommand command);

    // NEW: Update comprehensive course information
    void updateCourseInformation(UpdateCourseInformationCommand command);
}