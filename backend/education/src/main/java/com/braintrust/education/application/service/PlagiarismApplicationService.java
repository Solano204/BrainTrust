package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.dtos.PlagiarismCheckDTO;
import com.braintrust.education.application.dtos.dtos.PlagiarismSummaryDTO;
import com.braintrust.education.application.dtos.dtos.SimilarParagraphDTO;
import com.braintrust.education.application.ports.out.PlagiarismCheckRepository;
import com.braintrust.education.domain.model.PlagiarismCheck;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.SimilarParagraph;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PlagiarismApplicationService {

    private static final Logger log = LoggerFactory.getLogger(PlagiarismApplicationService.class);

    private final PlagiarismCheckRepository plagiarismCheckRepository;
    private final UserService userService;

    public PlagiarismApplicationService(PlagiarismCheckRepository plagiarismCheckRepository,
                                        UserService userService) {
        this.plagiarismCheckRepository = plagiarismCheckRepository;
        this.userService = userService;
    }

    public List<PlagiarismCheckDTO> getPlagiarismResultsForSubmission(String submissionId) {
        log.debug("Fetching plagiarism results for submission={}", submissionId);
        List<PlagiarismCheck> checks = plagiarismCheckRepository
                .findBySourceSubmissionId(SubmissionId.fromString(submissionId));
        Map<String, String> names = resolveNames(checks);
        return checks.stream().map(c -> toDTO(c, names)).collect(Collectors.toList());
    }

    public List<PlagiarismCheckDTO> getPlagiarismResultsForAssignment(String assignmentId) {
        log.debug("Fetching plagiarism results for assignment={}", assignmentId);
        List<PlagiarismCheck> checks = plagiarismCheckRepository
                .findByAssignmentId(AssignmentId.fromString(assignmentId));
        Map<String, String> names = resolveNames(checks);
        return checks.stream().map(c -> toDTO(c, names)).collect(Collectors.toList());
    }

    public List<PlagiarismSummaryDTO> getSummaryForSubmission(String submissionId) {
        List<PlagiarismCheck> checks = plagiarismCheckRepository
                .findBySourceSubmissionId(SubmissionId.fromString(submissionId));
        List<PlagiarismCheck> completed = checks.stream()
                .filter(PlagiarismCheck::isCompleted)
                .collect(Collectors.toList());
        Map<String, String> names = resolveNames(completed);
        return completed.stream().map(c -> toSummaryDTO(c, names)).collect(Collectors.toList());
    }

    private Map<String, String> resolveNames(List<PlagiarismCheck> checks) {
        List<String> ids = checks.stream()
                .map(c -> c.getComparedStudentId().getValue())
                .distinct()
                .collect(Collectors.toList());
        if (ids.isEmpty()) return Map.of();
        try {
            return userService.getMinimalUserInfoByIds(ids).stream()
                    .collect(Collectors.toMap(
                            MinimalUserInfoDTO::userId,
                            info -> info.fullName() != null ? info.fullName()
                                    : ((info.firstName() != null ? info.firstName() : "")
                                    + " " + (info.lastName() != null ? info.lastName() : "")).trim()
                    ));
        } catch (Exception e) {
            log.warn("Could not resolve student names for plagiarism checks: {}", e.getMessage());
            return Map.of();
        }
    }

    private PlagiarismCheckDTO toDTO(PlagiarismCheck check, Map<String, String> names) {
        List<SimilarParagraphDTO> paragraphs = check.getSimilarParagraphs().stream()
                .map(p -> new SimilarParagraphDTO(
                        p.getParagraphIndex(),
                        p.getOriginalText(),
                        p.getMatchedText(),
                        p.getSimilarity() != null ? p.getSimilarity() + "%" : null
                ))
                .collect(Collectors.toList());

        String studentId = check.getComparedStudentId().getValue();
        return new PlagiarismCheckDTO(
                check.getId().getValue(),
                check.getSourceSubmissionId().getValue(),
                check.getComparedSubmissionId().getValue(),
                studentId,
                names.getOrDefault(studentId, studentId),
                check.getAssignmentId().getValue(),
                check.getOverallSimilarity() != null ? check.getOverallSimilarity() + "%" : null,
                paragraphs,
                check.getStatus().name(),
                check.getCheckedAt() != null ? check.getCheckedAt().toString() : null
        );
    }

    private PlagiarismSummaryDTO toSummaryDTO(PlagiarismCheck check, Map<String, String> names) {
        String studentId = check.getComparedStudentId().getValue();
        return new PlagiarismSummaryDTO(
                check.getId().getValue(),
                check.getComparedSubmissionId().getValue(),
                studentId,
                names.getOrDefault(studentId, studentId),
                check.getOverallSimilarity() != null ? check.getOverallSimilarity() + "%" : null,
                check.getSimilarParagraphs().size(),
                check.getStatus().name()
        );
    }
}
