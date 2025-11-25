// File: src/app/features/courses/api/team-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CourseId, UserId } from "@/app/domain/valueObjects/CourseValues";

// =====================================================
// CONFIGURATION
// =====================================================

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_TEAMS: Team[] = [
  {
    teamId: "team-1",
    courseId: "crs-101",
    name: "JavaScript Ninjas",
    description: "Team for advanced JavaScript projects and collaboration",
    leaderId: "student-1",
    members: new Set(["student-1", "student-2", "student-3", "student-4"]),
    maxMembers: 5,
    active: true,
    createdAt: new Date("2024-01-15"),
    logo: "https://placehold.co/100x100/4F46E5/FFFFFF?text=JS+Ninjas"
  },
  {
    teamId: "team-2",
    courseId: "crs-101",
    name: "Code Beginners",
    description: "Support group for students new to programming",
    leaderId: "student-5",
    members: new Set(["student-5", "student-6", "student-7"]),
    maxMembers: 4,
    active: true,
    createdAt: new Date("2024-01-16"),
    logo: "https://placehold.co/100x100/10B981/FFFFFF?text=Beginners"
  },
  {
    teamId: "team-3",
    courseId: "crs-202",
    name: "Math Wizards",
    description: "Advanced mathematics study group",
    leaderId: "student-math-1",
    members: new Set(["student-math-1", "student-math-2", "student-math-3"]),
    maxMembers: 6,
    active: true,
    createdAt: new Date("2024-01-10"),
    logo: "https://placehold.co/100x100/EF4444/FFFFFF?text=Math+Wiz"
  },
  {
    teamId: "team-4",
    courseId: "crs-202",
    name: "Algebra Alliance",
    description: "Focused on linear algebra concepts",
    leaderId: null,
    members: new Set(["student-math-4", "student-math-5"]),
    maxMembers: 4,
    active: false,
    createdAt: new Date("2024-01-12"),
    logo: "https://placehold.co/100x100/F59E0B/FFFFFF?text=Algebra"
  }
];

const MOCK_AVAILABLE_USERS = [
  { id: "student-1", name: "Alice Johnson", email: "alice@university.edu" },
  { id: "student-2", name: "Bob Smith", email: "bob@university.edu" },
  { id: "student-3", name: "Carol Davis", email: "carol@university.edu" },
  { id: "student-4", name: "David Wilson", email: "david@university.edu" },
  { id: "student-5", name: "Eva Brown", email: "eva@university.edu" },
  { id: "student-6", name: "Frank Miller", email: "frank@university.edu" },
  { id: "student-7", name: "Grace Lee", email: "grace@university.edu" },
  { id: "student-8", name: "Henry Taylor", email: "henry@university.edu" },
  { id: "student-math-1", name: "Ivan Chen", email: "ivan@university.edu" },
  { id: "student-math-2", name: "Julia Martinez", email: "julia@university.edu" },
  { id: "student-math-3", name: "Kevin Anderson", email: "kevin@university.edu" },
  { id: "student-math-4", name: "Lisa Garcia", email: "lisa@university.edu" },
  { id: "student-math-5", name: "Mike Thompson", email: "mike@university.edu" }
];

// =====================================================
// UTILITIES
// =====================================================

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

// =====================================================
// UPDATED ERROR HANDLER WITH BETTER TYPING
// =====================================================

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data as ErrorResponseDTO;
    const errorMessage = errorResponse?.message || error.message;
    console.error("API Error:", errorMessage);
    
    // Don't redirect for team-specific errors, only for auth errors
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
// =====================================================
// BACKEND DTO INTERFACES
// =====================================================

export interface GroupMemberDTO {
  userId: UserId;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface StudentGroupDTO {
  id: string;
  courseId: CourseId;
  courseName: string;
  name: string;
  description: string;
  members: GroupMemberDTO[];
  memberCount: number;
  createdAt: string;
  active: boolean;
}

export interface CourseEnrollmentDTO {
  studentId: UserId;
  studentName: string;
  email?: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface ErrorResponseDTO {
  success: false;
  message: string;
  error: string;
  timestamp: string;
}

// =====================================================
// COMMAND INTERFACES
// =====================================================

export interface CreateStudentGroupWithMembersCommand {
  courseId: CourseId;
  name: string;
  description: string;
  memberIds: UserId[];
}

export interface AddGroupMemberCommand {
  groupId: string;
  studentId: UserId;
}

export interface UpdateStudentGroupCommand {
  groupId: string;
  name?: string;
  description?: string;
  active?: boolean;
}

export interface AutoGenerateTeamsCommand {
  courseId: CourseId;
  teamSize: number;
  method: 'RANDOM' | 'BALANCED' | 'SKILL_BASED';
  options?: {
    preserveExisting?: boolean;
    considerSkills?: boolean;
    maxTeams?: number;
  };
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface TeamsResponse {
  teams: Team[];
  totalCount: number;
}

export interface TeamResponse {
  team: Team;
  members: AvailableUser[];
}

export interface AvailableUsersResponse {
  users: AvailableUser[];
}

export interface AutoGenerationResult {
  generatedTeams: number;
  totalMembersAssigned: number;
  teams: Team[];
  warnings: string[];
}

// =====================================================
// UPDATED MAPPERS WITH EXPLICIT TYPES
// =====================================================

/**
 * Maps backend StudentGroupDTO to frontend Team interface
 */
const mapStudentGroupDTOToTeam = (dto: StudentGroupDTO): Team => {
  const members = new Set<UserId>(dto.members.map(member => member.userId));

  return {
    teamId: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    description: dto.description || "",
    members: members,
  };
};

/**
 * Maps Team to backend CreateStudentGroupWithMembersCommand
 */
const mapTeamToCreateCommand = (team: Omit<Team, "createdAt">): CreateStudentGroupWithMembersCommand => {
  return {
    courseId: team.courseId,
    name: team.name,
    description: team.description,
    memberIds: Array.from(team.members)
  };
};

/**
 * Maps CourseEnrollmentDTO to AvailableUser
 */
const mapEnrollmentToAvailableUser = (enrollment: CourseEnrollmentDTO): AvailableUser => {
  return {
    id: enrollment.studentId,
    name: enrollment.studentName,
    email: enrollment.email || `${enrollment.studentName.toLowerCase().replace(' ', '.')}@university.edu`
  };
};

// =====================================================
// UPDATED API FUNCTIONS WITH EXPLICIT RETURN TYPES
// =====================================================

/**
 * Fetch teams by course
 */
export async function fetchTeamsByCourse(courseId: CourseId): Promise<TeamsResponse> {
  if (isMockEnabled) {
    await simulateDelay();
    const teams = MOCK_TEAMS.filter(team => team.courseId === courseId);
    console.log(`MOCK: Returning ${teams.length} teams for course ${courseId}`);
    
    return {
      teams,
      totalCount: teams.length,
    };
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get<StudentGroupDTO[]>(`/api/groups/course/${courseId}`);
    const teams = response.data.map(mapStudentGroupDTOToTeam);
    
    return {
      teams,
      totalCount: teams.length,
    };
  } catch (error) {
    return handleApiError(error);
  }
}


/**
 * Create a new team with members
 */
export async function createTeam(teamData: Omit<Team, "createdAt">): Promise<TeamResponse> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const existingTeam = MOCK_TEAMS.find(
      team => team.courseId === teamData.courseId && team.name === teamData.name
    );
    
    if (existingTeam) {
      throw new Error(`Team already exists: ${teamData.name}`);
    }

    const newTeam: Team = {
      ...teamData,
    };

    MOCK_TEAMS.push(newTeam);
    
    const members = MOCK_AVAILABLE_USERS.filter(user => 
      newTeam.members.has(user.id)
    );
    
    return {
      team: newTeam,
      members
    };
  }

  try {
    const command: CreateStudentGroupWithMembersCommand = mapTeamToCreateCommand(teamData);
    const response = await apiClient.post<SuccessResponseDTO>("/api/groups/with-members", command);
    
    return await fetchTeamByName(teamData.courseId, teamData.name);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Add members to team
 */
export async function addTeamMembers(
  courseId: CourseId,
  teamName: string,
  memberIds: UserId[]
): Promise<TeamResponse> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      throw new Error(`Team not found: ${teamName}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    
    memberIds.forEach(memberId => {
      team.members.add(memberId);
    });

    const members = MOCK_AVAILABLE_USERS.filter(user => 
      team.members.has(user.id) || memberIds.includes(user.id)
    );
    
    return {
      team,
      members
    };
  }

  try {
    const addMemberCommands: AddGroupMemberCommand[] = memberIds.map(memberId => ({
      groupId: teamName,
      studentId: memberId
    }));

    // Add each member
    for (const command of addMemberCommands) {
      await apiClient.post<SuccessResponseDTO>(`/api/groups/${teamName}/members`, command);
    }
    
    return await fetchTeamById(courseId, teamName);
  } catch (error) {
    return handleApiError(error);
  }
}




/**
 * Delete a team
 * Backend: DELETE /api/groups/{groupId}
 */
export async function deleteTeam(courseId: CourseId, teamName: string): Promise<SuccessResponseDTO> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      throw new Error(`Team not found: ${teamName}`);
    }

    MOCK_TEAMS.splice(teamIndex, 1);
    
    console.log(`MOCK: Deleted team ${teamName} from course ${courseId}`);
    
    return {
      success: true,
      message: `Team ${teamName} successfully deleted`,
      data: { courseId, teamName }
    };
  }

  try {
    // First get the team to find its ID (backend uses groupId which might be different from name)
    const teamsResponse = await fetchTeamsByCourse(courseId);
    const team = teamsResponse.teams.find(t => t.name === teamName);
    
    if (!team) {
      throw new Error(`Team not found: ${teamName}`);
    }
    
    // Use the team's ID for deletion (assuming backend uses ID, not name)
    const response = await apiClient.delete<SuccessResponseDTO>(`/api/groups/${teamName}`);
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Remove member from team
 * Backend: DELETE /api/groups/{groupId}/members/{studentId}
 */
export async function removeTeamMember(
  courseId: CourseId,
  teamId: String,
  memberId: UserId
): Promise<TeamResponse> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.teamId === teamId
    );

    if (teamIndex === -1) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    team.members.delete(memberId);

    console.log(`MOCK: Removed member ${memberId} from team ${teamId}`);
    
    const members = MOCK_AVAILABLE_USERS.filter(user => 
      team.members.has(user.id)
    );
    
    return {
      team,
      members
    };
  }

  try {
    await apiClient.delete<SuccessResponseDTO>(`/api/groups/${teamId}/members/${memberId}`);
    
    // Return updated team
    return await fetchTeamByName(courseId, teamId);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update team information (name, description, active status)
 * Backend: PUT /api/groups/{groupId}
 */
export async function updateTeamInfo(
  courseId: CourseId,
  teamId: string,
  updates: {
    name?: string;
    description?: string;
    active?: boolean;
  }
): Promise<TeamResponse> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.teamId === teamId
    );

    if (teamIndex === -1) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    
    // If updating name, check for conflicts
    if (updates.) {
      const nameExists = MOCK_TEAMS.some(
        t => t.courseId === courseId && t.teamId !== teamId
      );
      
      if (nameExists) {
        throw new Error(`Team name already exists: ${updates.name}`);
      }
    }

    // Apply updates
    if (updates.name) team.name = updates.name;
    if (updates.description !== undefined) team.description = updates.description;

    console.log(`MOCK: Updated team ${teamId} info:`, updates);
    
    const members = MOCK_AVAILABLE_USERS.filter(user => 
      team.members.has(user.id)
    );
    
    return {
      team,
      members
    };
  }

  try {
    const command: UpdateStudentGroupCommand = {
      groupId: teamId, // Using team name as groupId, adjust if backend uses different ID
      ...updates
    };

    const response = await apiClient.put<SuccessResponseDTO>(`/api/groups/${teamId}`, command);
    
    // Return updated team
    const updatedTeamName = updates.name || teamId;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Bulk update team properties
 * Extended version that can handle multiple property updates at once
 */
export async function updateTeamProperties(
  courseId: CourseId,
  teamId: TeamId,
  updates: {
    name?: string;
    description?: string;
    maxMembers?: number;
    active?: boolean;
    leaderId?: UserId | null;
  }
): Promise<TeamResponse> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.teamId === teamId
    );

    if (teamIndex === -1) {
      throw new Error(`Team not found: ${teamId}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    
    // Validate name change

    // Validate leader assignment
    if (updates.leaderId && !team.members.has(updates.leaderId)) {
      throw new Error(`Cannot set leader: user ${updates.leaderId} is not a team member`);
    }

    // Validate member limit
    if (updates.maxMembers && updates.maxMembers < team.members.size) {
      throw new Error(`Cannot set max members to ${updates.maxMembers}: team currently has ${team.members.size} members`);
    }

    // Apply all updates
    Object.assign(team, updates);

    console.log(`MOCK: Updated team ${teamId} properties:`, updates);
    
    const members = MOCK_AVAILABLE_USERS.filter(user => 
      team.members.has(user.id)
    );
    
    return {
      team,
      members
    };
  }

  try {
    // For backend, we might need to make multiple calls or have a bulk update endpoint
    // For now, we'll handle basic updates through updateTeamInfo
    const { leaderId, maxMembers, ...basicUpdates } = updates;
    
    let updatedTeam = await updateTeamInfo(courseId, teamId, basicUpdates);
    
    // Handle additional updates if needed
    // Note: Backend might not support leaderId or maxMembers yet
    
    return updatedTeam;
  } catch (error) {
    return handleApiError(error);
  }
}


/**
 * Fetch available users for course (users not in any team)
 * Backend: GET /api/courses/{courseId}/enrollments/available
 */
export async function fetchAvailableUsers(courseId: CourseId): Promise<AvailableUsersResponse> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const enrolledStudents = MOCK_AVAILABLE_USERS.filter(user => 
      user.id.startsWith('student-') && !user.id.startsWith('student-math-')
    );
    
    // Filter out users already in teams for this course
    const teamMembers = new Set<UserId>();
    MOCK_TEAMS
      .filter(team => team.courseId === courseId)
      .forEach(team => {
        team.members.forEach(memberId => teamMembers.add(memberId));
      });
    
    const availableUsers = enrolledStudents.filter(user => !teamMembers.has(user.id));
    
    return {
      users: availableUsers,
    };
  }

  try {
    // Use the dedicated available enrollments endpoint
    const response = await apiClient.get<CourseEnrollmentDTO[]>(`/api/courses/${courseId}/enrollments/available`);
    
    // The backend should already return only available (not in teams) active users
    const availableUsers = response.data
      .filter(enrollment => enrollment.status === 'ACTIVE')
      .map(mapEnrollmentToAvailableUser);
    
    return {
      users: availableUsers,
    };
  } catch (error) {
    return handleApiError(error);
  }
}


// =====================================================
// INTERFACES
// =====================================================
export type TeamId = string;
export interface Team {
  teamId: TeamId;
  courseId: CourseId;
  name: string;
  description: string;
  members: Set<UserId>;
}

export interface AvailableUser {
  id: UserId;
  name: string;
  email: string;
}

export interface GroupMemberDTO {
  userId: UserId;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface StudentGroupDTO {
  id: string;
  courseId: CourseId;
  courseName: string;
  name: string;
  description: string;
  members: GroupMemberDTO[];
  memberCount: number;
  createdAt: string;
  active: boolean;
}