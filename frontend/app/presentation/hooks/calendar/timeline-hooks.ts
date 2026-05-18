"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timelineKeys } from "@/app/infraestructure/api/calendar/timeline-keys";
import { Assignment, dismissTimelineItem, fetchTimelineResources, Quiz } from "@/app/infraestructure/api/calendar/timeline-api";


export function useTimelineResources(
  userId: string | null, 
  weekStart: string, 
  userType: 'teacher' | 'student' = 'teacher'
) {
  return useQuery<(Assignment | Quiz)[]>({
    queryKey: timelineKeys.resources(userId || "", weekStart, userType),
    queryFn: () => fetchTimelineResources(userId!, weekStart, userType),
    enabled: !!userId && !!weekStart,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

export function useTimelineMutations() {
  const queryClient = useQueryClient();

  const dismissItemMutation = useMutation({
    mutationFn: (itemId: string) => dismissTimelineItem(itemId),
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({
        queryKey: timelineKeys.all 
      });
    },
    onError: (error: Error) => {
      console.error("Error dismissing timeline item:", error.message);
    },
  });

  return {
    dismissItem: dismissItemMutation,
  };
}