
"use server";

import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";

import {
  CourseDTO,
  CourseUnitDTO,
  CourseStatsDTO,
  PaginatedResponseDTO,
} from "@/app/shared/dtos/course.dto";

import { EnrollmentDTO } from "@/app/shared/dtos/enrollment.dto";

import { UnitGradeDTO } from "@/app/shared/dtos/grade.dto";
import { TeacherDTO, StudentDTO } from "@/app/shared/dtos/user.dto";

import {
  CreateCourseCommand,
  UpdateCourseCommand,
  BulkEnrollCommand,
  BulkUnenrollCommand,
  AssignFinalGradeCommand,
  AssignUnitFinalGradeCommand,
  UpdateStudentGradeCommand,
} from "@/app/shared/dtos/commands/course.commands";

import {
  PaginatedResponse,
  PaginationParams,
} from "@/app/shared/types/pagination";

import {
  mapPaginatedResponseFromBackend,
  mapCourseFromBackend,
  mapEnrollmentFromBackend,
  mapCourseUnitFromBackend,
  mapTeacherFromBackend,
  mapStudentFromBackend,
} from "@/app/shared/mappers/course.mappers";

import {
  AdminCourse,
  AdminCourseUnit,
  AdminEnrollment,
} from "@/app/shared/models/admin-course.model";

import { Teacher, Student } from "@/app/shared/models/user.model";

export async function fetchAllCoursesPaginated(
  params: PaginationParams = {},
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "createdAt,desc",
      search,
      active,
      teacherId,
      grade,
      group,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) queryParams.append("name", search);
    if (active !== undefined) queryParams.append("active", active.toString());
    if (teacherId) queryParams.append("teacherId", teacherId);
    if (grade) queryParams.append("grade", grade);
    if (group) queryParams.append("group", group);

    const { data } = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(
      `/api/courses/paginated?${queryParams.toString()}`,
    );

    return mapPaginatedResponseFromBackend(data, mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchActiveCoursesPaginated(
  params: Omit<PaginationParams, "active"> = {},
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "name,asc",
      search,
      teacherId,
      grade,
      group,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) queryParams.append("name", search);
    if (teacherId) queryParams.append("teacherId", teacherId);
    if (grade) queryParams.append("grade", grade);
    if (group) queryParams.append("group", group);

    const { data } = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(
      `/api/courses/active/paginated?${queryParams.toString()}`,
    );

    return mapPaginatedResponseFromBackend(data, mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCoursesByTeacherPaginated(
  teacherId: string,
  params: Omit<PaginationParams, "teacherId"> = {},
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "name,asc",
      search,
      active,
      grade,
      group,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) queryParams.append("name", search);
    if (active !== undefined) queryParams.append("active", active.toString());
    if (grade) queryParams.append("grade", grade);
    if (group) queryParams.append("group", group);

    const { data } = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(
      `/api/courses/teacher/${teacherId}/paginated?${queryParams.toString()}`,
    );

    return mapPaginatedResponseFromBackend(data, mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchCoursesByNamePaginated(
  name: string,
  params: Omit<PaginationParams, "search"> = {},
): Promise<PaginatedResponse<AdminCourse>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "name,asc",
      active,
      teacherId,
      grade,
      group,
    } = params;

    const queryParams = new URLSearchParams({
      name,
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (active !== undefined) queryParams.append("active", active.toString());
    if (teacherId) queryParams.append("teacherId", teacherId);
    if (grade) queryParams.append("grade", grade);
    if (group) queryParams.append("group", group);

    const { data } = await apiClient.get<PaginatedResponseDTO<CourseDTO>>(
      `/api/courses/search?${queryParams.toString()}`,
    );

    return mapPaginatedResponseFromBackend(data, mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseById(courseId: string): Promise<AdminCourse> {
  try {
    const { data } = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    return mapCourseFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createCourse(
  command: CreateCourseCommand,
): Promise<AdminCourse> {
  try {
    const { urlImage, ...commandWithoutImage } = command;
    const { data } = await apiClient.post<CourseDTO>(
      "/api/courses",
      commandWithoutImage,
    );
    return mapCourseFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createCourseWithImage(
  command: CreateCourseCommand,
): Promise<AdminCourse> {
  try {
    const { urlImage, ...rest } = command; // destructure urlImage out

    const payload = {
      ...rest,        // spread everything EXCEPT urlImage
      imageUrl: urlImage, // map to the field name the backend expects
    };

    const { data } = await apiClient.post<CourseDTO>(
      "/api/courses/with-image",
      payload,
    );
    return mapCourseFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateCourse(
  courseId: string,
  command: UpdateCourseCommand,
): Promise<AdminCourse> {
  try {
    const { data } = await apiClient.put<CourseDTO>(
      `/api/courses/${courseId}`,
      command,
    );
    return mapCourseFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/* =========================
   COURSE UNITS
========================= */

export async function fetchCourseUnits(
  courseId: string,
): Promise<AdminCourseUnit[]> {
  try {
    const { data } = await apiClient.get<CourseUnitDTO[]>(
      `/api/courses/${courseId}/units`,
    );
    return data.map(mapCourseUnitFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteUnit(
  courseId: string,
  unitId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}/units/${unitId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseEnrollments(
  courseId: string,
): Promise<AdminEnrollment[]> {
  try {
    const { data } = await apiClient.get<EnrollmentDTO[]>(
      `/api/courses/${courseId}/enrollments`,
    );
    return data.map(mapEnrollmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchStudentsForCourse(
  courseId: string,
  searchTerm: string,
): Promise<Student[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const { data } = await apiClient.get<StudentDTO[]>(
      `/api/courses/${courseId}/enrollments/search`,
      {
        params: { query: searchTerm.trim() },
      },
    );

    return data
      .filter((dto) => !dto.isAlreadyEnrolled)
      .map(mapStudentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function bulkEnrollStudents(
  courseId: string,
  studentIds: string[],
): Promise<{ enrollmentIds: string[]; courseId: string }> {
  try {
    const command: BulkEnrollCommand = { studentIds };

    const { data } = await apiClient.post(
      `/api/courses/${courseId}/enrollments/bulk`,
      command,
    );

    const enrollmentIds = Array.isArray(data.data) ? data.data : [data.data];

    return { enrollmentIds, courseId };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function bulkUnenrollStudents(
  courseId: string,
  studentIds: string[],
): Promise<void> {
  try {
    const command: BulkUnenrollCommand = { studentIds };

    await apiClient.delete(`/api/courses/${courseId}/enrollments/bulk`, {
      data: command,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function unenrollStudent(
  courseId: string,
  studentId: string,
): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}/enrollments/${studentId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseGrades(
  courseId: string,
): Promise<AdminEnrollment[]> {
  try {
    const enrollments = await fetchCourseEnrollments(courseId);

    return enrollments.filter(
      (e) => e.status === "ACTIVE" || e.finalGrade !== null,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function assignFinalGrade(
  courseId: string,
  studentId: string,
  command: AssignFinalGradeCommand,
): Promise<void> {
  try {
    await apiClient.put(
      `/api/gradebook/course/${courseId}/student/${studentId}/final-grade`,
      command,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function bulkUpdateCourseGrades(
  courseId: string,
  grades: UpdateStudentGradeCommand[],
): Promise<void> {
  try {
    await apiClient.put(`/api/gradebook/course/${courseId}/bulk-grades`, {
      grades,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchUnitGrades(unitId: string): Promise<UnitGradeDTO[]> {
  try {
    const { data } = await apiClient.get<UnitGradeDTO[]>(
      `/api/unit-grades/unit/${unitId}`,
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function assignUnitFinalGrade(
  unitId: string,
  studentId: string,
  command: AssignUnitFinalGradeCommand,
): Promise<void> {
  try {
    await apiClient.put(
      `/api/unit-grades/unit/${unitId}/student/${studentId}/final-grade`,
      command,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function bulkUpdateUnitGrades(
  unitId: string,
  grades: UpdateStudentGradeCommand[],
): Promise<void> {
  try {
    await apiClient.put(`/api/unit-grades/unit/${unitId}/bulk-grades`, {
      grades,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchAllTeachers(): Promise<Teacher[]> {
  try {
    const endpoints = [
      "/api/users/role/teacher",
      "/api/users/role/admin",
      "/api/users/role/student",
    ];

    let lastError;

    for (const endpoint of endpoints) {
      try {
        const { data } = await apiClient.get<TeacherDTO[]>(endpoint);
        return data.map(mapTeacherFromBackend);
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error("No teacher endpoints available");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchAllTeachersPaginated(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Teacher>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "fullName,asc",
      search,
      active,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) queryParams.append("search", search);
    if (active !== undefined) queryParams.append("active", active.toString());

    const { data } = await apiClient.get<PaginatedResponseDTO<TeacherDTO>>(
      `/api/users/role/teacher/paginated?${queryParams.toString()}`,
    );

    return mapPaginatedResponseFromBackend(data, mapTeacherFromBackend);
  } catch (error) {
    console.warn("Teachers pagination endpoint not available, falling back");

    const allTeachers = await fetchAllTeachers();
    const { page = 0, size = 20 } = params;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedTeachers = allTeachers.slice(startIndex, endIndex);

    return {
      content: paginatedTeachers,
      pageNumber: page,
      pageSize: size,
      totalElements: allTeachers.length,
      totalPages: Math.ceil(allTeachers.length / size),
      first: page === 0,
      last: endIndex >= allTeachers.length,
    };
  }
}




export async function searchTeachers(searchTerm: string): Promise<Teacher[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    try {
      const { data } = await apiClient.get<TeacherDTO[]>(
        "/api/users/teachers/search",
        {
          params: { query: searchTerm.trim() },
        },
      );
      return data.map(mapTeacherFromBackend);
    } catch {
      const allTeachers = await fetchAllTeachers();
      return allTeachers.filter(
        (teacher: Teacher) =>
          teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getCourseStats(): Promise<CourseStatsDTO> {
  try {
    const { data } = await apiClient.get<CourseStatsDTO>(
      "/api/admin/courses/stats",
    );
    return data;
  } catch (error) {
    const paginatedResponse = await fetchAllCoursesPaginated({
      page: 0,
      size: 1000,
    });

    const courses = paginatedResponse.content;
    const activeCourses = courses.filter((c) => c.active).length;
    const inactiveCourses = courses.filter((c) => !c.active).length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);
    const uniqueTeachers = new Set(courses.map((c) => c.teacherId)).size;
    const averageStudentsPerCourse =
      courses.length > 0 ? totalStudents / courses.length : 0;

    return {
      totalCourses: courses.length,
      activeCourses,
      inactiveCourses,
      totalStudents,
      totalTeachers: uniqueTeachers,
      averageStudentsPerCourse:
        Math.round(averageStudentsPerCourse * 100) / 100,
    };
  }
}

export async function getCourseEnrollmentStats(courseId: string): Promise<{
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  averageGrade: number;
}> {
  try {
    const enrollments = await fetchCourseEnrollments(courseId);

    const active = enrollments.filter((e) => e.status === "ACTIVE").length;
    const completed = enrollments.filter(
      (e) => e.status === "COMPLETED",
    ).length;
    const cancelled = enrollments.filter(
      (e) => e.status === "CANCELLED",
    ).length;

    const gradesWithValues = enrollments
      .filter((e) => e.finalGrade?.value != null)
      .map((e) => parseFloat(e.finalGrade!.value));

    const averageGrade =
      gradesWithValues.length > 0
        ? gradesWithValues.reduce((sum, grade) => sum + grade, 0) /
          gradesWithValues.length
        : 0;

    return {
      total: enrollments.length,
      active,
      completed,
      cancelled,
      averageGrade: Math.round(averageGrade * 100) / 100,
    };
  } catch (error) {
    return handleApiError(error);
  }
}
