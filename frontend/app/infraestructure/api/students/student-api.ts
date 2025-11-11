// File: src/app/features/courses/api/student-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Enrollment} from "@/app/domain/entities/CourseEntities";
import { User, Person, Role } from "@/app/domain/entities/IdentityEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true;

// Mock user data with detailed information
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
  },
  {
    id: "student-4",
    personId: "person-4",
    email: "david.wilson@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-4",
      firstName: "David",
      lastName: "Wilson",
      gender: "MALE",
      phone: "+1-555-0104",
      registrationDate: "2023-08-18",
      imagePath: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      address: null
    }
  },
  {
    id: "student-5",
    personId: "person-5",
    email: "eva.brown@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-5",
      firstName: "Eva",
      lastName: "Brown",
      gender: "FEMALE",
      phone: "+1-555-0105",
      registrationDate: "2023-08-19",
      imagePath: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      address: null
    }
  },
  {
    id: "student-6",
    personId: "person-6",
    email: "frank.miller@university.edu",
    role: "STUDENT",
    active: false,
    person: {
      id: "person-6",
      firstName: "Frank",
      lastName: "Miller",
      gender: "MALE",
      phone: "+1-555-0106",
      registrationDate: "2023-08-20",
      imagePath: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      address: null
    }
  }
];

// Mock enrollments data
const MOCK_ENROLLMENTS: (Enrollment & { user: User })[] = [
  {
    id: "enr-101-1",
    courseId: "crs-101",
    studentId: "student-1",
    enrollmentDate: "2024-01-15",
    status: "ACTIVE",
    grade: { value: "A", maxScore: "100" },
    user: MOCK_USERS[0]
  },
  {
    id: "enr-101-2",
    courseId: "crs-101",
    studentId: "student-2",
    enrollmentDate: "2024-01-15",
    status: "ACTIVE",
    grade: { value: "B+", maxScore: "100" },
    user: MOCK_USERS[1]
  },
  {
    id: "enr-101-3",
    courseId: "crs-101",
    studentId: "student-3",
    enrollmentDate: "2024-01-16",
    status: "ACTIVE",
    grade: { value: "A-", maxScore: "100" },
    user: MOCK_USERS[2]
  },
  {
    id: "enr-202-1",
    courseId: "crs-202",
    studentId: "student-4",
    enrollmentDate: "2024-01-10",
    status: "ACTIVE",
    grade: { value: "B", maxScore: "100" },
    user: MOCK_USERS[3]
  },
  {
    id: "enr-202-2",
    courseId: "crs-202",
    studentId: "student-5",
    enrollmentDate: "2024-01-11",
    status: "CANCELLED",
    grade: null,
    user: MOCK_USERS[4]
  },
  {
    id: "enr-202-3",
    courseId: "crs-202",
    studentId: "student-6",
    enrollmentDate: "2024-01-12",
    status: "ACTIVE",
    grade: { value: "C+", maxScore: "100" },
    user: MOCK_USERS[5]
  }
];

// Available users for enrollment (not yet enrolled)
const MOCK_AVAILABLE_USERS: User[] = [
  {
    id: "student-7",
    personId: "person-7",
    email: "grace.lee@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-7",
      firstName: "Grace",
      lastName: "Lee",
      gender: "FEMALE",
      phone: "+1-555-0107",
      registrationDate: "2023-09-01",
      imagePath: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "111 Learning Lane",
        colony: "Cambridge",
        state: "MA",
        postalCode: "02144",
        municipality: "USA"
      }
    }
  },
  {
    id: "student-8",
    personId: "person-8",
    email: "henry.taylor@university.edu",
    role: "STUDENT",
    active: true,
    person: {
      id: "person-8",
      firstName: "Henry",
      lastName: "Taylor",
      gender: "MALE",
      phone: "+1-555-0108",
      registrationDate: "2023-09-02",
      imagePath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      address: {
        street: "222 Education Ave",
        colony: "Boston",
        state: "MA",
        postalCode: "02145",
        municipality: "USA"
      }
    }
  }
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
 * Fetch enrollments by course with user details
 */
export async function fetchEnrollmentsByCourse(courseId: CourseId): Promise<(Enrollment & { user: User })[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const enrollments = MOCK_ENROLLMENTS.filter(enrollment => enrollment.courseId === courseId);
    console.log(`MOCK: Returning ${enrollments.length} enrollments for course ${courseId}`);
    console.log("MOCK ENROLLMENTS DATA:", enrollments);
    return enrollments;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get(`/courses/${courseId}/enrollments-with-users`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch enrollment by ID with user details
 */
export async function fetchEnrollmentById(enrollmentId: string): Promise<Enrollment & { user: User }> {
  if (isMockEnabled) {
    await simulateDelay();
    const enrollment = MOCK_ENROLLMENTS.find(enrollment => enrollment.id === enrollmentId);
    if (!enrollment) {
      console.error(`MOCK: Enrollment with ID ${enrollmentId} not found`);
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }
    console.log(`MOCK: Returning enrollment ${enrollmentId}`);
    console.log("MOCK ENROLLMENT DATA:", enrollment);
    return enrollment;
  }

  try {
    if (!enrollmentId) throw new Error("Enrollment ID is required");
    const response = await apiClient.get(`/enrollments/${enrollmentId}/with-user`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(enrollmentData: {
  courseId: CourseId;
  studentId: UserId;
  enrollmentDate?: string;
}): Promise<Enrollment & { user: User }> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    // Check if enrollment already exists
    const existingEnrollment = MOCK_ENROLLMENTS.find(
      enrollment => enrollment.courseId === enrollmentData.courseId && enrollment.studentId === enrollmentData.studentId
    );
    
    if (existingEnrollment) {
      console.error(`MOCK: Enrollment already exists for student ${enrollmentData.studentId} in course ${enrollmentData.courseId}`);
      throw new Error("Student is already enrolled in this course");
    }

    // Find the user
    const user = [...MOCK_USERS, ...MOCK_AVAILABLE_USERS].find(user => user.id === enrollmentData.studentId);
    if (!user) {
      console.error(`MOCK: User with ID ${enrollmentData.studentId} not found`);
      throw new Error(`User not found: ${enrollmentData.studentId}`);
    }

    const newEnrollment: Enrollment & { user: User } = {
      id: `enr-${Date.now()}`,
      courseId: enrollmentData.courseId,
      studentId: enrollmentData.studentId,
      enrollmentDate: enrollmentData.enrollmentDate || new Date().toISOString().split('T')[0],
      status: "ACTIVE",
      grade: null,
      user: user
    };

    MOCK_ENROLLMENTS.push(newEnrollment);
    console.log("MOCK: Created new enrollment");
    console.log("ENROLLMENT DATA USED:", enrollmentData);
    console.log("CREATED ENROLLMENT:", newEnrollment);
    return newEnrollment;
  }

  try {
    const response = await apiClient.post("/enrollments", enrollmentData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing enrollment
 */
export async function updateEnrollment(
  enrollmentId: string,
  enrollmentData: Partial<Omit<Enrollment, "id" | "courseId" | "studentId">>
): Promise<Enrollment & { user: User }> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const enrollmentIndex = MOCK_ENROLLMENTS.findIndex(enrollment => enrollment.id === enrollmentId);

    if (enrollmentIndex === -1) {
      console.error(`MOCK: Enrollment with ID ${enrollmentId} not found for update`);
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    const originalEnrollment = MOCK_ENROLLMENTS[enrollmentIndex];
    MOCK_ENROLLMENTS[enrollmentIndex] = {
      ...originalEnrollment,
      ...enrollmentData
    } as Enrollment & { user: User };

    console.log(`MOCK: Updated enrollment ${enrollmentId}`);
    console.log("ORIGINAL ENROLLMENT DATA:", originalEnrollment);
    console.log("UPDATE DATA PROVIDED:", enrollmentData);
    console.log("UPDATED ENROLLMENT DATA:", MOCK_ENROLLMENTS[enrollmentIndex]);
    return MOCK_ENROLLMENTS[enrollmentIndex];
  }

  try {
    const response = await apiClient.put(`/enrollments/${enrollmentId}`, enrollmentData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(enrollmentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const enrollmentIndex = MOCK_ENROLLMENTS.findIndex(enrollment => enrollment.id === enrollmentId);

    if (enrollmentIndex === -1) {
      console.error(`MOCK: Enrollment with ID ${enrollmentId} not found for deletion`);
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    const deletedEnrollment = MOCK_ENROLLMENTS[enrollmentIndex];
    MOCK_ENROLLMENTS.splice(enrollmentIndex, 1);
    
    console.log(`MOCK: Deleted enrollment ${enrollmentId}`);
    console.log("DELETED ENROLLMENT DATA:", deletedEnrollment);
    return;
  }

  try {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Bulk enroll students
 */
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
      const user = [...MOCK_USERS, ...MOCK_AVAILABLE_USERS].find(user => user.id === studentId);
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
        grade: null,
        user
      };

      MOCK_ENROLLMENTS.push(newEnrollment);
      newEnrollments.push(newEnrollment);
    }

    if (errors.length > 0) {
      console.warn(`MOCK: Bulk enrollment completed with ${errors.length} errors`);
      console.warn("BULK ENROLLMENT ERRORS:", errors);
    }

    console.log(`MOCK: Bulk enrolled ${newEnrollments.length} students to course ${courseId}`);
    console.log("STUDENT IDs ENROLLED:", studentIds);
    console.log("CREATED ENROLLMENTS:", newEnrollments);
    return newEnrollments;
  }

  try {
    const response = await apiClient.post(`/courses/${courseId}/enrollments/bulk`, {
      studentIds
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Search available users for enrollment
 */
export async function searchAvailableUsers(
  searchTerm: string
): Promise<User[]> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    // Get currently enrolled student IDs for this course
    const enrolledStudentIds = new Set(
      MOCK_ENROLLMENTS
        .map(enrollment => enrollment.studentId)
    );

    // Filter available users (not enrolled and active)
    let availableUsers = [...MOCK_USERS, ...MOCK_AVAILABLE_USERS].filter(user => 
      user.role === "STUDENT" && 
      user.active && 
      !enrolledStudentIds.has(user.id)
    );

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      availableUsers = availableUsers.filter(user =>
        user.person.firstName.toLowerCase().includes(searchLower) ||
        user.person.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    console.log(`MOCK: Found ${availableUsers.length} available users for course ${"MOCK"} with search "${searchTerm}"`);
    console.log("AVAILABLE USERS DATA:", availableUsers);
    return availableUsers;
  }

  try {
    const response = await apiClient.get(`/courses//available-users`, {
      params: { search: searchTerm }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update student grade
 */
export async function updateStudentGrade(
  enrollmentId: string,
  grade: { value: string; maxScore: string }
): Promise<Enrollment & { user: User }> {
  if (isMockEnabled) {
    await simulateDelay(600);
    const enrollmentIndex = MOCK_ENROLLMENTS.findIndex(enrollment => enrollment.id === enrollmentId);

    if (enrollmentIndex === -1) {
      console.error(`MOCK: Enrollment with ID ${enrollmentId} not found for grade update`);
      throw new Error(`Enrollment not found: ${enrollmentId}`);
    }

    const originalEnrollment = MOCK_ENROLLMENTS[enrollmentIndex];
    MOCK_ENROLLMENTS[enrollmentIndex] = {
      ...originalEnrollment,
      grade: {
        value: grade.value,
        maxScore: grade.maxScore
      }
    };

    console.log(`MOCK: Updated grade for enrollment ${enrollmentId}`);
    console.log("ORIGINAL GRADE:", originalEnrollment.grade);
    console.log("NEW GRADE DATA:", grade);
    console.log("UPDATED ENROLLMENT:", MOCK_ENROLLMENTS[enrollmentIndex]);
    return MOCK_ENROLLMENTS[enrollmentIndex];
  }

  try {
    const response = await apiClient.patch(`/enrollments/${enrollmentId}/grade`, grade);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get enrollment statistics
 */
export async function getEnrollmentStats(courseId: CourseId): Promise<{
  total: number;
  active: number;
  cancelled: number;
  averageGrade: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(400);
    
    const courseEnrollments = MOCK_ENROLLMENTS.filter(enrollment => enrollment.courseId === courseId);
    
    const total = courseEnrollments.length;
    const active = courseEnrollments.filter(e => e.status === "ACTIVE").length;
    const cancelled = courseEnrollments.filter(e => e.status === "CANCELLED").length;
    
    // Calculate average grade (convert letter grades to numeric values for demo)
    const gradeValues: { [key: string]: number } = {
      "A": 95, "A-": 90, "B+": 87, "B": 85, "B-": 80,
      "C+": 77, "C": 75, "C-": 70, "D": 65, "F": 50
    };
    
    const gradesWithValues = courseEnrollments
      .filter(e => e.grade && e.status === "ACTIVE")
      .map(e => gradeValues[e.grade?.value || "F"] || 70);
    
    const averageGrade = gradesWithValues.length > 0 
      ? gradesWithValues.reduce((sum, grade) => sum + grade, 0) / gradesWithValues.length
      : 0;

    const stats = {
      total,
      active,
      cancelled,
      averageGrade: Math.round(averageGrade * 10) / 10
    };

    console.log(`MOCK: Returning enrollment stats for course ${courseId}`);
    console.log("ENROLLMENT STATS DATA:", stats);
    return stats;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/enrollments/stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}