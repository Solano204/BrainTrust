export interface CourseDTO {
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

export interface CourseUnitDTO {
    id: string;
    courseId: string;
    name: string;
    urlImage: string;
    numUnity: number;
    description: string;
}

export interface CourseStatsDTO {
    totalCourses: number;
    activeCourses: number;
    inactiveCourses: number;
    totalStudents: number;
    totalTeachers: number;
    averageStudentsPerCourse: number;
}

export interface PaginatedResponseDTO<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}