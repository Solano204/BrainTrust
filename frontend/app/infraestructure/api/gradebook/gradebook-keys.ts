export const gradebookKeys = {
  all: ["gradebook"] as const,
  course: (courseId: string) => [...gradebookKeys.all, "course", courseId] as const,
  data: (courseId: string) => [...gradebookKeys.course(courseId), "data"] as const,
  stats: (courseId: string) => [...gradebookKeys.course(courseId), "stats"] as const,
  studentData: (courseId: string, studentId: string) => 
    [...gradebookKeys.course(courseId), "student", studentId] as const,
  mutations: () => [...gradebookKeys.all, "mutation"] as const,
  updateGrade: () => [...gradebookKeys.mutations(), "updateGrade"] as const,
  bulkUpdate: () => [...gradebookKeys.mutations(), "bulkUpdate"] as const,
  export: () => [...gradebookKeys.mutations(), "export"] as const,
  studentExport: () => [...gradebookKeys.mutations(), "studentExport"] as const,
} as const;