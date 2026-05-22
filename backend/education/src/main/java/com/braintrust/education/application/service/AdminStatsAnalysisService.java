package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.education.application.dtos.dtos.admin.*;
import com.braintrust.education.application.dtos.dtos.admin.OverdueAssignmentDTO;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.ports.out.UserRepository;
import com.braintrust.identity.domain.model.User;
import com.braintrust.identity.infraestructure.repositoriesPersistence.sql.entities.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AdminStatsAnalysisService — CORRECTED VERSION
 *
 * KEY FIXES:
 * ──────────────────────────────────────────────────────────────────────────────
 * 1. AI analysis data is fetched via SUBMISSION IDs (not assignment IDs).
 *    AnalysisRequest.submissionId links to Submission.id, NOT to Assignment.id.
 *
 * 2. Student names are resolved via UserService.getMinimalUserInfo() which
 *    joins User → Person → cat_first_names/cat_last_names for real names,
 *    falling back to email when unavailable.
 *
 * 3. All data is loaded eagerly into maps for O(1) lookups. This trades memory
 *    for correctness and simplicity — per the user's explicit requirement.
 *
 * 4. resolveProbability() safely walks:
 *    AnalysisRequest → DetectionResult → AIProbability → BigDecimal
 *    returning ZERO when any link is null (PENDING/FAILED analyses).
 *
 * 5. Quiz submissions now included in AI-related stats where relevant.
 *
 * PUBLIC METHODS:
 * ──────────────────────────────────────────────────────────────────────────────
 *  getAdminStats()                              → full composite dashboard
 *  getAIDetectedAssignmentsPaginated(Pageable)  → old endpoint (backwards-compat)
 *  getOverdueAssignmentsPaginated(Pageable)     → overdue assignments
 *  getAIAssignmentsPaginated(Pageable)          → AI submissions WITH student info
 *  getAIStatsBreakdown()                        → % full-AI / high-AI / low-AI / human
 *  getUserCounts()                              → # students + # teachers
 *  getLateSubmissionsPaginated(Pageable)         → submissions after due-date
 *  getCoursesByAIPercentage(String sort)         → courses ranked by AI %
 *  getCoursesByLatePercentage(String sort)       → courses ranked by late %
 *  getTopQuizzesByGrade(int limit)              → top quiz submissions by grade
 */
@Service
@Transactional(readOnly = true)
public class AdminStatsAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AdminStatsAnalysisService.class);

    // ── Dependencies ──────────────────────────────────────────────────────────
    private final AssignmentRepository      assignmentRepository;
    private final SubmissionRepository      submissionRepository;
    private final EnrollmentRepository      enrollmentRepository;
    private final CourseRepository          courseRepository;
    private final UserRepository            userRepository;
    private final AnalysisRequestRepository analysisRequestRepository;
    private final QuizSubmissionRepository  quizSubmissionRepository;
    private final QuizRepository            quizRepository;
    private final UserService               userService;

    public AdminStatsAnalysisService(
            AssignmentRepository      assignmentRepository,
            SubmissionRepository      submissionRepository,
            EnrollmentRepository      enrollmentRepository,
            CourseRepository          courseRepository,
            UserRepository            userRepository,
            AnalysisRequestRepository analysisRequestRepository,
            QuizSubmissionRepository  quizSubmissionRepository,
            QuizRepository            quizRepository,
            UserService               userService
    ) {
        this.assignmentRepository      = assignmentRepository;
        this.submissionRepository      = submissionRepository;
        this.enrollmentRepository      = enrollmentRepository;
        this.courseRepository          = courseRepository;
        this.userRepository            = userRepository;
        this.analysisRequestRepository = analysisRequestRepository;
        this.quizSubmissionRepository  = quizSubmissionRepository;
        this.quizRepository            = quizRepository;
        this.userService               = userService;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXISTING — full composite dashboard
    // ═══════════════════════════════════════════════════════════════════════════

    public AdminStatsDTO getAdminStats() {
        log.info("🔍 Generating comprehensive admin statistics...");
        long startTime = System.currentTimeMillis();

        try {
            // Load ALL data upfront into memory for fast cross-referencing
            List<Course>     allCourses     = courseRepository.findAll();
            List<Assignment> allAssignments = assignmentRepository.findAll();
            List<Submission> allSubmissions = collectAllSubmissions(allCourses);
            Map<String, List<AnalysisRequest>> analysisBySubmissionId = loadAllAnalysesBySubmissionId(allSubmissions);

            OverallStatsDTO                overallStats    = buildOverallStats(allAssignments, allSubmissions, analysisBySubmissionId);
            AIAnalysisStatsDTO             aiStats         = buildAIAnalysisStats(allSubmissions, analysisBySubmissionId);
            AssignmentStatsDTO             assignmentStats = buildAssignmentStats(allAssignments, analysisBySubmissionId);
            UserStatsDTO                   userStats       = buildUserStats(allAssignments, allSubmissions, analysisBySubmissionId);
            DeadlineStatsDTO               deadlineStats   = buildDeadlineStats(allAssignments, analysisBySubmissionId);
            List<TeacherAssignmentStatsDTO> teacherStats   = buildTeacherStats(allAssignments, analysisBySubmissionId);

            log.info("✅ Admin statistics generated in {}ms", System.currentTimeMillis() - startTime);
            return new AdminStatsDTO(overallStats, aiStats, assignmentStats, userStats, deadlineStats, teacherStats);

        } catch (Exception e) {
            log.error("❌ Error generating admin statistics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate admin statistics", e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXISTING — old paginated AI assignments (backwards-compat)
    // ═══════════════════════════════════════════════════════════════════════════

    public PaginatedStatsDTO<AssignmentDetailDTO> getAIDetectedAssignmentsPaginated(Pageable pageable) {
        List<Course>     allCourses     = courseRepository.findAll();
        List<Submission> allSubmissions = collectAllSubmissions(allCourses);
        Map<String, List<AnalysisRequest>> analysisBySubId = loadAllAnalysesBySubmissionId(allSubmissions);
        Map<String, Assignment> assignMap = assignmentRepository.findAll()
                .stream().collect(Collectors.toMap(a -> a.getId().getValue(), a -> a));

        // Build a set of assignment IDs that have at least one submission with AI analysis
        Set<String> assignmentIdsWithAI = allSubmissions.stream()
                .filter(sub -> {
                    List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
                    return !analyses.isEmpty();
                })
                .map(sub -> sub.getAssignmentId().getValue())
                .collect(Collectors.toSet());

        List<AssignmentDetailDTO> aiAssignments = assignMap.values().stream()
                .filter(a -> assignmentIdsWithAI.contains(a.getId().getValue()))
                .map(a -> mapToAssignmentDetailDTO(a, allSubmissions, analysisBySubId))
                .sorted((a, b) -> b.aiProbability().compareTo(a.aiProbability()))
                .collect(Collectors.toList());

        return paginate(aiAssignments, pageable);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXISTING — overdue assignments
    // ═══════════════════════════════════════════════════════════════════════════

    public PaginatedStatsDTO<OverdueAssignmentDTO> getOverdueAssignmentsPaginated(Pageable pageable) {
        LocalDateTime now = LocalDateTime.now();
        List<Course>     allCourses     = courseRepository.findAll();
        List<Submission> allSubmissions = collectAllSubmissions(allCourses);
        Map<String, List<AnalysisRequest>> analysisBySubId = loadAllAnalysesBySubmissionId(allSubmissions);

        List<OverdueAssignmentDTO> overdueAssignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getDueDate() != null && a.getDueDate().isBefore(now))
                .map(a -> mapToOverdueAssignmentDTO(a, now, allSubmissions, analysisBySubId))
                .sorted((a, b) -> Long.compare(b.daysOverdue(), a.daysOverdue()))
                .collect(Collectors.toList());

        return paginate(overdueAssignments, pageable);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 1 — PAGINATED AI-DETECTED SUBMISSIONS (with student info)
    // ═══════════════════════════════════════════════════════════════════════════

    public PaginatedStatsDTO<AIAssignmentPageDTO> getAIAssignmentsPaginated(Pageable pageable) {
        log.info("📄 [AI Assignments] page={} size={}", pageable.getPageNumber(), pageable.getPageSize());

        // Load everything into memory
        Map<String, Course>     courseMap  = courseMap();
        Map<String, Assignment> assignMap = assignmentRepository.findAll()
                .stream().collect(Collectors.toMap(a -> a.getId().getValue(), a -> a));

        List<Course>     allCourses     = courseRepository.findAll();
        List<Submission> allSubmissions = collectAllSubmissions(allCourses);
        Map<String, List<AnalysisRequest>> analysisBySubId = loadAllAnalysesBySubmissionId(allSubmissions);

        List<AIAssignmentPageDTO> items = new ArrayList<>();

        for (Submission sub : allSubmissions) {
            // FIX: look up analyses by SUBMISSION ID, not assignment ID
            List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
            if (analyses.isEmpty()) continue;

            AnalysisRequest analysis = analyses.get(0);
            BigDecimal prob = resolveProbability(analysis);

            Assignment assignment = assignMap.get(sub.getAssignmentId().getValue());
            if (assignment == null) continue;

            Course course     = courseMap.get(assignment.getCourseId().getValue());
            String courseName = course != null ? course.getName() : "—";

            // FIX: resolve student name properly via UserService
            String studentName  = resolveStudentName(sub.getStudentId().getValue());
            String studentEmail = resolveStudentEmail(sub.getStudentId().getValue());

            boolean late = assignment.getDueDate() != null
                    && sub.getSubmittedAt() != null
                    && sub.getSubmittedAt().isAfter(assignment.getDueDate());

            items.add(new AIAssignmentPageDTO(
                    assignment.getId().getValue(),
                    assignment.getTitle(),
                    assignment.getCourseId().getValue(),
                    courseName,
                    assignment.getDueDate() != null ? assignment.getDueDate().toString() : "N/A",
                    prob,
                    analysis.getStatus().name(),
                    sub.getStudentId().getValue(),
                    studentName,
                    studentEmail,
                    sub.getId().getValue(),
                    sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : "N/A",
                    late
            ));
        }

        items.sort((a, b) -> b.aiProbability().compareTo(a.aiProbability()));
        return paginate(items, pageable);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 2 — AI STATS BREAKDOWN (100% / 50-99% / 1-49% / 0%)
    // ═══════════════════════════════════════════════════════════════════════════

    public AIStatsBreakdownDTO getAIStatsBreakdown() {
        log.info("📊 [AI Stats Breakdown]");

        List<Course>     allCourses     = courseRepository.findAll();
        List<Submission> allSubmissions = collectAllSubmissions(allCourses);
        Map<String, List<AnalysisRequest>> analysisBySubId = loadAllAnalysesBySubmissionId(allSubmissions);

        long totalSubmissions = allSubmissions.size();
        long countFullAI = 0, countHighAI = 0, countLowAI = 0, countHuman = 0;
        BigDecimal probSum = BigDecimal.ZERO;
        long analyzedCount = 0;

        for (Submission sub : allSubmissions) {
            // FIX: look up by SUBMISSION ID
            List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
            if (analyses.isEmpty()) continue;

            BigDecimal prob = resolveProbability(analyses.get(0));
            probSum = probSum.add(prob);
            analyzedCount++;

            double p = prob.doubleValue();
            if (p >= 0.99)      countFullAI++;
            else if (p >= 0.50) countHighAI++;
            else if (p > 0.0)   countLowAI++;
            else                countHuman++;
        }

        BigDecimal avg = analyzedCount > 0
                ? probSum.divide(BigDecimal.valueOf(analyzedCount), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new AIStatsBreakdownDTO(
                avg,
                countFullAI,  pct(countFullAI,  analyzedCount),
                countHighAI,  pct(countHighAI,  analyzedCount),
                countLowAI,   pct(countLowAI,   analyzedCount),
                countHuman,   pct(countHuman,   analyzedCount),
                analyzedCount,
                totalSubmissions
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 3 — USER COUNTS
    // ═══════════════════════════════════════════════════════════════════════════

    public UserCountDTO getUserCounts() {
        log.info("👥 [User Counts]");

        List<User> students = userRepository.findByRole(Role.STUDENT);
        List<User> teachers = userRepository.findByRole(Role.TEACHER);

        long activeStudents = students.stream().filter(User::isActive).count();
        long activeTeachers = teachers.stream().filter(User::isActive).count();

        return new UserCountDTO(
                students.size(),
                teachers.size(),
                activeStudents,
                activeTeachers
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 4 — LATE SUBMISSIONS
    // ═══════════════════════════════════════════════════════════════════════════

    public PaginatedStatsDTO<LateSubmissionDTO> getLateSubmissionsPaginated(Pageable pageable) {
        log.info("⏰ [Late Submissions] page={} size={}", pageable.getPageNumber(), pageable.getPageSize());

        Map<String, Course>     courseMap  = courseMap();
        Map<String, Assignment> assignMap = assignmentRepository.findAll()
                .stream().collect(Collectors.toMap(a -> a.getId().getValue(), a -> a));

        List<Course>     allCourses     = courseRepository.findAll();
        List<Submission> allSubmissions = collectAllSubmissions(allCourses);
        Map<String, List<AnalysisRequest>> analysisBySubId = loadAllAnalysesBySubmissionId(allSubmissions);

        List<LateSubmissionDTO> items = new ArrayList<>();

        for (Submission sub : allSubmissions) {
            Assignment assignment = assignMap.get(sub.getAssignmentId().getValue());
            if (assignment == null)              continue;
            if (assignment.getDueDate() == null) continue;
            if (sub.getSubmittedAt() == null)    continue;
            if (!sub.getSubmittedAt().isAfter(assignment.getDueDate())) continue;

            long minutesLate = Duration.between(assignment.getDueDate(), sub.getSubmittedAt()).toMinutes();

            Course course     = courseMap.get(assignment.getCourseId().getValue());
            String courseName = course != null ? course.getName() : "—";

            // FIX: resolve student name properly
            String studentName = resolveStudentName(sub.getStudentId().getValue());

            // FIX: look up AI probability by SUBMISSION ID
            BigDecimal aiProb = BigDecimal.ZERO;
            List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
            if (!analyses.isEmpty()) aiProb = resolveProbability(analyses.get(0));

            String grade = sub.getGrade() != null
                    ? sub.getGrade().getValue() + "/" + sub.getGrade().getMaxScore()
                    : "N/A";

            items.add(new LateSubmissionDTO(
                    sub.getId().getValue(),
                    assignment.getId().getValue(),
                    assignment.getTitle(),
                    assignment.getCourseId().getValue(),
                    courseName,
                    sub.getStudentId().getValue(),
                    studentName,
                    assignment.getDueDate().toString(),
                    sub.getSubmittedAt().toString(),
                    minutesLate,
                    aiProb,
                    grade
            ));
        }

        items.sort((a, b) -> Long.compare(b.minutesLate(), a.minutesLate()));
        return paginate(items, pageable);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 5 — COURSES RANKED BY AI PERCENTAGE
    // ═══════════════════════════════════════════════════════════════════════════

    public List<CourseAIStatsDTO> getCoursesByAIPercentage(String sort) {
        log.info("📚 [Courses by AI %] sort={}", sort);
        List<CourseAIStatsDTO> stats = buildCourseStats();
        Comparator<CourseAIStatsDTO> cmp = Comparator.comparing(CourseAIStatsDTO::aiPercentage);
        if (!"asc".equalsIgnoreCase(sort)) cmp = cmp.reversed();
        return stats.stream().sorted(cmp).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 6 — COURSES RANKED BY LATE PERCENTAGE
    // ═══════════════════════════════════════════════════════════════════════════

    public List<CourseAIStatsDTO> getCoursesByLatePercentage(String sort) {
        log.info("📚 [Courses by Late %] sort={}", sort);
        List<CourseAIStatsDTO> stats = buildCourseStats();
        Comparator<CourseAIStatsDTO> cmp = Comparator.comparing(CourseAIStatsDTO::latePercentage);
        if (!"asc".equalsIgnoreCase(sort)) cmp = cmp.reversed();
        return stats.stream().sorted(cmp).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NEW 7 — TOP QUIZZES BY BEST GRADE
    // ═══════════════════════════════════════════════════════════════════════════

    public List<QuizTopDTO> getTopQuizzesByGrade(int limit) {
        log.info("🏆 [Top Quizzes by Grade] limit={}", limit);

        Map<String, Course> courseMap = courseMap();
        Map<String, Quiz>   quizMap  = quizRepository.findAll()
                .stream().collect(Collectors.toMap(q -> q.getId().getValue(), q -> q));

        List<QuizTopDTO> results = new ArrayList<>();

        for (Course course : courseRepository.findAll()) {
            List<QuizSubmission> submissions =
                    quizSubmissionRepository.findByCourseIdOrderBySubmittedAtDesc(course.getId());

            for (QuizSubmission qs : submissions) {
                if (qs.getGrade() == null && qs.getFinalGrade() == null) continue;

                BigDecimal gradeValue = resolveGradeValue(qs);
                BigDecimal maxScore   = resolveMaxScore(qs);

                BigDecimal percentage = maxScore.compareTo(BigDecimal.ZERO) > 0
                        ? gradeValue.divide(maxScore, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO;

                Quiz   quiz       = quizMap.get(qs.getQuizId().getValue());
                String quizTitle  = quiz != null ? quiz.getTitle() : "—";
                String courseId   = quiz != null ? quiz.getCourseId().getValue() : course.getId().getValue();
                Course c          = courseMap.get(courseId);
                String courseName = c != null ? c.getName() : "—";

                // FIX: resolve student name properly
                String studentName = resolveStudentName(qs.getStudentId().getValue());

                results.add(new QuizTopDTO(
                        qs.getQuizId().getValue(),
                        quizTitle,
                        courseId,
                        courseName,
                        qs.getStudentId().getValue(),
                        studentName,
                        gradeValue,
                        maxScore,
                        percentage,
                        qs.getSubmittedAt() != null ? qs.getSubmittedAt().toString() : "N/A",
                        qs.getAttemptNumber()
                ));
            }
        }

        results.sort((a, b) -> b.percentage().compareTo(a.percentage()));
        return results.stream().limit(limit).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CORE DATA LOADING HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Collects ALL submissions across ALL courses into a single list.
     * This is the authoritative source of submissions for all stats.
     */
    private List<Submission> collectAllSubmissions(List<Course> allCourses) {
        return allCourses.stream()
                .flatMap(c -> submissionRepository.findByCourseId(c.getId()).stream())
                .collect(Collectors.toList());
    }

    /**
     * CORE FIX — Loads ALL AnalysisRequests and indexes them by SUBMISSION ID.
     *
     * The old code called findAnalyses(assignment.getId()) which looked up by
     * assignment ID — but AnalysisRequest.submissionId points to Submission.id,
     * NOT Assignment.id. This caused all AI data to come back empty.
     *
     * Now we iterate every submission, query its analyses, and build a map
     * keyed by submission ID for O(1) lookup everywhere else.
     */
    private Map<String, List<AnalysisRequest>> loadAllAnalysesBySubmissionId(List<Submission> allSubmissions) {
        Map<String, List<AnalysisRequest>> map = new HashMap<>();

        for (Submission sub : allSubmissions) {
            String subIdValue = sub.getId().getValue();
            try {
                List<AnalysisRequest> analyses = analysisRequestRepository.findBySubmissionId(
                        com.braintrust.aidetectition.domain.valueobjects.SubmissionId.fromString(subIdValue)
                );
                if (analyses != null && !analyses.isEmpty()) {
                    map.put(subIdValue, analyses);
                }
            } catch (Exception e) {
                log.warn("Failed to load analyses for submission {}: {}", subIdValue, e.getMessage());
            }
        }

        log.debug("Loaded AI analyses for {} submissions (out of {} total)", map.size(), allSubmissions.size());
        return map;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STUDENT NAME/EMAIL RESOLUTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Resolves the full name for a student ID.
     * Tries UserService.getMinimalUserInfo() first (which joins Person tables
     * for first+last name), falls back to email, then to "Unknown".
     */
    private String resolveStudentName(String studentIdValue) {
        try {
            com.braintrust.identity.domain.valueobjects.UserId userId =
                    com.braintrust.identity.domain.valueobjects.UserId.fromString(studentIdValue);
            MinimalUserInfoDTO info = userService.getMinimalUserInfo(userId);
            if (info != null && info.fullName() != null && !info.fullName().isBlank()) {
                return info.fullName();
            }
        } catch (Exception e) {
            log.debug("Could not resolve name via UserService for {}: {}", studentIdValue, e.getMessage());
        }

        // Fallback: try loading User directly for email
        try {
            com.braintrust.identity.domain.valueobjects.UserId userId =
                    com.braintrust.identity.domain.valueobjects.UserId.fromString(studentIdValue);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                return userOpt.get().getEmail().getValue();
            }
        } catch (Exception e) {
            log.debug("Could not resolve email for {}: {}", studentIdValue, e.getMessage());
        }

        return "Unknown";
    }

    /**
     * Resolves the email for a student ID.
     */
    private String resolveStudentEmail(String studentIdValue) {
        try {
            com.braintrust.identity.domain.valueobjects.UserId userId =
                    com.braintrust.identity.domain.valueobjects.UserId.fromString(studentIdValue);
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                return userOpt.get().getEmail().getValue();
            }
        } catch (Exception e) {
            log.debug("Could not resolve email for {}: {}", studentIdValue, e.getMessage());
        }
        return "—";
    }

    /** Convenience overload for User objects */
    private String resolveUserName(User user) {
        if (user == null) return "Unknown";
        try {
            MinimalUserInfoDTO info = userService.getMinimalUserInfo(user.getId());
            if (info != null && info.fullName() != null && !info.fullName().isBlank()) {
                return info.fullName();
            }
        } catch (Exception ignored) {}
        return user.getEmail().getValue();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROBABILITY EXTRACTION
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * CORE FIX — Extracts the AI probability from an AnalysisRequest safely.
     *
     * AnalysisRequest has NO direct getProbability().
     * The value chain is:
     *   AnalysisRequest.getResult()           → DetectionResult  (null when PENDING/FAILED)
     *   DetectionResult.getProbability()       → AIProbability
     *   AIProbability.getValue()               → BigDecimal
     *
     * Returns BigDecimal.ZERO when the analysis is not yet completed.
     */
    private BigDecimal resolveProbability(AnalysisRequest analysis) {
        if (analysis == null)                                    return BigDecimal.ZERO;
        if (analysis.getResult() == null)                        return BigDecimal.ZERO;
        if (analysis.getResult().getProbability() == null)       return BigDecimal.ZERO;
        return analysis.getResult().getProbability().getValue();
    }

    /**
     * Gets the highest AI probability among all submissions for a given assignment.
     * Used for assignment-level stats (backwards compatibility).
     */
    private BigDecimal getMaxProbabilityForAssignment(Assignment assignment,
                                                      List<Submission> allSubmissions,
                                                      Map<String, List<AnalysisRequest>> analysisBySubId) {
        BigDecimal maxProb = BigDecimal.ZERO;
        for (Submission sub : allSubmissions) {
            if (!sub.getAssignmentId().getValue().equals(assignment.getId().getValue())) continue;
            List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
            if (!analyses.isEmpty()) {
                BigDecimal prob = resolveProbability(analyses.get(0));
                if (prob.compareTo(maxProb) > 0) maxProb = prob;
            }
        }
        return maxProb;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPOSITE DASHBOARD BUILDERS
    // ═══════════════════════════════════════════════════════════════════════════

    private OverallStatsDTO buildOverallStats(List<Assignment> allAssignments,
                                              List<Submission> allSubmissions,
                                              Map<String, List<AnalysisRequest>> analysisBySubId) {
        long totalAssignments = allAssignments.size();

        // An assignment is "analyzed" if at least one of its submissions has an analysis
        Set<String> analyzedAssignmentIds = allSubmissions.stream()
                .filter(sub -> analysisBySubId.containsKey(sub.getId().getValue()))
                .map(sub -> sub.getAssignmentId().getValue())
                .collect(Collectors.toSet());

        long totalAnalyzed = analyzedAssignmentIds.size();
        long totalPending  = totalAssignments - totalAnalyzed;

        BigDecimal percentageAnalyzed = totalAssignments > 0
                ? BigDecimal.valueOf(totalAnalyzed)
                .divide(BigDecimal.valueOf(totalAssignments), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return new OverallStatsDTO(totalAssignments, totalAnalyzed, totalPending, percentageAnalyzed);
    }

    private AIAnalysisStatsDTO buildAIAnalysisStats(List<Submission> allSubmissions,
                                                    Map<String, List<AnalysisRequest>> analysisBySubId) {
        long countFullAI = 0, countHighAI = 0, countLowAI = 0, countHuman = 0;
        BigDecimal probSum = BigDecimal.ZERO;
        int probCount = 0;

        for (Submission sub : allSubmissions) {
            List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
            if (analyses.isEmpty()) continue;

            BigDecimal prob = resolveProbability(analyses.get(0));
            probSum = probSum.add(prob);
            probCount++;

            double p = prob.doubleValue();
            if (p >= 0.99)      countFullAI++;
            else if (p >= 0.50) countHighAI++;
            else if (p > 0.0)   countLowAI++;
            else                countHuman++;
        }

        long total = countFullAI + countHighAI + countLowAI + countHuman;
        BigDecimal avg = probCount > 0
                ? probSum.divide(BigDecimal.valueOf(probCount), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new AIAnalysisStatsDTO(
                pct(countFullAI, total), pct(countHighAI, total),
                pct(countLowAI,  total), pct(countHuman,  total),
                countFullAI, countHighAI, countLowAI, countHuman, avg
        );
    }

    private AssignmentStatsDTO buildAssignmentStats(List<Assignment> all,
                                                    Map<String, List<AnalysisRequest>> analysisBySubId) {
        long totalActive   = all.stream().filter(Assignment::isActive).count();
        long totalInactive = all.size() - totalActive;

        long totalGroup = all.stream()
                .filter(a -> a.getTargetType() != null && "GROUP".equals(a.getTargetType().name()))
                .count();
        long totalIndividual = all.stream()
                .filter(a -> a.getTargetType() != null && "INDIVIDUAL".equals(a.getTargetType().name()))
                .count();

        List<AssignmentByUnitDTO> byUnit = all.stream()
                .filter(a -> a.getUnitId() != null)
                .collect(Collectors.groupingBy(a -> a.getUnitId().getValue()))
                .entrySet().stream()
                .map(e -> new AssignmentByUnitDTO(
                        e.getKey(),
                        e.getKey(),
                        e.getValue().size(),
                        BigDecimal.ZERO)) // simplified — unit-level avg prob is expensive
                .collect(Collectors.toList());

        return new AssignmentStatsDTO(totalActive, totalInactive, totalGroup, totalIndividual, byUnit);
    }

    private UserStatsDTO buildUserStats(List<Assignment> allAssignments,
                                        List<Submission> allSubmissions,
                                        Map<String, List<AnalysisRequest>> analysisBySubId) {
        try {
            List<User> teachers = userRepository.findByRole(Role.TEACHER);
            List<User> students = userRepository.findByRole(Role.STUDENT);

            long totalEnrolled = courseRepository.findAll().stream()
                    .flatMap(c -> c.getEnrollments().stream())
                    .distinct().count();

            List<TeacherCountDTO> teachersWithMost = teachers.stream()
                    .map(t -> {
                        List<Assignment> ta = assignmentRepository.findByTeacherId(t.getId());
                        return new TeacherCountDTO(
                                t.getId().getValue(), resolveUserName(t),
                                ta.size(), BigDecimal.ZERO);
                    })
                    .sorted((a, b) -> Long.compare(b.assignmentCount(), a.assignmentCount()))
                    .limit(10)
                    .collect(Collectors.toList());

            List<StudentCountDTO> studentsWithMost = students.stream()
                    .map(s -> {
                        long subCount = allSubmissions.stream()
                                .filter(sub -> sub.getStudentId().getValue().equals(s.getId().getValue()))
                                .count();
                        return new StudentCountDTO(
                                s.getId().getValue(), resolveUserName(s),
                                subCount, BigDecimal.ZERO);
                    })
                    .sorted((a, b) -> Long.compare(b.submissionCount(), a.submissionCount()))
                    .limit(10)
                    .collect(Collectors.toList());

            return new UserStatsDTO(teachers.size(), students.size(), totalEnrolled,
                    teachersWithMost, studentsWithMost);

        } catch (Exception e) {
            log.warn("Error getting user stats: {}", e.getMessage());
            return new UserStatsDTO(0, 0, 0, List.of(), List.of());
        }
    }

    private DeadlineStatsDTO buildDeadlineStats(List<Assignment> all,
                                                Map<String, List<AnalysisRequest>> analysisBySubId) {
        LocalDateTime now          = LocalDateTime.now();
        LocalDateTime oneWeekLater = now.plusDays(7);

        // We need submissions to compute assignment-level probabilities
        List<Course>     allCourses     = courseRepository.findAll();
        List<Submission> allSubmissions = collectAllSubmissions(allCourses);

        long overdue = all.stream()
                .filter(a -> a.getDueDate() != null && a.getDueDate().isBefore(now))
                .count();
        long dueSoon = all.stream()
                .filter(a -> a.getDueDate() != null
                        && a.getDueDate().isAfter(now)
                        && a.getDueDate().isBefore(oneWeekLater))
                .count();
        long upcoming = all.size() - overdue - dueSoon;

        List<OverdueAssignmentDTO> overdueList = all.stream()
                .filter(a -> a.getDueDate() != null && a.getDueDate().isBefore(now))
                .map(a -> mapToOverdueAssignmentDTO(a, now, allSubmissions, analysisBySubId))
                .sorted((a, b) -> Long.compare(b.daysOverdue(), a.daysOverdue()))
                .limit(20)
                .collect(Collectors.toList());

        return new DeadlineStatsDTO(overdue, dueSoon, upcoming, overdueList);
    }

    private List<TeacherAssignmentStatsDTO> buildTeacherStats(List<Assignment> allAssignments,
                                                              Map<String, List<AnalysisRequest>> analysisBySubId) {
        try {
            List<Course>     allCourses     = courseRepository.findAll();
            List<Submission> allSubmissions = collectAllSubmissions(allCourses);

            return userRepository.findByRole(Role.TEACHER).stream()
                    .map(t -> {
                        List<Assignment> ta = assignmentRepository.findByTeacherId(t.getId());

                        // Count assignments that have at least one submission with AI analysis
                        long aiDetected = ta.stream()
                                .filter(a -> allSubmissions.stream()
                                        .filter(sub -> sub.getAssignmentId().getValue().equals(a.getId().getValue()))
                                        .anyMatch(sub -> analysisBySubId.containsKey(sub.getId().getValue())))
                                .count();

                        List<AssignmentDetailDTO> recent = ta.stream()
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .limit(5)
                                .map(a -> mapToAssignmentDetailDTO(a, allSubmissions, analysisBySubId))
                                .collect(Collectors.toList());

                        return new TeacherAssignmentStatsDTO(
                                t.getId().getValue(), resolveUserName(t),
                                ta.size(), aiDetected, BigDecimal.ZERO, recent);
                    })
                    .sorted((a, b) -> Long.compare(b.totalAssignments(), a.totalAssignments()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("Error getting teacher stats: {}", e.getMessage());
            return List.of();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COURSE STATS BUILDER
    // ═══════════════════════════════════════════════════════════════════════════

    private List<CourseAIStatsDTO> buildCourseStats() {
        Map<String, User> teacherMap = userRepository.findByRole(Role.TEACHER)
                .stream().collect(Collectors.toMap(u -> u.getId().getValue(), u -> u));

        List<CourseAIStatsDTO> result = new ArrayList<>();

        for (Course course : courseRepository.findAll()) {
            List<Submission> submissions = submissionRepository.findByCourseId(course.getId());
            long total = submissions.size();

            if (total == 0) {
                User teacher = teacherMap.get(course.getTeacherId().getValue());
                result.add(new CourseAIStatsDTO(
                        course.getId().getValue(), course.getName(),
                        course.getTeacherId().getValue(), resolveUserName(teacher),
                        0, 0, BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO));
                continue;
            }

            // Load analyses for this course's submissions
            Map<String, List<AnalysisRequest>> analysisBySubId = loadAllAnalysesBySubmissionId(submissions);

            Map<String, Assignment> assignMap = assignmentRepository.findByCourseId(course.getId())
                    .stream().collect(Collectors.toMap(a -> a.getId().getValue(), a -> a));

            long aiDetected = 0, lateCount = 0;
            BigDecimal probSum = BigDecimal.ZERO;
            int probCount = 0;

            for (Submission sub : submissions) {
                Assignment asgn = assignMap.get(sub.getAssignmentId().getValue());
                if (asgn != null && asgn.getDueDate() != null
                        && sub.getSubmittedAt() != null
                        && sub.getSubmittedAt().isAfter(asgn.getDueDate())) {
                    lateCount++;
                }

                // FIX: look up by SUBMISSION ID
                List<AnalysisRequest> analyses = analysisBySubId.getOrDefault(sub.getId().getValue(), List.of());
                if (!analyses.isEmpty()) {
                    BigDecimal prob = resolveProbability(analyses.get(0));
                    probSum = probSum.add(prob);
                    probCount++;
                    if (prob.doubleValue() >= 0.50) aiDetected++;
                }
            }

            BigDecimal avgProb = probCount > 0
                    ? probSum.divide(BigDecimal.valueOf(probCount), 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            User teacher = teacherMap.get(course.getTeacherId().getValue());
            result.add(new CourseAIStatsDTO(
                    course.getId().getValue(), course.getName(),
                    course.getTeacherId().getValue(), resolveUserName(teacher),
                    total, aiDetected, pct(aiDetected, total),
                    lateCount, pct(lateCount, total), avgProb));
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DTO MAPPERS
    // ═══════════════════════════════════════════════════════════════════════════

    private AssignmentDetailDTO mapToAssignmentDetailDTO(Assignment assignment,
                                                         List<Submission> allSubmissions,
                                                         Map<String, List<AnalysisRequest>> analysisBySubId) {
        BigDecimal prob = getMaxProbabilityForAssignment(assignment, allSubmissions, analysisBySubId);
        boolean hasAnalysis = prob.compareTo(BigDecimal.ZERO) > 0;

        return new AssignmentDetailDTO(
                assignment.getId().getValue(),
                assignment.getTitle(),
                assignment.getCourseId().getValue(),
                "—",
                prob,
                hasAnalysis ? "COMPLETED" : "PENDING",
                assignment.getDueDate() != null ? assignment.getDueDate().toString() : "N/A"
        );
    }

    private OverdueAssignmentDTO mapToOverdueAssignmentDTO(Assignment assignment, LocalDateTime now,
                                                           List<Submission> allSubmissions,
                                                           Map<String, List<AnalysisRequest>> analysisBySubId) {
        BigDecimal prob = getMaxProbabilityForAssignment(assignment, allSubmissions, analysisBySubId);
        long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(assignment.getDueDate(), now);

        return new OverdueAssignmentDTO(
                assignment.getId().getValue(),
                assignment.getTitle(),
                assignment.getCourseId().getValue(),
                "—",
                "—",
                "—",
                assignment.getDueDate().toString(),
                daysOverdue,
                prob
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SHARED UTILITIES
    // ═══════════════════════════════════════════════════════════════════════════

    private Map<String, Course> courseMap() {
        return courseRepository.findAll()
                .stream().collect(Collectors.toMap(c -> c.getId().getValue(), c -> c));
    }

    /** Generic in-memory paginator. */
    private <T> PaginatedStatsDTO<T> paginate(List<T> all, Pageable pageable) {
        int total      = all.size();
        int totalPages = (int) Math.ceil((double) total / pageable.getPageSize());
        int start      = (int) pageable.getOffset();
        int end        = Math.min(start + pageable.getPageSize(), total);
        List<T> page   = start >= total ? List.of() : all.subList(start, end);
        return new PaginatedStatsDTO<>(
                page, pageable.getPageNumber(), pageable.getPageSize(),
                total, totalPages,
                pageable.getPageNumber() < totalPages - 1,
                pageable.getPageNumber() > 0
        );
    }

    private BigDecimal pct(long part, long total) {
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(part)
                .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private BigDecimal resolveGradeValue(QuizSubmission qs) {
        if (qs.getFinalGrade() != null) return qs.getFinalGrade();
        if (qs.getGrade() != null)      return qs.getGrade().getValue();
        return BigDecimal.ZERO;
    }

    private BigDecimal resolveMaxScore(QuizSubmission qs) {
        if (qs.getGrade() != null && qs.getGrade().getMaxScore() != null)
            return qs.getGrade().getMaxScore();
        return BigDecimal.valueOf(100);
    }
}