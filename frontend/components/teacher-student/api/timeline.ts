import { useQuery } from "@tanstack/react-query";
import { fetchThisWeekQuizzes } from "./quiz";
import {  fetchThisWeekTasks } from "./task";
import { Assignment, Quiz } from "@/app/domain/entities/CourseEntities";

const DISMISSED_ITEMS = new Set<string>();

export async function fetchCombinedWeekResourcesWithDismissal(
  userId: string,
  weekStart: string,
  userType: 'teacher' | 'student'
): Promise<(Assignment | Quiz)[]> {
  try {
    const [quizzes, tasks] = await Promise.all([
      fetchThisWeekQuizzes(userId, weekStart, userType),
      fetchThisWeekTasks(userId, weekStart, userType)
    ]);

    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);

    const filteredResources = [...quizzes, ...tasks].filter(resource => {
      if (!resource.dueDate) return false;
      
      const resourceDate = new Date(resource.dueDate);
      const isInWeek = resourceDate >= weekStartDate && resourceDate < weekEndDate;
      
      if (DISMISSED_ITEMS.has(resource.id)) {
        return false;
      }
      
      if (userType === 'student') {
        const now = new Date();
        return isInWeek && resourceDate >= now;
      }
      
      return isInWeek;
    });

    filteredResources.sort((a, b) => {
      const dateA = new Date(a.dueDate || '').getTime();
      const dateB = new Date(b.dueDate || '').getTime();
      return dateA - dateB;
    });

    console.log(`Combined ${filteredResources.length} filtered resources for ${userType} ${userId}`);
    console.log("Resource breakdown:", {
      quizzes: quizzes.length,
      tasks: tasks.length,
      afterFilter: filteredResources.length,
      dismissed: DISMISSED_ITEMS.size
    });
    console.log("Resource types:", filteredResources.map(r => 'questions' in r ? 'QUIZ' : 'ASSIGNMENT'));
    console.log("Due dates:", filteredResources.map(r => r.dueDate));

    return filteredResources;
  } catch (error) {
    console.error('Error fetching combined week resources:', error);
    throw error;
  }
}

export function dismissResource(resourceId: string): void {
  DISMISSED_ITEMS.add(resourceId);
  console.log(`Dismissed resource ${resourceId}. Total dismissed: ${DISMISSED_ITEMS.size}`);
}

export function restoreResource(resourceId: string): void {
  DISMISSED_ITEMS.delete(resourceId);
  console.log(`Restored resource ${resourceId}. Total dismissed: ${DISMISSED_ITEMS.size}`);
}

export function useTimelineTasks(
  userId: string | null,
  weekStart: string,
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Assignment[]>({
    queryKey: ['timeline-tasks', userId, weekStart, userType],
    queryFn: () => fetchThisWeekTasks(userId!, weekStart, userType),
    enabled: !!userId && !!weekStart,
    staleTime: 2 * 60 * 1000,
  });
}


export function useTimelineQuizzes(
  userId: string | null,
  weekStart: string,
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<Quiz[]>({
    queryKey: ['timeline-quizzes', userId, weekStart, userType],
    queryFn: () => fetchThisWeekQuizzes(userId!, weekStart, userType),
    enabled: !!userId && !!weekStart,
    staleTime: 2 * 60 * 1000,
  });
}