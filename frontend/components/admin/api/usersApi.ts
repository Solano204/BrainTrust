"use server";

import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";

import {
  UserDTO,
  CompleteUserResponseDTO,
  UserStatsDTO,
  SuccessResponseDTO,
  PaginatedResponseDTO,
  UserRole,
} from "@/app/shared/dtos/user.dto";

import {
  CreateCompleteUserCommand,
  UpdateUserInfoCommand,
  ChangeEmailCommand,
  ChangePasswordCommand,
  AdminChangePasswordCommand,
  UpdatePersonAddressCommand,
  UpdateImageCommand,
} from "@/app/shared/dtos/commands/user.commands";

import { PaginatedResponse, PaginationParams } from "@/app/shared/types/pagination";

import {
  mapUserFromBackend,
  mapCompleteUserFromBackend,
  mapPaginatedUserResponseFromBackend,
} from "@/app/shared/mappers/user.mappers";

import { User, UserId, UserStats, UserFilters } from "@/app/shared/models/user.model";



export async function getAllUsersPaginated(
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

    let url: string;

    if (role) {
      url = `/api/users/role/${role}/paginated?${queryParams.toString()}`;
    } else {
      url = `/api/users/paginated?${queryParams.toString()}`;
    }

    const { data } = await apiClient.get<PaginatedResponseDTO<UserDTO>>(url);

    return mapPaginatedUserResponseFromBackend(data, mapUserFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const { data } = await apiClient.get<PaginatedResponseDTO<UserDTO>>(url);

    return mapPaginatedUserResponseFromBackend(data, mapUserFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const { data } = await apiClient.get<PaginatedResponseDTO<UserDTO>>(url);

    return mapPaginatedUserResponseFromBackend(data, mapUserFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getUserById(userId: UserId): Promise<User> {
  try {
    const { data } = await apiClient.get<UserDTO>(`/api/users/${userId}`);
    return mapUserFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getUserByEmail(email: string): Promise<User> {
  try {
    const { data } = await apiClient.get<UserDTO>(`/api/users/email/${email}`);
    return mapUserFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createCompleteUser(
    command: CreateCompleteUserCommand
): Promise<User> {
  try {
    const requestData = { ...command };
    if (command.role !== 'STUDENT' || !command.userId) {
      delete requestData.userId;
    }

    const { data } = await apiClient.post<CompleteUserResponseDTO>(
        '/api/users/register/complete',
        requestData
    );

    return mapCompleteUserFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserInfo(
    command: UpdateUserInfoCommand
): Promise<void> {
  try {
    await apiClient.put("/api/users/personal-info", command);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteUser(userId: UserId): Promise<void> {
  try {
    await apiClient.delete(`/api/users/${userId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function activateUser(userId: UserId): Promise<void> {
  try {
    await apiClient.put(`/api/users/${userId}/activate`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deactivateUser(userId: UserId): Promise<void> {
  try {
    await apiClient.put(`/api/users/${userId}/deactivate`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function isEmailAvailable(email: string): Promise<boolean> {
  try {
    const { data } = await apiClient.get<boolean>(`/api/users/email-available/${email}`);
    return data;
  } catch (error) {
    console.warn('Email availability endpoint not available');
    return true;
  }
}

export async function changeEmail(
    command: ChangeEmailCommand
): Promise<SuccessResponseDTO> {
  try {
    const { data } = await apiClient.put<SuccessResponseDTO>(
        '/api/users/email',
        command
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function changePassword(
    command: ChangePasswordCommand
): Promise<void> {
  try {
    await apiClient.put("/api/users/password", command);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function adminResetPassword(
    command: AdminChangePasswordCommand
): Promise<SuccessResponseDTO> {
  try {
    const { data } = await apiClient.put<SuccessResponseDTO>(
        '/api/users/admin/reset-password',
        command
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserAddress(
    command: UpdatePersonAddressCommand
): Promise<void> {
  try {
    await apiClient.put("/api/persons/contact-address", command);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUserImage(
    command: UpdateImageCommand
): Promise<void> {
  try {
    await apiClient.put("/api/persons/profile-image", command);
  } catch (error) {
    return handleApiError(error);
  }
}

/* =========================
   STATS
========================= */

export async function getUserStats(): Promise<UserStats> {
  try {
    const { data } = await apiClient.get<UserStatsDTO>("/api/users/stats");

    return {
      total: data.total || 0,
      active: data.active || 0,
      inactive: data.inactive || 0,
      suspended: data.suspended || 0,
      teachers: data.teachers || 0,
      students: data.students || 0,
      admins: data.admins || 0,
    };
  } catch (error) {
    console.warn("Could not fetch stats from API, calculating locally");

    const paginatedUsers = await getAllUsersPaginated({ page: 0, size: 1 });

    return {
      total: paginatedUsers.totalElements,
      active: 0,
      inactive: 0,
      suspended: 0,
      teachers: 0,
      students: 0,
      admins: 0,
    };
  }
}


export async function getAllUsersSimple(): Promise<User[]> {
  try {
    const { data } = await apiClient.get<UserDTO[]>('/api/users/role/all');
    return data.map(mapUserFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getAllUsers(filters: UserFilters = {}): Promise<User[]> {
  try {
    console.warn(
        "Using legacy getAllUsers function. Consider switching to paginated version."
    );

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
    return handleApiError(error);
  }
}

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
    return handleApiError(error);
  }
}

export const changeUserEmail = changeEmail;
export const changeUserPassword = changePassword;