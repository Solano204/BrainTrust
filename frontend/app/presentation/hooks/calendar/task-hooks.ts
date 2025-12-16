// File: src/app/features/tasks/hooks/task-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/app/infraestructure/api/calendar/task-keys";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { fetchTasksByMonth, fetchThisWeekTasks } from "@/components/teacher-student/api/task";


// CURRENTLY WORKS

export function useTasksByMonth(
  userId: string | null, 
  monthStart: string, 
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Assignment[]>({
    queryKey: taskKeys.list(userId || "", monthStart, userType),
    queryFn: () => fetchTasksByMonth(userId!, monthStart, userType),
    enabled: !!userId && !!monthStart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}



// CURRENTLY WORKS

export function useThisWeekTasks(
  userId: string | null, 
  weekStart: string, 
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Assignment[]>({
    queryKey: taskKeys.week(userId || "", weekStart, userType),
    queryFn: () => fetchThisWeekTasks(userId!, weekStart, userType),
    enabled: !!userId && !!weekStart,
    staleTime: 2 * 60 * 1000, // 2 minutes for week data
  });
}


export function useTaskMutations() {
  const queryClient = useQueryClient();

  const refreshTasks = useMutation({
    mutationFn: async (params: { 
      userId: string; 
      monthStart: string; 
      userType: 'teacher' | 'student' 
    }) => {
      return Promise.resolve();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.list(variables.userId, variables.monthStart, variables.userType) 
      });
    },
  });

  return {
    refreshTasks,
  };
}