package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.EnrollmentId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;

// 📍 education/application/ports/in/CourseService.java
public interface CourseService {

    // Commands
    CourseId createCourse(CreateCourseCommand command);
    CourseId createCourseWithImage(CreateCourseWithImageCommand command);
    void updateCourseDetails(UpdateCourseCommand command);
    void updateCourseImage(CourseId courseId, String imageUrl);
    void activateCourse(CourseId courseId);
    void deactivateCourse(CourseId courseId);

    EnrollmentId enrollStudent(EnrollStudentCommand command);
    void unenrollStudent(UnenrollStudentCommand command);

    UnitId addUnit(AddUnitCommand command);
    UnitId addUnitWithImage(AddUnitWithImageCommand command);
    void updateUnit(UpdateUnitCommand command);
    void updateUnitImage(UnitId unitId, String imageUrl);

    // Queries
    CourseDTO getCourseById(CourseId courseId);
    CourseDTO getCourseByCode(CourseCode code);
    List<CourseDTO> getCoursesByTeacher(UserId teacherId);
    List<CourseDTO> getActiveCourses();
    List<CourseDTO> getCoursesByGradeAndGroup(String grade, String group);
    List<EnrollmentDTO> getCourseEnrollments(CourseId courseId);
    List<CourseUnitDTO> getCourseUnits(CourseId courseId);
    boolean isStudentEnrolled(CourseId courseId, UserId studentId);
    boolean isCourseCodeAvailable(CourseCode code);
}