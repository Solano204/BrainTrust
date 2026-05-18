"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamKeys } from "@/app/infraestructure/api/team/team-keys";
import { Team } from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import React from "react";

import { 
  AvailableUsersResponse, 
  fetchTeamsByCourse, 
  TeamsResponse, 
  fetchAvailableUsers, 
  createTeam, 
  deleteTeam, 
  updateTeamInfo, 
  addTeamMembers, 
  removeTeamMember, 
  getUserTeam,
  fetchTeamById
} from "../api/group";

export function useTeamById(teamId: string | null) {
  return useQuery<Team>({
    queryKey: teamKeys.detail(teamId || ""),
    queryFn: () => fetchTeamById(teamId!),
    enabled: !!teamId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useUserTeam(userId: UserId | null) {
  return useQuery<Team | null>({
    queryKey: teamKeys.userTeam(userId || ""),
    queryFn: () => getUserTeam(userId!),
    enabled: !!userId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useTeamsByCourse(courseId: CourseId | null) {
  return useQuery({
    queryKey: teamKeys.list(courseId || ""),
    queryFn: () => fetchTeamsByCourse(courseId!),
    enabled: !!courseId,
  });
}

export function useAvailableUsers(courseId: CourseId | null) {
  return useQuery({
    queryKey: teamKeys.availableUsersByCourse(courseId || ""),
    queryFn: () => fetchAvailableUsers(courseId!),
    enabled: !!courseId,


    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.availableUsersByCourse(variables.courseId) });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: ({ courseId, teamId }: { courseId: CourseId, teamId: string }) => deleteTeam(courseId, teamId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.availableUsersByCourse(variables.courseId) });
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: ({ courseId, teamId, memberIds }: { courseId: CourseId, teamId: string, memberIds: UserId[] }) => 
      addTeamMembers(courseId, teamId, memberIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.availableUsersByCourse(variables.courseId) });
      variables.memberIds.forEach(id => queryClient.invalidateQueries({ queryKey: teamKeys.userTeam(id) }));
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ courseId, teamId, memberId }: { courseId: CourseId, teamId: string, memberId: UserId }) => 
      removeTeamMember(courseId, teamId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.availableUsersByCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.userTeam(variables.memberId) });
    },
  });

  const updateTeamInfoMutation = useMutation({
    mutationFn: ({ courseId, teamId, updates }: { courseId: CourseId, teamId: string, updates: any }) => 
      updateTeamInfo(courseId, teamId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(variables.courseId) });
    },
  });

  return {
    createTeam: createTeamMutation,
    deleteTeam: deleteTeamMutation,
    addMembers: addMembersMutation,
    removeMember: removeMemberMutation,
    updateTeamInfo: updateTeamInfoMutation,
  };
}

export function useTeamForm(initialData?: Team) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    active: initialData?.active ?? true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        active: initialData.active ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
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