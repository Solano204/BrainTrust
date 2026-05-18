package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseStatsDTO;
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

    CourseId createCourse(CreateCourseCommand command);
    CourseId createCourseWithImage(CreateCourseWithImageCommand command);
    void updateCourseDetails(UpdateCourseCommand command);
    void updateCourseImage(CourseId courseId, String imageUrl);

    Page<CourseDTO> getAllCourses(Pageable pageable);
    Page<CourseDTO> getActiveCourses(Pageable pageable);
    Page<CourseDTO> getCoursesByTeacher(UserId teacherId, Pageable pageable);
    Page<CourseDTO> getCoursesByStudent(UserId studentId, Pageable pageable);

    CourseDTO findCourseByUnitId(UnitId unitId);

    void deleteCourse(CourseId courseId);

    EnrollmentId enrollStudent(EnrollStudentCommand command);
    void unenrollStudent(UnenrollStudentCommand command);

    UnitId addUnit(AddUnitCommand command);
    UnitId addUnitWithImage(AddUnitWithImageCommand command);
    void updateUnit(UpdateUnitCommand command);
    void updateUnitImage(UnitId unitId, String imageUrl);

    void deleteUnit(UnitId unitId);
    CourseUnitDTO getUnitById(UnitId unitId);

    CourseDTO getCourseById(CourseId courseId);
    CourseStatsDTO getCourseStatsAdmin();

    List<CourseDTO> getCoursesByTeacher(UserId teacherId);

    List<CourseDTO> getCoursesByStudent(UserId studentId);

    List<StudentSearchResultDTO> searchStudentsForEnrollment(String searchQuery, CourseId courseId);

    List<CourseDTO> getActiveCourses();

    List<EnrollmentDTO> getCourseEnrollments(CourseId courseId);
    List<CourseUnitDTO> getCourseUnits(CourseId courseId);

    List<EnrollmentId> bulkEnrollStudents(BulkEnrollCommand command);
    void bulkUnenrollStudents(BulkUnenrollCommand command);

    void updateCourseInformation(UpdateCourseInformationCommand command);
}