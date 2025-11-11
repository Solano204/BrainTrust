// File: src/app/features/courses/hooks/student-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentKeys } from "@/app/infraestructure/api/students/student-keys";
import {
  fetchEnrollmentsByCourse,
  fetchEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  bulkEnrollStudents,
  searchAvailableUsers,
  updateStudentGrade,
  getEnrollmentStats
} from "@/app/infraestructure/api/students/student-api";
import { Enrollment } from "@/app/domain/entities/CourseEntities";
import { User } from "@/app/domain/entities/IdentityEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import React from "react";

// Extended interface for enrollments with user data
interface EnrollmentWithUser extends Enrollment {
  user: User;
}

/**
 * Custom hook for fetching enrollments by course with user details
 */
export function useEnrollmentsByCourse(courseId: CourseId | null) {
  return useQuery<EnrollmentWithUser[]>({
    queryKey: studentKeys.enrollmentsByCourse(courseId || ""),
    queryFn: () => fetchEnrollmentsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching enrollment statistics
 */
export function useEnrollmentStats(courseId: CourseId | null) {
  return useQuery({
    queryKey: studentKeys.statsByCourse(courseId || ""),
    queryFn: () => getEnrollmentStats(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for searching available users
 */
export function useAvailableUsersSearch( searchTerm: string) {
  return useQuery<User[]>({
    queryKey: [...studentKeys.availableUsersByCourse(""), searchTerm],
    queryFn: () => searchAvailableUsers( searchTerm),
    enabled:  searchTerm.length > 0,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for student mutations
 */
export function useStudentMutations() {
  const queryClient = useQueryClient();

  const createEnrollmentMutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollmentsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.statsByCourse(data.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating enrollment:", error.message);
    }
  });

  const bulkEnrollMutation = useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: CourseId, studentIds: UserId[] }) =>
      bulkEnrollStudents(courseId, studentIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollmentsByCourse(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.statsByCourse(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error bulk enrolling students:", error.message);
    }
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, enrollmentData }: { 
      enrollmentId: string, 
      enrollmentData: Partial<Omit<Enrollment, "id" | "courseId" | "studentId">> 
    }) => updateEnrollment(enrollmentId, enrollmentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollmentsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollmentById(variables.enrollmentId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating enrollment:", error.message);
    }
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: deleteEnrollment,
    onSuccess: (_, enrollmentId) => {
      // We need to invalidate all enrollment lists since we don't know which course this belonged to
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollments() 
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting enrollment:", error.message);
    }
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ enrollmentId, grade }: { 
      enrollmentId: string, 
      grade: { value: string; maxScore: string } 
    }) => updateStudentGrade(enrollmentId, grade),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollmentsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.enrollmentById(variables.enrollmentId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating grade:", error.message);
    }
  });

  return {
    createEnrollment: createEnrollmentMutation,
    bulkEnroll: bulkEnrollMutation,
    updateEnrollment: updateEnrollmentMutation,
    deleteEnrollment: deleteEnrollmentMutation,
    updateGrade: updateGradeMutation
  };
}

/**
 * Custom hook for managing student search and display
 */
export function useStudentManagement(courseId: CourseId | null) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterGroup, setFilterGroup] = React.useState("all");
  const [selectedStudents, setSelectedStudents] = React.useState<UserId[]>([]);

  const { data: enrollments = [] } = useEnrollmentsByCourse(courseId);
  const { data: availableUsers = [], isLoading: isSearching } = useAvailableUsersSearch( searchTerm);

  // Transform enrollments to display format using complete user data
  const students = React.useMemo(() => {
    return enrollments.map(enrollment => ({
      id: enrollment.studentId,
      enrollmentId: enrollment.id,
      name: `${enrollment.user.person.firstName} ${enrollment.user.person.lastName}`,
      email: enrollment.user.email,
      image: enrollment.user.person.imagePath || "/placeholder.svg",
      group: null, // This would come from team data
      lastAccess: "Recently", // This would come from activity data
      isActive: enrollment.status === "ACTIVE",
      grade: enrollment.grade ? parseInt(enrollment.grade.value) : null,
      enrollment: enrollment,
      user: enrollment.user // Include complete user data
    }));
  }, [enrollments]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup =
      filterGroup === "all" || student.group === filterGroup || (filterGroup === "none" && !student.group);
    return matchesSearch && matchesGroup;
  });

  return {
    students: filteredStudents,
    availableUsers,
    isSearching,
    searchTerm,
    setSearchTerm,
    filterGroup,
    setFilterGroup,
    selectedStudents,
    setSelectedStudents
  };
}