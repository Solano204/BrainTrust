export interface CreateCourseCommand {
    code: string;
    name: string;
    description: string;
    grade: string;
    group: string;
    teacherId: string;
    urlImage?: string;
}

export interface UpdateCourseCommand {
    name: string;
    description: string;
    grade: string;
    group: string;
    teacherId?: string;
    imageUrl?: string;
    courseId: string;
}

export interface BulkEnrollCommand {
    studentIds: string[];
}

export interface BulkUnenrollCommand {
    studentIds: string[];
}

export interface AssignFinalGradeCommand {
    gradeValue: number;
    feedback: string;
}

export interface AssignUnitFinalGradeCommand {
    gradeValue: number;
    feedback: string;
}

export interface UpdateStudentGradeCommand {
    studentId: string;
    gradeValue: number;
    feedback: string;
}