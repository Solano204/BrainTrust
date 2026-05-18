package com.braintrust.education.application.helpers.validation;

import com.braintrust.education.domain.model.AssignmentTargetType;  // From model package
import com.braintrust.education.domain.model.SubmissionFormat;      // From model package
import org.springframework.stereotype.Component;

@Component
public class AssignmentValidator {

    public AssignmentTargetType validateTargetType(String targetType) {
        if (targetType == null || targetType.trim().isEmpty()) {
            return AssignmentTargetType.INDIVIDUAL;
        }

        try {
            return AssignmentTargetType.valueOf(targetType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid target type. Must be INDIVIDUAL or TEAM");
        }
    }

    public SubmissionFormat validateSubmissionFormat(String submissionFormat) {
        if (submissionFormat == null || submissionFormat.trim().isEmpty()) {
            return SubmissionFormat.DIGITAL; // Default
        }

        try {
            return SubmissionFormat.valueOf(submissionFormat.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid submission format. Must be DIGITAL or NOTEBOOK");
        }
    }
}