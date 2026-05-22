package com.braintrust.containerapp.rest.admin;

import com.braintrust.education.application.dtos.dtos.admin.*;
import com.braintrust.education.application.dtos.dtos.admin.PaginatedStatsDTO;
import com.braintrust.education.application.service.AdminStatsAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AdminStatsController — all admin-dashboard endpoints.
 *
 * Base URL: /api/admin/stats
 *
 * ENDPOINTS
 * ─────────────────────────────────────────────────────────────────────────────
 * GET  /                             → full composite stats (existing)
 * GET  /ai-assignments               → paginated AI submissions WITH student info
 * GET  /ai-breakdown                 → % full-AI / high-AI / low-AI / human
 * GET  /user-counts                  → # students + # teachers
 * GET  /late-submissions             → paginated late submissions
 * GET  /courses/by-ai                → all courses sorted by AI %
 * GET  /courses/by-late              → all courses sorted by late %
 * GET  /quizzes/top                  → top N quiz submissions by grade
 * GET  /overdue-assignments          → paginated overdue assignments (legacy)
 * GET  /health                       → health check
 */
@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = "*")
@Tag(name = "Admin Statistics", description = "Admin-only endpoints for system statistics")
public class AdminStatsController {

    private static final Logger log = LoggerFactory.getLogger(AdminStatsController.class);

    private final AdminStatsAnalysisService statsService;

    public AdminStatsController(AdminStatsAnalysisService statsService) {
        this.statsService = statsService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING — full composite dashboard
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping
    @Operation(
            summary = "Full admin statistics dashboard",
            description = "Returns a composite object with all system statistics. Admin only."
    )
    public ResponseEntity<AdminStatsDTO> getAllStats() {
        log.info("📊 Admin requesting comprehensive statistics");
        return ResponseEntity.ok(statsService.getAdminStats());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PAGINATED AI ASSIGNMENTS (with student info)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/ai-assignments")
    @Operation(
            summary = "Paginated AI-detected submissions",
            description = "All submissions flagged by AI analysis, paginated, " +
                    "including the student who submitted each one. " +
                    "Sorted by AI probability descending."
    )
    public ResponseEntity<PaginatedStatsDTO<AIAssignmentPageDTO>> getAIAssignments(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0")  int page,
            @Parameter(description = "Page size")             @RequestParam(defaultValue = "20") int size
    ) {
        log.info("📄 [GET /ai-assignments] page={} size={}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(statsService.getAIAssignmentsPaginated(pageable));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. AI STATS BREAKDOWN
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/ai-breakdown")
    @Operation(
            summary = "AI probability breakdown",
            description = "Returns the percentage of submissions that are: " +
                    "100% AI, 50-99% AI (high), 1-49% AI (low), 0% AI (human). " +
                    "Also includes the overall average AI probability."
    )
    public ResponseEntity<AIStatsBreakdownDTO> getAIBreakdown() {
        log.info("📊 [GET /ai-breakdown]");
        return ResponseEntity.ok(statsService.getAIStatsBreakdown());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. USER COUNTS
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/user-counts")
    @Operation(
            summary = "Total number of students and teachers",
            description = "Returns count of students, teachers and their active subsets."
    )
    public ResponseEntity<UserCountDTO> getUserCounts() {
        log.info("👥 [GET /user-counts]");
        return ResponseEntity.ok(statsService.getUserCounts());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. LATE SUBMISSIONS
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/late-submissions")
    @Operation(
            summary = "Paginated late submissions",
            description = "All submissions sent after the assignment due-date, " +
                    "sorted by how late they were (most-late first). " +
                    "Includes student name, course, minutes late, and AI probability."
    )
    public ResponseEntity<PaginatedStatsDTO<LateSubmissionDTO>> getLateSubmissions(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("⏰ [GET /late-submissions] page={} size={}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(statsService.getLateSubmissionsPaginated(pageable));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. COURSES RANKED BY AI PERCENTAGE
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/courses/by-ai")
    @Operation(
            summary = "All courses ranked by AI-submission percentage",
            description = "Returns every course with its AI-submission % and late %. " +
                    "Use ?sort=asc for least-AI first, ?sort=desc (default) for most-AI first."
    )
    public ResponseEntity<List<CourseAIStatsDTO>> getCoursesByAI(
            @Parameter(description = "'asc' or 'desc' (default)")
            @RequestParam(defaultValue = "desc") String sort
    ) {
        log.info("📚 [GET /courses/by-ai] sort={}", sort);
        return ResponseEntity.ok(statsService.getCoursesByAIPercentage(sort));
    }

        // ─────────────────────────────────────────────────────────────────────────
        // 6. COURSES RANKED BY LATE PERCENTAGE
        // ─────────────────────────────────────────────────────────────────────────

        @GetMapping("/courses/by-late")
        @Operation(
                summary = "All courses ranked by late-submission percentage",
                description = "Returns every course with its late % and AI %. " +
                        "Use ?sort=asc for least-late first, ?sort=desc (default) for most-late first."
    )
    public ResponseEntity<List<CourseAIStatsDTO>> getCoursesByLate(
            @Parameter(description = "'asc' or 'desc' (default)")
            @RequestParam(defaultValue = "desc") String sort
    ) {
        log.info("📚 [GET /courses/by-late] sort={}", sort);
        return ResponseEntity.ok(statsService.getCoursesByLatePercentage(sort));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 7. TOP QUIZZES BY GRADE
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/quizzes/top")
    @Operation(
            summary = "Top quiz submissions by grade",
            description = "Returns the top N quiz submissions ranked by grade percentage. " +
                    "Each entry includes the student, quiz title, course, and score."
    )
    public ResponseEntity<List<QuizTopDTO>> getTopQuizzes(
            @Parameter(description = "How many results to return (default 20)")
            @RequestParam(defaultValue = "20") int limit
    ) {
        log.info("🏆 [GET /quizzes/top] limit={}", limit);
        int safeLimit = Math.max(1, Math.min(limit, 200)); // clamp 1–200
        return ResponseEntity.ok(statsService.getTopQuizzesByGrade(safeLimit));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXISTING — overdue assignments (kept for backwards compatibility)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/overdue-assignments")
    @Operation(
            summary = "Paginated overdue assignments",
            description = "Assignments whose due date has already passed."
    )
    public ResponseEntity<PaginatedStatsDTO<OverdueAssignmentDTO>> getOverdueAssignments(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.info("📋 [GET /overdue-assignments] page={} size={}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(statsService.getOverdueAssignmentsPaginated(pageable));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HEALTH CHECK
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Admin stats service is running ✅");
    }
}