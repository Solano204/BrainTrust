"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CourseId, UserId } from "@/app/domain/valueObjects/CourseValues";
import { Team, TeamWithIds } from "@/app/domain/entities/CourseEntities";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface GroupMemberDTO {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface StudentGroupDTO {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  description: string;
  members: GroupMemberDTO[];
  memberCount: number;
  createdAt: string;
  active: boolean;
}

export interface UserWithoutGroupDTO {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  studentRefId: string;
}

export interface CreateStudentGroupWithMembersCommand {
  courseId: string;
  name: string;
  description: string;
  memberIds: string[];
}

export interface CreateStudentGroupCommand {
  courseId: string;
  name: string;
  description: string;
}

export interface AddMemberToGroupCommand {
  groupId: string;
  studentId: string;
}

export interface TeamsResponse {
  teams: Team[];
  totalCount: number;
}

export interface TeamResponse {
  team: Team;
}

export interface AvailableUser {
  id: UserId;
  name: string;
  email: string;
}

export interface AvailableUsersResponse {
  users: AvailableUser[];
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", errorMessage);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      redirect("/courses");
    }
    
    throw new Error(errorMessage);
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error("An unexpected error occurred");
};

const mapStudentGroupDTOToTeam = (dto: StudentGroupDTO): Team => {

  return {
    teamId: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    description: dto.description || "",
    members: new Set(dto.members),
    active: dto.active,
    createdAt: new Date(dto.createdAt)
  };
};

const mapUserWithoutGroupToAvailableUser = (user: UserWithoutGroupDTO): AvailableUser => {
  return {
    id: user.userId,
    name: user.fullName,
    email: user.email
  };
};

export async function fetchTeamsByCourse(courseId: CourseId): Promise<TeamsResponse> {
  try {
    if (!courseId) throw new Error("Course ID is required");
    
    const response = await apiClient.get<StudentGroupDTO[]>(`/api/groups/course/${courseId}`);
    const teams = response.data.map(dto => mapStudentGroupDTOToTeam(dto));
    
    return {
      teams,
      totalCount: teams.length,
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchTeamById(groupId: string): Promise<Team> {
  try {
    if (!groupId) throw new Error("Group ID is required");
    
    const response = await apiClient.get<StudentGroupDTO>(`/api/groups/${groupId}`);
    return mapStudentGroupDTOToTeam(response.data);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function getUserTeam(userId: UserId): Promise<Team | null> {
  try {
    if (!userId) throw new Error("User ID is required");
    
    const response = await apiClient.get<StudentGroupDTO[]>(`/api/groups/user/${userId}`);
    
    if (response.data && response.data.length > 0) {
      return mapStudentGroupDTOToTeam(response.data[0]);
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user team:", error);
    return null;
  }
}

export async function createTeam(teamData: Omit<TeamWithIds, "teamId" | "createdAt">): Promise<TeamResponse> {
  try {
    const command: CreateStudentGroupWithMembersCommand = {
      courseId: teamData.courseId,
      name: teamData.name,
      description: teamData.description,
      memberIds: Array.from(teamData.members || []).map(member => member)
    };
    
    const response = await apiClient.post<string>("/api/groups/with-members", command);
    const teamId = response.data;
    
    const createdTeam = await fetchTeamById(teamId);
    
    return {
      team: createdTeam
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function createEmptyTeam(courseId: CourseId, name: string, description: string): Promise<string> {
  try {
    const command: CreateStudentGroupCommand = {
      courseId,
      name,
      description
    };
    
    const response = await apiClient.post<string>("/api/groups", command);
    return response.data; // Returns groupId
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function addSingleMember(groupId: string, studentId: UserId): Promise<void> {
  try {
    const command: AddMemberToGroupCommand = {
      groupId,
      studentId
    };
    
    await apiClient.post(`/api/groups/${groupId}/members`, command);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function addTeamMembers(
  courseId: CourseId,
  teamId: string,
  memberIds: UserId[]
): Promise<TeamResponse> {
  try {
    await apiClient.post(
      `/api/groups/${teamId}/members/bulk-add`,
      memberIds,
      {
        params: { courseId }
      }
    );
    
    const updatedTeam = await fetchTeamById(teamId);
    
    return {
      team: updatedTeam
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function removeTeamMember(
  courseId: CourseId,
  teamId: string,
  memberId: UserId
): Promise<TeamResponse> {
  try {
    await apiClient.delete(`/api/groups/${teamId}/members/${memberId}`);
    
    const updatedTeam = await fetchTeamById(teamId);
    
    return {
      team: updatedTeam
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function bulkRemoveMembers(
  courseId: CourseId,
  teamId: string,
  memberIds: UserId[]
): Promise<TeamResponse> {
  try {
    await apiClient.delete(
      `/api/groups/${teamId}/members/bulk-remove`,
      {
        params: { courseId },
        data: memberIds
      }
    );
    
    const updatedTeam = await fetchTeamById(teamId);
    
    return {
      team: updatedTeam
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function deleteTeam(courseId: CourseId, teamId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/groups/${teamId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchAvailableUsers(courseId: CourseId): Promise<AvailableUsersResponse> {
  try {
    if (!courseId) throw new Error("Course ID is required");
    
    const response = await apiClient.get<UserWithoutGroupDTO[]>(
      `/api/groups/course/${courseId}/users-without-group`
    );
    
    const users = response.data.map(user => mapUserWithoutGroupToAvailableUser(user));
    
    return {
      users
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function checkStudentsInGroups(
  courseId: CourseId,
  studentIds: UserId[]
): Promise<UserId[]> {
  try {
    const response = await apiClient.post<string[]>(
      `/api/groups/course/${courseId}/check-students-in-groups`,
      studentIds
    );
    
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function updateTeamInfo(
  courseId: CourseId,
  teamId: string,
  updates: {
    name?: string;
    description?: string;
    active?: boolean;
  }
): Promise<TeamResponse> {
  try {
    if (!teamId) throw new Error("Team ID is required");
    
    const updateRequest = {
      name: updates.name,
      description: updates.description
    };
    
    await apiClient.put(
      `/api/groups/${teamId}/info`,
      updateRequest
    );
    
    const updatedTeam = await fetchTeamById(teamId);
    
    return {
      team: updatedTeam
    };
  } catch (error) {
    return await handleApiError(error);
  }
}