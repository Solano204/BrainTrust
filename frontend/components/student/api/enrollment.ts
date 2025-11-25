// File: src/app/features/courses/api/student-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Enrollment } from "@/app/domain/entities/CourseEntities";
import { User } from "@/app/domain/entities/IdentityEntities";
import { CourseId, EnrollmentStatus, UserId } from "@/app/domain/valueObjects";

// ============================================
// CONFIGURATION
// ============================================

const isMockEnabled = true;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ============================================
// BACKEND DTO TYPES
// ============================================

interface EnrollmentDTO {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
}

interface UserDTO {
  id: string;
  personId: string;
  email: string;
  role: string;
  active: boolean;
  person: PersonDTO;
}

interface PersonDTO {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  registrationDate: string;
  imagePath: string;
  address: AddressDTO | null;
}

interface AddressDTO {
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

interface EnrollStudentRequest {
  studentId: string;
}

interface BulkEnrollRequest {
  studentIds: string[];
}

interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

interface EnrollmentStatsDTO {
  total: number;
  active: number;
  cancelled: number;
  averageGrade: number;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_USERS: User[] = [
  {
    id: "student-1",
    personId: "person-1",
    email: "alice.johnson@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-1",
      firstName: "Alice",
      lastName: "Johnson",
      gender: "FEMALE",
      phone: "+1-555-0101",
      registrationDate: "2023-08-15",
      imagePath: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      address: null
    }
  },
  {
    id: "student-2",
    personId: "person-2",
    email: "bob.smith@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-2",
      firstName: "Bob",
      lastName: "Smith",
      gender: "MALE",
      phone: "+1-555-0102",
      registrationDate: "2023-08-16",
      imagePath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      address: null
    }
  },
  {
    id: "student-3",
    personId: "person-3",
    email: "carol.davis@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-3",
      firstName: "Carol",
      lastName: "Davis",
      gender: "FEMALE",
      phone: "+1-555-0103",
      registrationDate: "2023-08-17",
      imagePath: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      address: null
    }
  }
];

const MOCK_ENROLLMENTS: (Enrollment & { user: User })[] = [
  {
    id: "enr-101-1",
    courseId: "crs-101",
    studentId: "student-1",
    enrollmentDate: "2024-01-15",
    status: "ACTIVE",
    user: MOCK_USERS[0]
  },
  {
    id: "enr-101-2",
    courseId: "crs-101",
    studentId: "student-2",
    enrollmentDate: "2024-01-15",
    status: "ACTIVE",
    user: MOCK_USERS[1]
  }
];

// ============================================
// UTILITIES
// ============================================

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

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// ============================================
// MAPPERS
// ============================================

function mapEnrollmentFromBackend(dto: EnrollmentDTO, user?: User): Enrollment & { user: User } {
  return {
    id: dto.id,
    courseId: dto.courseId,
    studentId: dto.studentId,
    enrollmentDate: dto.enrollmentDate,
    status: dto.status,
    user: user || {
      id: dto.studentId,
      personId: "",
      email: "",
      role: "STUDENT",
      active: true,
      person: {
        id: "",
        firstName: dto.studentName.split(' ')[0] || "",
        lastName: dto.studentName.split(' ')[1] || "",
        gender: "",
        phone: "",
        registrationDate: "",
        imagePath: "",
        address: null
      }
    }
  };
}

function mapUserFromBackend(dto: UserDTO): User {
  return {
    id: dto.id,
    personId: dto.personId,
    email: dto.email,
    role: dto.role,
    active: dto.active,
    person: {
      id: dto.person.id,
      firstName: dto.person.firstName,
      lastName: dto.person.lastName,
      gender: dto.person.gender,
      phone: dto.person.phone,
      registrationDate: dto.person.registrationDate,
      imagePath: dto.person.imagePath,
      address: dto.person.address
    }
  };
}

function mapEnrollStudentToBackendCommand(studentId: string): EnrollStudentRequest {
  return {
    studentId
  };
}

function mapBulkEnrollToBackendCommand(studentIds: string[]): BulkEnrollRequest {
  return {
    studentIds
  };
}

// ============================================
// API FUNCTIONS (OPTIMIZED VERSION)
// ============================================

export async function fetchEnrollmentsByCourse(courseId: CourseId): Promise<(Enrollment & { user: User })[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const enrollments = MOCK_ENROLLMENTS.filter(enrollment => enrollment.courseId === courseId);
    
    console.log(`MOCK: Returning ${enrollments.length} enrollments for course ${courseId}`);
    return enrollments;
  }

  try {
    // First get enrollments for the specific course
    const enrollmentsResponse = await apiClient.get<EnrollmentDTO[]>(`/api/courses/${courseId}/enrollments`);
    const enrollments = enrollmentsResponse.data;
    
    if (enrollments.length === 0) {
      return [];
    }

    // Extract all student IDs from enrollments
    const studentIds = enrollments.map(enrollment => enrollment.studentId);
    
    // Get all users in a single batch call
    const users = await fetchUsersByIds(studentIds);
    const userMap = new Map(users.map(user => [user.id, user]));

    // Map enrollments with their corresponding users
    const enrollmentsWithUsers = enrollments.map(enrollment => 
      mapEnrollmentFromBackend(enrollment, userMap.get(enrollment.studentId))
    );
    
    return enrollmentsWithUsers;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createEnrollment(enrollmentData: {
  courseId: CourseId;
  studentId: UserId;
  enrollmentDate?: string;
}): Promise<Enrollment & { user: User }> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const existingEnrollment = MOCK_ENROLLMENTS.find(
      enrollment => enrollment.courseId === enrollmentData.courseId && enrollment.studentId === enrollmentData.studentId
    );
    
    if (existingEnrollment) {
      throw new Error("Student is already enrolled in this course");
    }

    const user = MOCK_USERS.find(user => user.id === enrollmentData.studentId);
    if (!user) {
      throw new Error(`User not found: ${enrollmentData.studentId}`);
    }

    const newEnrollment: Enrollment & { user: User } = {
      id: `enr-${Date.now()}`,
      courseId: enrollmentData.courseId,
      studentId: enrollmentData.studentId,
      enrollmentDate: enrollmentData.enrollmentDate || new Date().toISOString().split('T')[0],
      status: "ACTIVE",
      user: user
    };

    MOCK_ENROLLMENTS.push(newEnrollment);
    
    console.log("MOCK: Created new enrollment");
    return newEnrollment;
  }

  try {
    const backendCommand: EnrollStudentRequest = mapEnrollStudentToBackendCommand(enrollmentData.studentId);
    const response = await apiClient.post<SuccessResponseDTO>(`/api/courses/${enrollmentData.courseId}/enrollments`, backendCommand);
    
    // Fetch the created enrollment to get full details
    const enrollmentId = response.data.data;
    
    // Get user details
    const user = await fetchUserById(enrollmentData.studentId);
    
    const newEnrollment: Enrollment & { user: User } = {
      id: enrollmentId,
      courseId: enrollmentData.courseId,
      studentId: enrollmentData.studentId,
      enrollmentDate: enrollmentData.enrollmentDate || new Date().toISOString().split('T')[0],
      status: "ACTIVE",
      user
    };
    
    return newEnrollment;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function bulkEnrollStudents(
  courseId: CourseId,
  studentIds: UserId[]
): Promise<(Enrollment & { user: User })[]> {
  if (isMockEnabled) {
    await simulateDelay(1200);
    
    const newEnrollments: (Enrollment & { user: User })[] = [];
    const errors: string[] = [];

    for (const studentId of studentIds) {
      // Check if already enrolled
      const existingEnrollment = MOCK_ENROLLMENTS.find(
        enrollment => enrollment.courseId === courseId && enrollment.studentId === studentId
      );

      if (existingEnrollment) {
        errors.push(`Student ${studentId} is already enrolled`);
        continue;
      }

      // Find the user
      const user = MOCK_USERS.find(user => user.id === studentId);
      if (!user) {
        errors.push(`User ${studentId} not found`);
        continue;
      }

      const newEnrollment: Enrollment & { user: User } = {
        id: `enr-bulk-${Date.now()}-${studentId}`,
        courseId,
        studentId,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: "ACTIVE",
        user
      };

      MOCK_ENROLLMENTS.push(newEnrollment);
      newEnrollments.push(newEnrollment);
    }

    if (errors.length > 0) {
      console.warn(`MOCK: Bulk enrollment completed with ${errors.length} errors`);
    }

    console.log(`MOCK: Bulk enrolled ${newEnrollments.length} students to course ${courseId}`);
    return newEnrollments;
  }

  try {
    // Simulate bulk enrollment call - backend should handle the logic
    const backendCommand: BulkEnrollRequest = mapBulkEnrollToBackendCommand(studentIds);
    const response = await apiClient.post<SuccessResponseDTO>(`/api/courses/${courseId}/enrollments/bulk`, backendCommand);
    
    // In a real implementation, the backend would return the created enrollments
    // For now, simulate by fetching the updated enrollments
    return await fetchEnrollmentsByCourse(courseId);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteEnrollment(courseId: CourseId, studentId: UserId): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const enrollmentIndex = MOCK_ENROLLMENTS.findIndex(
      enrollment => enrollment.courseId === courseId && enrollment.studentId === studentId
    );
    
    if (enrollmentIndex === -1) {
      throw new Error(`Enrollment not found for course ${courseId} and student ${studentId}`);
    }

    MOCK_ENROLLMENTS.splice(enrollmentIndex, 1);
    
    console.log(`MOCK: Deleted enrollment for student ${studentId} from course ${courseId}`);
    return;
  }

  try {
    // Use the actual backend endpoint for unenrolling
    await apiClient.delete(`/api/courses/${courseId}/enrollments/${studentId}`);
    console.log(`Deleted enrollment for student ${studentId} from course ${courseId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchAvailableUsers(
  courseId: CourseId,
  searchTerm: string
): Promise<User[]> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    // Get enrolled student IDs for THIS specific course
    const enrolledStudentIds = new Set(
      MOCK_ENROLLMENTS
        .filter(enrollment => enrollment.courseId === courseId)
        .map(enrollment => enrollment.studentId)
    );

    let availableUsers = MOCK_USERS.filter(user => 
      user.role === "STUDENT" && 
      user.active && 
      !enrolledStudentIds.has(user.id)
    );

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      availableUsers = availableUsers.filter(user =>
        user.person.firstName.toLowerCase().includes(searchLower) ||
        user.person.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    console.log(`MOCK: Found ${availableUsers.length} available users for course ${courseId} with search "${searchTerm}"`);
    return availableUsers;
  }

  try {
    // Let the backend handle the search logic - more efficient
    const response = await apiClient.get<UserDTO[]>(`/api/courses/${courseId}/available-students`, {
      params: { search: searchTerm }
    });
    
    return response.data.map(mapUserFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getEnrollmentStats(courseId: CourseId): Promise<{
  total: number;
  active: number;
  cancelled: number;
  averageGrade: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(400);
    
    const courseEnrollments = MOCK_ENROLLMENTS.filter(enrollment => enrollment.courseId === courseId);
    
    const stats = {
      total: courseEnrollments.length,
      active: courseEnrollments.filter(e => e.status === "ACTIVE").length,
      cancelled: courseEnrollments.filter(e => e.status === "CANCELLED").length,
      averageGrade: 85.5 // Mock average
    };

    console.log(`MOCK: Returning enrollment stats for course ${courseId}`);
    return stats;
  }

  try {
    const response = await apiClient.get<EnrollmentStatsDTO>(`/api/courses/${courseId}/enrollment-stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchUserById(userId: UserId): Promise<User> {
  if (isMockEnabled) {
    const user = MOCK_USERS.find(user => user.id === userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user;
  }

  try {
    const response = await apiClient.get<UserDTO>(`/api/users/${userId}`);
    return mapUserFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

async function fetchUsersByIds(userIds: UserId[]): Promise<User[]> {
  if (isMockEnabled) {
    return MOCK_USERS.filter(user => userIds.includes(user.id));
  }

  try {
    // If your backend supports batch user fetching, use that
    // Otherwise, fetch users individually
    const users = await Promise.all(
      userIds.map(userId => fetchUserById(userId).catch(() => null))
    );
    
    return users.filter((user): user is User => user !== null);
  } catch (error) {
    return handleApiError(error);
  }
}