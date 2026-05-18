export const studentTaskKeys = {
    all: ["studentTasks"] as const,
    course: (courseId: string, studentId: string) => [...studentTaskKeys.all, "course", courseId, "student", studentId] as const,
    assignments: (courseId: string, studentId: string) => [...studentTaskKeys.course(courseId, studentId), "assignments"] as const,
    quizzes: (courseId: string, studentId: string) => [...studentTaskKeys.course(courseId, studentId), "quizzes"] as const,
    stats: (courseId: string, studentId: string) => [...studentTaskKeys.course(courseId, studentId), "stats"] as const,
} as const;