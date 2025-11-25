// File: src/app/features/courses/hooks/team-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamKeys } from "@/app/infraestructure/api/team/team-keys";
import { Team} from "@/app/domain/entities/CourseEntities";
import { CourseId , UserId} from "@/app/domain/valueObjects";
import React from "react";
import { addTeamMembers, AvailableUsersResponse, createTeam, fetchAvailableUsers,  fetchTeamsByCourse,  removeTeamMember,  TeamId,  TeamsResponse, updateTeamInfo } from "@/components/teacher-student/api/group";
import { deleteTeam, updateTeam } from "@/components/teacher-student/api/team-api";

/**
 * Custom hook for fetching teams by course
 */
export function useTeamsByCourse(courseId: CourseId | null) {
  return useQuery<TeamsResponse>({
    queryKey: teamKeys.list(courseId || ""),
    queryFn: () => fetchTeamsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}


/**
 * Custom hook for fetching available users
 */
export function useAvailableUsers(courseId: CourseId | null) {
  return useQuery<AvailableUsersResponse>({
    queryKey: teamKeys.availableUsersByCourse(courseId || ""),
    queryFn: () => fetchAvailableUsers(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for team mutations
 */
export function useTeamMutations() {
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(data.team) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating team:", error.message);
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ courseId, teamId, teamData }: { 
      courseId: CourseId, 
      teamId: string, 
      teamData: Partial<Omit<Team, "courseId" | "name" | "createdAt">> 
    }) => updateTeam(courseId, teamId, teamData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating team:", error.message);
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: ({ courseId, teamId }: { courseId: CourseId, teamId: string }) =>
      deleteTeam(courseId, teamId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting team:", error.message);
    }
  });

  const addMembersMutation = useMutation({
    mutationFn: ({ courseId, teamId, memberIds }: { 
      courseId: CourseId, 
      teamId: string, 
      memberIds: UserId[] 
    }) => addTeamMembers(courseId, teamId, memberIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error adding members:", error.message);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ courseId, teamId, memberId }: { 
      courseId: CourseId, 
      teamId: TeamId, 
      memberId: UserId 
    }) => removeTeamMember(courseId, teamId, memberId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error removing member:", error.message);
    }
  });



  const updateTeamInfoMutation = useMutation({
    mutationFn: ({ courseId, teamId, teamData }: { 
      courseId: CourseId, 
      teamId: TeamId, 
      teamData: {
        name?: string;
        description?: string;
        maxMembers?: number;
        active?: boolean;
      }
    }) => updateTeamInfo(courseId, teamId, teamData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamId) 
      });
      // Also invalidate the old team name if it was changed
      if (variables.teamData.name && variables.teamData.name !== variables.teamId) {
        queryClient.invalidateQueries({ 
          queryKey: teamKeys.detail(variables.courseId, variables.teamData.name) 
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error updating team info:", error.message);
    }
  });

 

 return {
    createTeam: createTeamMutation,
    updateTeam: updateTeamMutation,
    deleteTeam: deleteTeamMutation,
    addMembers: addMembersMutation,
    removeMember: removeMemberMutation,
    updateTeamInfo: updateTeamInfoMutation,
  };
}

/**
 * Custom hook for managing team form state
 */
export function useTeamForm(initialData?: Team) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    maxMembers: initialData?.maxMembers || 4,
    active: initialData?.active ?? true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        maxMembers: initialData.maxMembers,
        active: initialData.active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        maxMembers: 4,
        active: true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [id]: type === 'number' ? parseInt(value) || 1 : value 
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      maxMembers: 4,
      active: true,
    });
  };

  return {
    formData,
    handleChange,
    resetForm,
    setFormData
  };
}

