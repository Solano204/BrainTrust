export interface UnitGradeDTO {
    id: string;
    unitId: string;
    unitName: string;
    studentId: string;
    studentName: string;
    grade: GradeInfoDTO;
    assignmentGrades: Record<string, GradeInfoDTO>;
    quizGrades: Record<string, GradeInfoDTO>;
    feedback: string;
    lastCalculated: string;
    calculatedTotal: string;
    finalGrade: string;
    finalFeedback: string;
}

export interface GradeInfoDTO {
    value: string;
    maxScore: string;
    percentage: string;
}