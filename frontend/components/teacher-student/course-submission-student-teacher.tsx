// File: src/app/features/courses/components/CourseTaskOverview.tsx
"use client"

import { useAuth } from "@/app/context/AuthContext"
import { StudentCourseTaskOverview } from "../student/course-section-submission-student"
import { CourseTaskOverviewTeacher} from "../teacher/course-section-submission-teacher"

interface CourseTaskOverviewProps {
    courseId: string
}

export function CourseTaskOverview({ courseId }: CourseTaskOverviewProps) {
    const { user } = useAuth()
    const isStudent = user?.role === 'student'

    return isStudent ? (
        <StudentCourseTaskOverview courseId={courseId} />
    ) : (
        // Keep the existing teacher view (your original CourseTaskOverview component)
        // Just rename it to TeacherCourseTaskOverview or keep as is
        < CourseTaskOverviewTeacher courseId={courseId} />
       
    )
}