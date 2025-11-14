// File: src/app/features/courses/api/team-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CourseId, UnitId, UserId } from "@/app/domain/valueObjects/CourseValues";

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true;

// Mock team data
const MOCK_TEAMS: Team[] = [
  {
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

// Mock available users data
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

// Utility to simulate network delay for mock data
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --- API CLIENT CONFIGURATION (ONLY USED WHEN MOCKING IS DISABLED) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

/**
 * Error handling wrapper for API calls
 */
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// --- API FUNCTIONS WITH MOCKING LOGIC ---

/**
 * Fetch teams by course
 */
export async function fetchTeamsByCourse(courseId: CourseId): Promise<Team[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const teams = MOCK_TEAMS.filter(team => team.courseId === courseId);
    console.log(`MOCK: Returning ${teams.length} teams for course ${courseId}`);
    console.log("MOCK TEAMS DATA:", teams);
    return teams;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get(`/courses/${courseId}/teams`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch team by name
 */
export async function fetchTeamByName(courseId: CourseId, teamName: string): Promise<Team> {
  if (isMockEnabled) {
    await simulateDelay();
    const team = MOCK_TEAMS.find(
      team => team.courseId === courseId && team.name === teamName
    );
    if (!team) {
      console.error(`MOCK: Team ${teamName} not found in course ${courseId}`);
      throw new Error(`Team not found: ${teamName}`);
    }
    console.log(`MOCK: Returning team ${teamName} from course ${courseId}`);
    console.log("MOCK TEAM DATA:", team);
    return team;
  }

  try {
    if (!courseId || !teamName) throw new Error("Course ID and Team Name are required");
    const response = await apiClient.get(`/courses/${courseId}/teams/${encodeURIComponent(teamName)}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new team
 */
export async function createTeam(teamData: Omit<Team, "createdAt">): Promise<Team> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    // Check if team already exists
    const existingTeam = MOCK_TEAMS.find(
      team => team.courseId === teamData.courseId && team.name === teamData.name
    );
    
    if (existingTeam) {
      console.error(`MOCK: Team ${teamData.name} already exists in course ${teamData.courseId}`);
      throw new Error(`Team already exists: ${teamData.name}`);
    }

    const newTeam: Team = {
      ...teamData,
      createdAt: new Date(),
      logo: teamData.logo || `https://placehold.co/100x100/6B7280/FFFFFF?text=${encodeURIComponent(teamData.name)}`
    };

    MOCK_TEAMS.push(newTeam);
    console.log("MOCK: Created new team");
    console.log("CREATED TEAM DATA:", newTeam);
    return newTeam;
  }

  try {
    const response = await apiClient.post("/teams", teamData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing team
 */
export async function updateTeam(
  courseId: CourseId,
  teamName: string,
  teamData: Partial<Omit<Team, "courseId" | "name" | "createdAt">>
): Promise<Team> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      console.error(`MOCK: Team ${teamName} not found in course ${courseId} for update`);
      throw new Error(`Team not found: ${teamName}`);
    }

    const originalTeam = MOCK_TEAMS[teamIndex];
    MOCK_TEAMS[teamIndex] = {
      ...originalTeam,
      ...teamData
    } as Team;

    console.log(`MOCK: Updated team ${teamName} in course ${courseId}`);
    console.log("ORIGINAL TEAM DATA:", originalTeam);
    console.log("UPDATED TEAM DATA:", MOCK_TEAMS[teamIndex]);
    return MOCK_TEAMS[teamIndex];
  }

  try {
    const response = await apiClient.put(
      `/courses/${courseId}/teams/${encodeURIComponent(teamName)}`, 
      teamData
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a team
 */
export async function deleteTeam(courseId: CourseId, teamName: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      console.error(`MOCK: Team ${teamName} not found in course ${courseId} for deletion`);
      throw new Error(`Team not found: ${teamName}`);
    }

    const deletedTeam = MOCK_TEAMS[teamIndex];
    MOCK_TEAMS.splice(teamIndex, 1);
    
    console.log(`MOCK: Deleted team ${teamName} from course ${courseId}`);
    console.log("DELETED TEAM DATA:", deletedTeam);
    return;
  }

  try {
    await apiClient.delete(`/courses/${courseId}/teams/${encodeURIComponent(teamName)}`);
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
): Promise<Team> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      console.error(`MOCK: Team ${teamName} not found in course ${courseId} for adding members`);
      throw new Error(`Team not found: ${teamName}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    
    // Check if adding members would exceed maxMembers
    if (team.members.size + memberIds.length > team.maxMembers) {
      console.error(`MOCK: Cannot add ${memberIds.length} members to team ${teamName}. Would exceed max members (${team.maxMembers})`);
      throw new Error(`Cannot add members: would exceed maximum team size`);
    }

    // Add new members
    memberIds.forEach(memberId => {
      team.members.add(memberId);
    });

    console.log(`MOCK: Added ${memberIds.length} members to team ${teamName}`);
    console.log("MEMBER IDs ADDED:", memberIds);
    console.log("UPDATED TEAM DATA:", team);
    return team;
  }

  try {
    const response = await apiClient.post(
      `/courses/${courseId}/teams/${encodeURIComponent(teamName)}/members`,
      { memberIds }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Remove member from team
 */
export async function removeTeamMember(
  courseId: CourseId,
  teamName: string,
  memberId: UserId
): Promise<Team> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      console.error(`MOCK: Team ${teamName} not found in course ${courseId} for removing member`);
      throw new Error(`Team not found: ${teamName}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    
    // Remove member
    team.members.delete(memberId);

    // If removed member was the leader, clear leaderId
    if (team.leaderId === memberId) {
      team.leaderId = null;
    }

    console.log(`MOCK: Removed member ${memberId} from team ${teamName}`);
    console.log("UPDATED TEAM DATA:", team);
    return team;
  }

  try {
    const response = await apiClient.delete(
      `/courses/${courseId}/teams/${encodeURIComponent(teamName)}/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Set team leader
 */
export async function setTeamLeader(
  courseId: CourseId,
  teamName: string,
  leaderId: UserId
): Promise<Team> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const teamIndex = MOCK_TEAMS.findIndex(
      team => team.courseId === courseId && team.name === teamName
    );

    if (teamIndex === -1) {
      console.error(`MOCK: Team ${teamName} not found in course ${courseId} for setting leader`);
      throw new Error(`Team not found: ${teamName}`);
    }

    const team = MOCK_TEAMS[teamIndex];
    
    // Verify that the leader is a member of the team
    if (!team.members.has(leaderId)) {
      console.error(`MOCK: User ${leaderId} is not a member of team ${teamName}`);
      throw new Error(`User is not a member of the team`);
    }

    const previousLeader = team.leaderId;
    team.leaderId = leaderId;

    console.log(`MOCK: Set team leader for ${teamName} to ${leaderId}`);
    console.log("PREVIOUS LEADER:", previousLeader);
    console.log("NEW LEADER:", leaderId);
    console.log("UPDATED TEAM DATA:", team);
    return team;
  }

  try {
    const response = await apiClient.patch(
      `/courses/${courseId}/teams/${encodeURIComponent(teamName)}/leader`,
      { leaderId }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch available users for course
 */
export async function fetchAvailableUsers(courseId: CourseId): Promise<any[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    // Get all enrolled students for the course (simplified logic)
    const enrolledStudents = MOCK_AVAILABLE_USERS.filter(user => 
      user.id.startsWith('student-') && !user.id.startsWith('student-math-')
    );
    
    console.log(`MOCK: Returning ${enrolledStudents.length} available users for course ${courseId}`);
    console.log("AVAILABLE USERS DATA:", enrolledStudents);
    return enrolledStudents;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/available-users`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Auto-generate teams
 */
export async function autoGenerateTeams(
  courseId: CourseId,
  teamSize: number,
  method: "random" | "balanced" = "random"
): Promise<Team[]> {
  if (isMockEnabled) {
    await simulateDelay(1500);
    
    // Get available users for the course
    const availableUsers = await fetchAvailableUsers(courseId);
    
    if (availableUsers.length === 0) {
      console.error(`MOCK: No available users found for course ${courseId}`);
      throw new Error("No available users to generate teams");
    }

    // Clear existing teams for this course
    const existingTeamsIndices = MOCK_TEAMS
      .map((team, index) => team.courseId === courseId ? index : -1)
      .filter(index => index !== -1);
    
    // Remove from highest index to lowest to avoid index issues
    existingTeamsIndices
      .sort((a, b) => b - a)
      .forEach(index => MOCK_TEAMS.splice(index, 1));

    // Generate new teams
    const newTeams: Team[] = [];
    const teamCount = Math.ceil(availableUsers.length / teamSize);

    for (let i = 0; i < teamCount; i++) {
      const startIdx = i * teamSize;
      const endIdx = startIdx + teamSize;
      const teamMembers = availableUsers.slice(startIdx, endIdx);
      
      const teamName = `Team ${String.fromCharCode(65 + i)}`; // Team A, Team B, etc.
      
      const newTeam: Team = {
        courseId,
        name: teamName,
        description: `Auto-generated ${method} team`,
        leaderId: teamMembers[0]?.id || null,
        members: new Set(teamMembers.map(user => user.id)),
        maxMembers: teamSize + 1, // Allow some flexibility
        active: true,
        createdAt: new Date(),
        logo: `https://placehold.co/100x100/${method === 'random' ? '8B5CF6' : '059669'}/FFFFFF?text=${encodeURIComponent(teamName)}`
      };

      MOCK_TEAMS.push(newTeam);
      newTeams.push(newTeam);
    }

    console.log(`MOCK: Auto-generated ${newTeams.length} teams for course ${courseId} using ${method} method`);
    console.log("AUTO-GENERATED TEAMS DATA:", newTeams);
    return newTeams;
  }

  try {
    const response = await apiClient.post(`/courses/${courseId}/teams/auto-generate`, {
      teamSize,
      method
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}



/**
 * Update team basic information (name, description, maxMembers, active status)
 */
export async function updateTeamInfo(
  courseId: CourseId,
  teamName: string,
  teamData: {
    name?: string;
    description?: string;
    maxMembers?: number;
    active?: boolean;
  }
): Promise<Team> {
  try {
    const response = await apiClient.patch(`/courses/${courseId}/teams/${encodeURIComponent(teamName)}/info`, teamData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update team member limit
 */
export async function updateTeamMemberLimit(
  courseId: CourseId,
  teamName: string,
  maxMembers: number
): Promise<Team> {
  try {
    const response = await apiClient.patch(`/courses/${courseId}/teams/${encodeURIComponent(teamName)}/member-limit`, {
      maxMembers
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update multiple team properties at once
 */
export async function updateTeamProperties(
  courseId: CourseId,
  teamName: string,
  updates: {
    name?: string;
    description?: string;
    maxMembers?: number;
    active?: boolean;
    leaderId?: UserId | null;
  }
): Promise<Team> {
  try {
    // const response = await apiClient.put(`/courses/${courseId}/teams/${encodeURIComponent(teamName)}`, updates);
    // return response.data;
    console.log(`MOCK: Updating team ${teamName} in course ${courseId} with updates:`, updates);
    return Promise.resolve({ ...updates, courseId, name: teamName } as Team); // Placeholder until integrated with team-api.ts
  } catch (error) {
    return handleApiError(error);
  }
}



export interface Team {
  courseId: CourseId;
  name: string;
  description: string;
  leaderId: UserId | null;
  members: Set<UserId>;
  maxMembers: number;
  active: boolean;
  createdAt: Date;
  logo?: string; // Added logo field
}