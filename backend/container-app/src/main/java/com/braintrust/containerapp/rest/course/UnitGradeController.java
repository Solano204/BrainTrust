package com.braintrust.containerapp.rest.course;

import com.braintrust.identity.application.dtos.commands.AssignFinalGradeCommand;
import com.braintrust.education.application.dtos.commands.BulkUpdateUnitGradesCommand;
import com.braintrust.education.application.dtos.dtos.UnitGradeDTO;
import com.braintrust.education.application.ports.in.UnitGradeService;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/unit-grades")
public class UnitGradeController {

    private final UnitGradeService unitGradeService;

    public UnitGradeController(UnitGradeService unitGradeService) {
        this.unitGradeService = unitGradeService;
    }

    // ========================================
    // 📍 FINAL GRADE MANAGEMENT
    // ========================================

    @PutMapping("/unit/{unitId}/student/{studentId}/final-grade")
    public ResponseEntity<Void> assignFinalGrade(
            @PathVariable String unitId,
            @PathVariable String studentId,
            @RequestBody AssignFinalGradeCommand command) {


        unitGradeService.assignFinalGrade(
                UnitId.fromString(unitId),
                UserId.fromString(studentId),
                new BigDecimal(command.gradeValue()),
                command.feedback()
        );

        return ResponseEntity.ok().build();
    }


    @PutMapping("/unit/{unitId}/bulk-grades")
    public ResponseEntity<SuccessResponseDTO> bulkUpdateUnitGrades(
            @PathVariable String unitId,
            @RequestBody BulkUpdateUnitGradesCommand command) {



        // Ensure the unitId in path matches the command
        BulkUpdateUnitGradesCommand finalCommand = new BulkUpdateUnitGradesCommand(
                unitId,
                command.grades()
        );

        unitGradeService.bulkUpdateUnitGrades(finalCommand);

        return ResponseEntity.ok(new SuccessResponseDTO(
                true,
                String.format("Bulk updated %d grades for unit %s",
                        command.grades().size(), unitId),
                null
        ));
    }


//    @GetMapping("/unit/{unitId}/student/{studentId}/final-grade")
//    public ResponseEntity<FinalGradeDTO> getFinalGrade(
//            @PathVariable String unitId,
//            @PathVariable String studentId) {
//
//        FinalGradeDTO finalGrade = unitGradeService.getFinalGrade(
//                UnitId.fromString(unitId),
//                UserId.fromString(studentId)
//        );
//
//        return ResponseEntity.ok(finalGrade);
//    }

    // ========================================
    // 📍 UNIT GRADE MANAGEMENT
    // ========================================

//    @PostMapping("/feedback")
//    public ResponseEntity<Void> addFeedback(@RequestBody AddUnitGradeFeedbackCommand command) {
//        unitGradeService.addFeedback(command);
//        return ResponseEntity.ok().build();
//    }

//    @PostMapping("/recalculate")
//    public ResponseEntity<Void> recalculateUnitGrade(
//            @RequestParam String unitId,
//            @RequestParam String studentId) {
//        unitGradeService.recalculateUnitGrade(
//                UnitId.fromString(unitId),
//                UserId.fromString(studentId)
//        );
//        return ResponseEntity.ok().build();
//    }

//    @GetMapping("/unit/{unitId}/student/{studentId}")
//    public ResponseEntity<UnitGradeDTO> getUnitGrade(
//            @PathVariable String unitId,
//            @PathVariable String studentId) {
//        UnitGradeDTO dto = unitGradeService.getUnitGrade(
//                UnitId.fromString(unitId),
//                UserId.fromString(studentId)
//        );
//        return ResponseEntity.ok(dto);
//    }

//    @GetMapping("/student/{studentId}")
//    public ResponseEntity<List<UnitGradeDTO>> getUnitGradesByStudent(@PathVariable String studentId) {
//        List<UnitGradeDTO> grades = unitGradeService.getUnitGradesByStudent(
//                UserId.fromString(studentId)
//        );
//        return ResponseEntity.ok(grades);
//    }

    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<UnitGradeDTO>> getUnitGradesByUnit(@PathVariable String unitId) {
        List<UnitGradeDTO> grades = unitGradeService.getUnitGradesByUnit(
                UnitId.fromString(unitId)
        );
        return ResponseEntity.ok(grades);
    }
}