package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.PlagiarismCheck;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.PlagiarismCheckId;
import com.braintrust.education.domain.valueobjects.SubmissionId;

import java.util.List;
import java.util.Optional;

public interface PlagiarismCheckRepository {

    PlagiarismCheck save(PlagiarismCheck check);
    void saveAll(List<PlagiarismCheck> checks);
    Optional<PlagiarismCheck> findById(PlagiarismCheckId id);
    List<PlagiarismCheck> findBySourceSubmissionId(SubmissionId submissionId);
    List<PlagiarismCheck> findByAssignmentId(AssignmentId assignmentId);
    boolean existsBySourceAndCompared(SubmissionId sourceId, SubmissionId comparedId);
}
