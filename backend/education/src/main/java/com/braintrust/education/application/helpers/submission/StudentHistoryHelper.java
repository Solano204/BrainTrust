package com.braintrust.education.application.helpers.submission;

import com.braintrust.aidetectition.application.dtos.dtoResponse.AIDetectionResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.DetectedSegmentDTO;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.out.AssignmentRepository;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.application.ports.out.UnitRepository;
import com.braintrust.education.application.service.PlagiarismApplicationService;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class StudentHistoryHelper {

    private static final Logger log = LoggerFactory.getLogger(StudentHistoryHelper.class);

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final UnitRepository unitRepository;
    private final UserService userService;
    private final SubmissionAIAnalysisHelper aiAnalysisHelper;
    private final PlagiarismApplicationService plagiarismApplicationService;

    public StudentHistoryHelper(SubmissionRepository submissionRepository,
                                AssignmentRepository assignmentRepository,
                                CourseRepository courseRepository,
                                UnitRepository unitRepository,
                                UserService userService,
                                SubmissionAIAnalysisHelper aiAnalysisHelper,
                                PlagiarismApplicationService plagiarismApplicationService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.unitRepository = unitRepository;
        this.userService = userService;
        this.aiAnalysisHelper = aiAnalysisHelper;
        this.plagiarismApplicationService = plagiarismApplicationService;
    }

    @Transactional(readOnly = true)
    public StudentHistoryDTO buildStudentHistory(CourseId courseId, UserId studentId) {
        log.debug("Building history courseId={} studentId={}", courseId.getValue(), studentId.getValue());

        List<Submission> submissions = submissionRepository
                .findByCourseAndStudentOrderedByUnit(courseId, studentId);

        Course course = courseRepository.findById(courseId).orElse(null);
        String courseName = course != null ? course.getName() : courseId.getValue();

        String studentName = resolveStudentName(studentId);

        List<SubmissionHistoryItemDTO> items = submissions.stream()
                .map(sub -> buildHistoryItem(sub, courseId))
                .collect(Collectors.toList());

        return new StudentHistoryDTO(
                studentId.getValue(),
                studentName,
                courseId.getValue(),
                courseName,
                items
        );
    }

    private SubmissionHistoryItemDTO buildHistoryItem(Submission submission, CourseId courseId) {
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
        String assignmentName = assignment != null ? assignment.getTitle() : submission.getAssignmentId().getValue();
        String unitId = assignment != null && assignment.getUnitId() != null
                ? assignment.getUnitId().getValue() : null;

        String unitName = null;
        int unitOrder = 0;
        if (unitId != null) {
            CourseUnit unit = unitRepository.findById(UnitId.fromString(unitId)).orElse(null);
            if (unit != null) {
                unitName = unit.getName();
                unitOrder = unit.getNumUnity();
            }
        }

        AIDetectionResultDTO aiResult = aiAnalysisHelper.getAIAnalysisForSubmission(submission.getId());

        List<PlagiarismSummaryDTO> plagiarismSummaries = plagiarismApplicationService
                .getSummaryForSubmission(submission.getId().getValue());

        boolean isLate = assignment != null && assignment.getDueDate() != null
                && submission.getSubmittedAt() != null
                && submission.getSubmittedAt().isAfter(assignment.getDueDate());

        return new SubmissionHistoryItemDTO(
                submission.getId().getValue(),
                submission.getAssignmentId().getValue(),
                assignmentName,
                unitId,
                unitName,
                unitOrder,
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getStatus().name(),
                gradeDTO(submission),
                isLate,
                aiResult != null ? aiResult.aiPercentage() : null,
                aiResult != null && aiResult.likelyAI(),
                aiResult != null,
                mapAllSegments(aiResult),
                plagiarismSummaries
        );
    }

    private List<SimilarParagraphDTO> mapAllSegments(AIDetectionResultDTO aiResult) {
        if (aiResult == null || aiResult.detectedSegments() == null || aiResult.detectedSegments().isEmpty()) {
            return List.of();
        }
        List<DetectedSegmentDTO> segments = aiResult.detectedSegments();
        List<SimilarParagraphDTO> result = new ArrayList<>(segments.size());
        for (int i = 0; i < segments.size(); i++) {
            DetectedSegmentDTO seg = segments.get(i);
            String type = seg.segmentType() != null ? seg.segmentType()
                    : DetectedSegment.SegmentType.AI.name();
            result.add(new SimilarParagraphDTO(i, seg.text(), seg.reason(), seg.percentage(), type));
        }
        return result;
    }

    private GradeDTO gradeDTO(Submission submission) {
        if (submission.getGrade() == null) return null;
        Grade g = submission.getGrade();
        return new GradeDTO(
                g.getValue().toPlainString(),
                g.getMaxScore().toPlainString(),
                g.getPercentage().setScale(2, java.math.RoundingMode.HALF_UP).toPlainString()
        );
    }

    private String resolveStudentName(UserId studentId) {
        try {
            var info = userService.getMinimalUserInfo(studentId);
            if (info != null) {
                return info.fullName() != null ? info.fullName()
                        : ((info.firstName() != null ? info.firstName() : "")
                        + " " + (info.lastName() != null ? info.lastName() : "")).trim();
            }
        } catch (Exception e) {
            log.warn("Could not resolve student name for studentId={}: {}", studentId.getValue(), e.getMessage());
        }
        return studentId.getValue();
    }
}
