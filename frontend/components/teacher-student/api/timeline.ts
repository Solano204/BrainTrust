import { fetchThisWeekQuizzes } from "./quiz";
import { Quiz } from "./quiz-api";
import { Assignment, fetchThisWeekTasks } from "./task";

// Global dismissal set (you might want to move this to a proper state management)
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

    // Filter resources based on date range, user type, and dismissal status
    const filteredResources = [...quizzes, ...tasks].filter(resource => {
      if (!resource.dueDate) return false;
      
      const resourceDate = new Date(resource.dueDate);
      const isInWeek = resourceDate >= weekStartDate && resourceDate < weekEndDate;
      
      // Remove dismissed items
      if (DISMISSED_ITEMS.has(resource.id)) {
        return false;
      }
      
      // For students, only show upcoming resources
      if (userType === 'student') {
        const now = new Date();
        return isInWeek && resourceDate >= now;
      }
      
      // For teachers, show both upcoming and recent resources
      return isInWeek;
    });

    // Sort by due date (soonest first)
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

// Utility function to dismiss an item
export function dismissResource(resourceId: string): void {
  DISMISSED_ITEMS.add(resourceId);
  console.log(`Dismissed resource ${resourceId}. Total dismissed: ${DISMISSED_ITEMS.size}`);
}

// Utility function to restore a dismissed item
export function restoreResource(resourceId: string): void {
  DISMISSED_ITEMS.delete(resourceId);
  console.log(`Restored resource ${resourceId}. Total dismissed: ${DISMISSED_ITEMS.size}`);
}