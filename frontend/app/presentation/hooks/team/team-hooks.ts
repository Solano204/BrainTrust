// File: src/app/features/courses/hooks/team-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamKeys } from "@/app/infraestructure/api/team/team-keys";
import {
  fetchTeamsByCourse,
  fetchTeamByName,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMembers,
  removeTeamMember,
  setTeamLeader,
  fetchAvailableUsers,
  autoGenerateTeams,
  updateTeamProperties,
  updateTeamMemberLimit,
  updateTeamInfo
} from "@/app/infraestructure/api/team/team-api";
import { Team} from "@/app/domain/entities/CourseEntities";
import { CourseId , UserId} from "@/app/domain/valueObjects";
import React from "react";

/**
 * Custom hook for fetching teams by course
 */
export function useTeamsByCourse(courseId: CourseId | null) {
  return useQuery<Team[]>({
    queryKey: teamKeys.list(courseId || ""),
    queryFn: () => fetchTeamsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single team
 */
export function useTeam(courseId: CourseId | null, teamName: string | null) {
  return useQuery<Team>({
    queryKey: teamKeys.detail(courseId || "", teamName || ""),
    queryFn: () => fetchTeamByName(courseId!, teamName!),
    enabled: !!courseId && !!teamName,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching available users
 */
export function useAvailableUsers(courseId: CourseId | null) {
  return useQuery<any[]>({
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
        queryKey: teamKeys.list(data.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating team:", error.message);
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ courseId, teamName, teamData }: { 
      courseId: CourseId, 
      teamName: string, 
      teamData: Partial<Omit<Team, "courseId" | "name" | "createdAt">> 
    }) => updateTeam(courseId, teamName, teamData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating team:", error.message);
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: ({ courseId, teamName }: { courseId: CourseId, teamName: string }) =>
      deleteTeam(courseId, teamName),
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
    mutationFn: ({ courseId, teamName, memberIds }: { 
      courseId: CourseId, 
      teamName: string, 
      memberIds: UserId[] 
    }) => addTeamMembers(courseId, teamName, memberIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
    },
    onError: (error: Error) => {
      console.error("Error adding members:", error.message);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ courseId, teamName, memberId }: { 
      courseId: CourseId, 
      teamName: string, 
      memberId: UserId 
    }) => removeTeamMember(courseId, teamName, memberId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
    },
    onError: (error: Error) => {
      console.error("Error removing member:", error.message);
    }
  });

  const setLeaderMutation = useMutation({
    mutationFn: ({ courseId, teamName, leaderId }: { 
      courseId: CourseId, 
      teamName: string, 
      leaderId: UserId 
    }) => setTeamLeader(courseId, teamName, leaderId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
    },
    onError: (error: Error) => {
      console.error("Error setting team leader:", error.message);
    }
  });

  const autoGenerateTeamsMutation = useMutation({
    mutationFn: ({ courseId, teamSize, method }: { 
      courseId: CourseId, 
      teamSize: number, 
      method: "random" | "balanced" 
    }) => autoGenerateTeams(courseId, teamSize, method),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error auto-generating teams:", error.message);
    }
  });


  const updateTeamInfoMutation = useMutation({
    mutationFn: ({ courseId, teamName, teamData }: { 
      courseId: CourseId, 
      teamName: string, 
      teamData: {
        name?: string;
        description?: string;
        maxMembers?: number;
        active?: boolean;
      }
    }) => updateTeamInfo(courseId, teamName, teamData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
      // Also invalidate the old team name if it was changed
      if (variables.teamData.name && variables.teamData.name !== variables.teamName) {
        queryClient.invalidateQueries({ 
          queryKey: teamKeys.detail(variables.courseId, variables.teamData.name) 
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error updating team info:", error.message);
    }
  });

  const updateTeamMemberLimitMutation = useMutation({
    mutationFn: ({ courseId, teamName, maxMembers }: { 
      courseId: CourseId, 
      teamName: string, 
      maxMembers: number 
    }) => updateTeamMemberLimit(courseId, teamName, maxMembers),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating team member limit:", error.message);
    }
  });

  const updateTeamPropertiesMutation = useMutation({
    mutationFn: ({ courseId, teamName, updates }: { 
      courseId: CourseId, 
      teamName: string, 
      updates: {
        name?: string;
        description?: string;
        maxMembers?: number;
        active?: boolean;
        leaderId?: UserId | null;
      }
    }) => updateTeamProperties(courseId, teamName, updates),

    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.list(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: teamKeys.detail(variables.courseId, variables.teamName) 
      });
      
      // Also invalidate the old team name if it was changed
      if (variables.updates.name && variables.updates.name !== variables.teamName) {
        queryClient.invalidateQueries({ 
          queryKey: teamKeys.detail(variables.courseId, variables.updates.name) 
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error updating team properties:", error.message);
    }
  });

 return {
    createTeam: createTeamMutation,
    updateTeam: updateTeamMutation,
    deleteTeam: deleteTeamMutation,
    addMembers: addMembersMutation,
    removeMember: removeMemberMutation,
    setLeader: setLeaderMutation,
    autoGenerateTeams: autoGenerateTeamsMutation,
    updateTeamInfo: updateTeamInfoMutation,
    updateTeamMemberLimit: updateTeamMemberLimitMutation,
    updateTeamProperties: updateTeamPropertiesMutation
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

