import { CourseDTO, CourseUnitDTO, PaginatedResponseDTO } from "@/app/shared/dtos/course.dto";
import { EnrollmentDTO } from "@/app/shared/dtos/enrollment.dto";
import { TeacherDTO, StudentDTO } from "@/app/shared/dtos/user.dto";
import { AdminCourse, AdminCourseUnit, AdminEnrollment } from "@/app/shared/models/admin-course.model";
import { Teacher, Student } from "@/app/shared/models/user.model";
import { PaginatedResponse } from "@/app/shared/types/pagination";

export function mapPaginatedResponseFromBackend<T, U>(
    dto: PaginatedResponseDTO<U>,
    mapper: (item: U) => T
): PaginatedResponse<T> {
    return {
        content: dto.content.map(mapper),
        pageNumber: dto.pageNumber,
        pageSize: dto.pageSize,
        totalElements: dto.totalElements,
        totalPages: dto.totalPages,
        first: dto.first,
        last: dto.last
    };
}

export function mapCourseFromBackend(dto: CourseDTO): AdminCourse {
    return {
        id: dto.id,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        urlImage: dto.urlImage,
        grade: dto.grade,
        group: dto.group,
        teacherId: dto.teacherId,
        teacherName: dto.teacherName,
        active: dto.active,
        studentCount: dto.studentCount,
        assignmentCount: dto.assignmentCount,
        unitCount: dto.unitCount,
        createdAt: dto.createdAt,
    };
}

export function mapEnrollmentFromBackend(enrollment: EnrollmentDTO): AdminEnrollment {
    return {
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseName: enrollment.courseName,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        studentEmail: enrollment.studentEmail,
        studentRefId: enrollment.studentRefId,
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status,
        finalGrade: enrollment.finalGrade ? {
            value: String(enrollment.finalGrade.grade),
            maxScore: "100",
            percentage: String(enrollment.finalGrade.grade)
        } : null
    };
}

export function mapCourseUnitFromBackend(dto: CourseUnitDTO): AdminCourseUnit {
    return {
        id: dto.id,
        courseId: dto.courseId,
        name: dto.name,
        urlImage: dto.urlImage,
        numUnity: dto.numUnity,
        description: dto.description,
    };
}

export function mapTeacherFromBackend(dto: TeacherDTO | any): Teacher {
    if (dto.person) {
        return {
            userId: dto.id,
            personId: dto.person.id,
            firstName: dto.person.firstName,
            lastName: dto.person.lastName,
            fullName: dto.person.fullName || `${dto.person.firstName} ${dto.person.lastName}`,
            email: dto.email
        };
    } else {
        return {
            userId: dto.userId || dto.id,
            personId: dto.personId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            fullName: dto.fullName,
            email: dto.email
        };
    }
}

export function mapStudentFromBackend(dto: StudentDTO): Student {
    return {
        userId: dto.userId,
        personId: dto.personId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName: dto.fullName,
        email: dto.email,
        studentRefId: dto.studentRefId,
        isAlreadyEnrolled: dto.isAlreadyEnrolled,
        enrollmentId: dto.enrollmentId,
        enrollmentStatus: dto.enrollmentStatus,
    };
}