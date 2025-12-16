package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record BulkUpdateCourseGradesCommand(
        String courseId,
        List<UpdateStudentGradeCommand> grades
) {}