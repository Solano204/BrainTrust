package com.braintrust.education.domain.model;

public enum SubmissionStatus {
    DRAFT,          // Work in progress, not submitted yet
    SUBMITTED,      // Submitted on time
    LATE_SUBMITTED, // Submitted after due date (but assignment was still active)
    GRADED,         // Teacher has graded the submission
    RETURNED,       // Graded work returned to student
    REJECTED        // Submission rejected (inactive + past due)
}