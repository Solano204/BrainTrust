// app/presentation/hooks/course/student-hooks.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { Course } from "@/app/domain/entities/CourseEntities";
import { courseKeys } from "@/app/infraestructure/api/course/course-keys";
import { fetchStudentCourses } from "@/app/infraestructure/api/course/student/student-api";

export function useStudentCourses(studentId: string | null) {
  return useQuery<Course[]>({
    queryKey: courseKeys.studentList(studentId || ""),
    queryFn: () => fetchStudentCourses(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}