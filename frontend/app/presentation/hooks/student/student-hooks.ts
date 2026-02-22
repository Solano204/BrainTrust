
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentKeysEnrollment } from "@/app/infraestructure/api/students/student-keys";
import { Enrollment } from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import {
  fetchEnrollmentsByCourse,
  searchStudentsForEnrollment,
  createEnrollment,
  bulkEnrollStudents,
  deleteEnrollment,
  getEnrollmentStats,
  User
} from "@/components/student/api/enrollment";

export function useEnrollmentsByCourse(courseId: CourseId | null) {
  return useQuery<Enrollment[]>({
    queryKey: studentKeysEnrollment.enrollmentsByCourse(courseId || ""),
    queryFn: () => fetchEnrollmentsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useEnrollmentStats(courseId: CourseId | null) {
  return useQuery({
    queryKey: studentKeysEnrollment.statsByCourse(courseId || ""),
    queryFn: () => getEnrollmentStats(courseId!),
    enabled: !!courseId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}


export function useAvailableUsersSearch(courseId: CourseId | null, searchTerm: string) {
  return useQuery<User[]>({
    queryKey: [...studentKeysEnrollment.availableUsersByCourse(courseId || ""), searchTerm],
    queryFn: () => searchStudentsForEnrollment(courseId!, searchTerm),
    enabled: !!courseId && searchTerm.trim().length > 0,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

export function useStudentMutations() {
  const queryClient = useQueryClient();

  const createEnrollmentMutation = useMutation({
    mutationFn: createEnrollment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: studentKeysEnrollment.enrollmentsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({
        queryKey: studentKeysEnrollment.statsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({
        queryKey: studentKeysEnrollment.availableUsersByCourse(data.courseId)
      });
    },
    onError: (error: Error) => {
      console.error("Error creating enrollment:", error.message);
    }
  });

  const bulkEnrollMutation = useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: CourseId; studentIds: UserId[] }) =>
      bulkEnrollStudents(courseId, studentIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeysEnrollment.enrollmentsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeysEnrollment.statsByCourse(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeysEnrollment.availableUsersByCourse(data.courseId)
      });
    },
    onError: (error: Error) => {
      console.error("Error bulk enrolling students:", error.message);
    }
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: CourseId; studentId: UserId }) =>
      deleteEnrollment(courseId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: studentKeysEnrollment.enrollmentsByCourse(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeysEnrollment.statsByCourse(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: studentKeysEnrollment.availableUsersByCourse(variables.courseId)
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting enrollment:", error.message);
    }
  });

  return {
    createEnrollment: createEnrollmentMutation,
    bulkEnroll: bulkEnrollMutation,
    deleteEnrollment: deleteEnrollmentMutation,
  };
}