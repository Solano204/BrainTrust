export interface EnrollmentDTO {
    id: string;
    courseId: string;
    courseName: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentRefId: string;
    enrollmentDate: string;
    status: string;
    finalGrade: GradeDTO | null;
}

export interface GradeDTO {
    grade: number;
    feedback: string;
    gradedBy: string;
    gradedDate: string;
}

export interface FinalGradeDTO {
    value: string;
    maxScore: string;
    percentage: string;
}