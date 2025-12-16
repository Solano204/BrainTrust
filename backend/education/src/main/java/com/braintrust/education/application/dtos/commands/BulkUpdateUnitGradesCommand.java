package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record BulkUpdateUnitGradesCommand(
        String unitId,
        List<UpdateStudentGradeCommand> grades
) {}