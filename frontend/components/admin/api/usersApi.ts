// File: src/app/features/admin/api/users-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
// File: src/app/domain/valueObjects/index.ts

// Existing value objects
export type CourseId = string;
export type UserId = string;
export type PersonId = string;

// Add these new ones
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// File: src/app/domain/entities/UserEntities.ts

// File: src/app/types/admin.ts


// types/user-api.ts
export interface AdminChangePasswordCommand {
  userId: string;
  newPassword: string;
}

export interface CreateCompleteUserCommand {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  addressStreet?: string;
  addressColony?: string;
  addressMunicipality?: string;
  addressState?: string;
  addressPostalCode?: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  userId?: string;
}

export interface ChangeEmailCommand {
  userId: string;
  newEmail: string;
}

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}


export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  role?: UserRole;
  active?: boolean;
}

export interface Address {
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

export interface Person {
  id: PersonId;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  phone: string;
  registrationDate: string;
  imagePath: string;
  address: Address | null;
}

export interface User {
  id: UserId;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  person: Person;
  studentId?: string | null;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  teachers: number;
  students: number;
  admins: number;
}

// File: src/app/types/admin.ts

// ============================================
// COMMANDS (Request payloads to backend)
// ============================================

export interface CreateCompleteUserCommand {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;

  // Address Information
  addressStreet?: string;
  addressColony?: string;
  addressMunicipality?: string;
  addressState?: string;
  addressPostalCode?: string;

  // User Account Information
  email: string;
  password: string;

  // Role-specific Information
  role: UserRole;
  userId?: string; // Only for STUDENT role
}

export interface UpdateUserInfoCommand {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
}

export interface ChangeEmailCommand {
  userId: string;
  newEmail: string;
}

export interface ChangePasswordCommand {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePersonAddressCommand {
  personId: string;
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

export interface UpdateImageCommand {
  personId: string;
  imagePath: string;
}

// ============================================
// FILTERS & QUERIES
// ============================================

export interface UserFilters {
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus;
  sortBy?: "name" | "email" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ============================================
// BACKEND DTO TYPES
// ============================================

interface AddressDTO {
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

interface PersonDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  phone: string;
  registrationDate: string;
  imagePath: string;
  address: AddressDTO | null;
}

interface UserDTO {
  id: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  person: PersonDTO;
  studentId?: string | null;
}

interface CompleteUserResponseDTO {
  userId: string;
  personId: string;
  email: string;
  role: string;
  active: boolean;
  studentId: string | null;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  fullName: string;
  registrationDate: string;
  imagePath: string;
  address: AddressDTO | null;
  createdAt: string;
  message: string;
}


interface PaginatedResponseDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
// ============================================
// UTILITIES
// ============================================

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
    throw new Error(errorMessage);
  }
  throw error;
};

// ============================================
// MAPPERS

function mapUserFromBackend(dto: UserDTO): User {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role as UserRole,
    active: dto.active,
    createdAt: dto.createdAt,
    person: {
      id: dto.person.id,
      firstName: dto.person.firstName,
      lastName: dto.person.lastName,
      fullName: dto.person.fullName,
      gender: dto.person.gender,
      phone: dto.person.phone,
      registrationDate: dto.person.registrationDate,
      imagePath: dto.person.imagePath,
      address: dto.person.address,
    },
    studentId: dto.studentId,
  };
}

function mapCompleteUserFromBackend(dto: CompleteUserResponseDTO): User {
  return {
    id: dto.userId,
    email: dto.email,
    role: dto.role as UserRole,
    active: dto.active,
    createdAt: dto.createdAt,
    person: {
      id: dto.personId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: dto.fullName,
      gender: dto.gender,
      phone: dto.phone,
      registrationDate: dto.registrationDate,
      imagePath: dto.imagePath,
      address: dto.address,
    },
    studentId: dto.studentId,
  };
}

function mapPaginatedResponseFromBackend<T, U>(
  dto: PaginatedResponseDTO<U>,
  mapper: (item: U) => T
): PaginatedResponse<T> {
  return {
    content: dto.content.map(mapper),
    pageNumber: dto.pageNumber,
    pageSize: dto.pageSize,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
    first: dto.first,
    last: dto.last,
  };
}



/**
 * Admin reset password (without knowing current password)
 */
export async function adminResetPassword(
  command: AdminChangePasswordCommand
): Promise<SuccessResponseDTO> {
  try {
    const response = await apiClient.put<SuccessResponseDTO>(
      '/api/users/admin/reset-password',
      command
    );
    
    console.log(`Admin reset password for user ${command.userId}`);
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Create complete user with all information
 */
export async function createCompleteUser(
  command: CreateCompleteUserCommand
): Promise<User> {
  try {
    // Only add userId if role is STUDENT and userId is provided
    const requestData = { ...command };
    if (command.role !== 'STUDENT' || !command.userId) {
      delete requestData.userId;
    }
    
    const response = await apiClient.post<CompleteUserResponseDTO>(
      '/api/users/register/complete',
      requestData
    );
    
    const user = mapCompleteUserFromBackend(response.data);
    console.log(`Created complete user: ${user.email} with role ${user.role}`);
    
    return user;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Change email address
 */
export async function changeEmail(
  command: ChangeEmailCommand
): Promise<SuccessResponseDTO> {
  try {
    const response = await apiClient.put<SuccessResponseDTO>(
      '/api/users/email',
      command
    );
    
    console.log(`Changed email for user ${command.userId} to ${command.newEmail}`);
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Get all users (for admin) - simpler version
 */
export async function getAllUsersSimple(): Promise<User[]> {
  try {
    const response = await apiClient.get<UserDTO[]>('/api/users/role/all');
    
    const users = response.data.map(mapUserFromBackend);
    console.log(`Fetched ${users.length} users for admin`);
    
    return users;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User> {
  try {
    const response = await apiClient.get<UserDTO>(`/api/users/email/${email}`);
    
    const user = mapUserFromBackend(response.data);
    console.log(`Fetched user by email: ${email}`);
    
    return user;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Check if email is available
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  try {
    const response = await apiClient.get<boolean>(`/api/users/email-available/${email}`);
    return response.data;
  } catch (error) {
    // If endpoint doesn't exist, assume available
    console.warn('Email availability endpoint not available');
    return true;
  }
}


// ============================================
// API FUNCTIONS
// ============================================

export async function changeUserEmail(
  command: ChangeEmailCommand
): Promise<void> {
  try {
    await apiClient.put("/api/users/email", command);

    console.log(`Changed email for user ${command.userId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Change user password
 */
export async function changeUserPassword(
  command: ChangePasswordCommand
): Promise<void> {
  try {
    await apiClient.put("/api/users/password", command);

    console.log(`Changed password for user ${command.userId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Update user address
 */
export async function updateUserAddress(
  command: UpdatePersonAddressCommand
): Promise<void> {
  try {
    await apiClient.put("/api/persons/contact-address", command);

    console.log(`Updated address for person ${command.personId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Update user profile image
 */
export async function updateUserImage(
  command: UpdateImageCommand
): Promise<void> {
  try {
    await apiClient.put("/api/persons/profile-image", command);

    console.log(`Updated profile image for person ${command.personId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search users
 */

// ============================================
// PAGINATION API FUNCTIONS
// ============================================

/**
 * Get all users with pagination
 */export async function getAllUsersPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResponse<User>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "createdAt,desc",
      search,
      role,
      active,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) queryParams.append("name", search);
  

    if (active !== undefined) queryParams.append("active", active.toString());

    console.log(`Fetching role ${role} page ${page + 1} with ${size} users`);

    let url: string; // Ensure 'url' is initialized and typed

    if (role) { 
      url = `/api/users/role/${role}/paginated?${queryParams.toString()}`;
    } else {
      url = `/api/users/paginated?${queryParams.toString()}`;
      if (role) queryParams.append("role", role);
    }

    const response = await apiClient.get<PaginatedResponseDTO<UserDTO>>(url);

    const result = mapPaginatedResponseFromBackend(
      response.data,
      mapUserFromBackend
    );
    console.log(
      `Fetched page ${result.pageNumber + 1}/${result.totalPages} with ${
        result.content.length
      } users`
    );

    return result;
  } catch (error) {
    // Assuming handleApiError is defined and handles the error correctly
    return await handleApiError(error);
  }
}

/**
 * Get users by role with pagination
 */
export async function getUsersByRolePaginated(
  role: UserRole,
  params: Omit<PaginationParams, "role"> = {}
): Promise<PaginatedResponse<User>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "createdAt,desc",
      search,
      active,
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (search) queryParams.append("name", search);
    if (active !== undefined) queryParams.append("active", active.toString());

    const url = `/api/users/role/${role}/paginated?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<UserDTO>>(url);

    const result = mapPaginatedResponseFromBackend(
      response.data,
      mapUserFromBackend
    );
    console.log(
      `Fetched ${role} users page ${result.pageNumber + 1}/${result.totalPages}`
    );

    return result;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search users by name with pagination
 */
export async function searchUsersByNamePaginated(
  name: string,
  params: Omit<PaginationParams, "search"> = {}
): Promise<PaginatedResponse<User>> {
  try {
    const {
      page = 0,
      size = 20,
      sort = "firstName,asc",
      role,
      active,
    } = params;

    const queryParams = new URLSearchParams({
      name,
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    if (role) queryParams.append("role", role);
    if (active !== undefined) queryParams.append("active", active.toString());

    const url = `/api/users/search?${queryParams.toString()}`;
    const response = await apiClient.get<PaginatedResponseDTO<UserDTO>>(url);

    const result = mapPaginatedResponseFromBackend(
      response.data,
      mapUserFromBackend
    );
    console.log(
      `Searched "${name}" page ${result.pageNumber + 1}/${result.totalPages}`
    );

    return result;
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================
// EXISTING API FUNCTIONS (Updated)
// ============================================

/**
 * Get user by ID
 */
export async function getUserById(userId: UserId): Promise<User> {
  try {
    const response = await apiClient.get<UserDTO>(`/api/users/${userId}`);

    const user = mapUserFromBackend(response.data);
    console.log(`Fetched user: ${user.email}`);

    return user;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await apiClient.get("/api/users/stats");

    return {
      total: response.data.total || 0,
      active: response.data.active || 0,
      inactive: response.data.inactive || 0,
      suspended: response.data.suspended || 0,
      teachers: response.data.teachers || 0,
      students: response.data.students || 0,
      admins: response.data.admins || 0,
    };
  } catch (error) {
    console.warn("Could not fetch stats from API, calculating locally");

    // Fallback: Get first page to calculate stats
    const paginatedUsers = await getAllUsersPaginated({ page: 0, size: 1 });

    // For a complete stats endpoint, you'd need to call the backend
    // This is a temporary fallback
    return {
      total: paginatedUsers.totalElements,
      active: 0, // Unknown without proper API
      inactive: 0,
      suspended: 0,
      teachers: 0,
      students: 0,
      admins: 0,
    };
  }
}


/**
 * Update user personal information
 */
export async function updateUserInfo(
  command: UpdateUserInfoCommand
): Promise<void> {
  try {
    await apiClient.put("/api/users/personal-info", command);

    console.log(`Updated personal info for user ${command.userId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Activate user
 */
export async function activateUser(userId: UserId): Promise<void> {
  try {
    await apiClient.put(`/api/users/${userId}/activate`);

    console.log(`Activated user ${userId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: UserId): Promise<void> {
  try {
    await apiClient.put(`/api/users/${userId}/deactivate`);

    console.log(`Deactivated user ${userId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================

/**
 * Get all users (legacy - use paginated version instead)
 */
export async function getAllUsers(filters: UserFilters = {}): Promise<User[]> {
  try {
    console.warn(
      "Using legacy getAllUsers function. Consider switching to paginated version."
    );

    // For backward compatibility, get first page with large size
    const paginatedResponse = await getAllUsersPaginated({
      page: 0,
      size: 1000,
      search: filters.search,
      role: filters.role && filters.role !== "all" ? filters.role : undefined,
      sort:
        filters.sortBy && filters.sortOrder
          ? `${filters.sortBy},${filters.sortOrder}`
          : "createdAt,desc",
    });

    return paginatedResponse.content;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search users (legacy - use paginated version instead)
 */
export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    console.warn(
      "Using legacy searchUsers function. Consider switching to paginated version."
    );

    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const paginatedResponse = await searchUsersByNamePaginated(searchTerm, {
      page: 0,
      size: 100,
    });

    return paginatedResponse.content;
  } catch (error) {
    return await handleApiError(error);
  }
}
// NEW: Delete user function
export async function deleteUser(userId: UserId): Promise<void> {
  try {
    await apiClient.delete(`/api/users/${userId}`);
    console.log(`Deleted user ${userId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}