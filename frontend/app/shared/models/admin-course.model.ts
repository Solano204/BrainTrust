export interface AdminCourse {
    id: string;
    code: string;
    name: string;
    description: string;
    urlImage: string;
    grade: string;
    group: string;
    teacherId: string;
    teacherName: string;
    active: boolean;
    studentCount: number;
    assignmentCount: number;
    unitCount: number;
    createdAt: string;
}

export interface AdminCourseUnit {
    id: string;
    courseId: string;
    name: string;
    urlImage: string;
    numUnity: number;
    description: string;
}

export interface AdminEnrollment {
    id: string;
    courseId: string;
    courseName: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentRefId: string;
    enrollmentDate: string;
    status: string;
    finalGrade: FinalGradeModel | null;
}

export interface FinalGradeModel {
    value: string;
    maxScore: string;
    percentage: string;
}