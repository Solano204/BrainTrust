// File: src/app/features/gradebook/components/CourseGradebook.tsx
"use client"

import * as React from "react"
import { useAuth } from "@/app/context/AuthContext"
import { StudentCourseGradebook } from "../student/course-gradebook-student"
import { TeacherCourseGradebook } from "../teacher/course-gradebook-student-teacher"

interface CourseGradebookProps {
    courseId: string
}

export function CourseGradebook({ courseId }: CourseGradebookProps) {
    const { user } = useAuth()
    const isStudent = user?.role === 'student'

    return isStudent ? (
        <StudentCourseGradebook courseId={courseId} />
    ) : (
        <TeacherCourseGradebook courseId={courseId} />
    )
}