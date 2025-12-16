// File: src/app/presentation/hooks/admin/users-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserFilters,
  CreateCompleteUserCommand,
  UpdateUserInfoCommand,
  ChangeEmailCommand,
  ChangePasswordCommand,
  UpdatePersonAddressCommand,
  UpdateImageCommand,
  User,
  UserId,
  UserStats,
  PaginationParams,
  PaginatedResponse,
  getAllUsersPaginated,
  searchUsersByNamePaginated,
  getUsersByRolePaginated,
  UserRole,
  deleteUser,
  adminResetPassword,
  getUserByEmail,
  isEmailAvailable,
  changeEmail
} from "@/components/admin/api/usersApi";
import {
  getAllUsers,
  getUserById,
  getUserStats,
  createCompleteUser,
  updateUserInfo,
  changeUserEmail,
  changeUserPassword,
  activateUser,
  deactivateUser,
  updateUserAddress,
  updateUserImage,
  searchUsers
} from "@/components/admin/api/usersApi";
import { usersKeys } from "./users-keys";

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook for fetching paginated users
 */
export function useUsersPaginated(params: PaginationParams = {}) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.paginated(params),
    queryFn: () => getAllUsersPaginated(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching paginated users by role
 */
export function useUsersByRolePaginated(role: UserRole, params: Omit<PaginationParams, 'role'> = {}) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.byRolePaginated(role, params),
    queryFn: () => getUsersByRolePaginated(role, params),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for searching users with pagination
 */
export function useSearchUsersPaginated(search: string, params: Omit<PaginationParams, 'search'> = {}) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.searchPaginated(search, params),
    queryFn: () => searchUsersByNamePaginated(search, params),
    enabled: search.length >= 2, // Only search when at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for fetching user by ID
 */
export function useUserById(userId: string) {
  return useQuery<User, Error>({
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

/**
 * Hook for fetching user statistics
 */
export function useUserStats() {
  return useQuery<UserStats, Error>({
    queryKey: usersKeys.stats(),
    queryFn: getUserStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Legacy hook for all users (without pagination)
 */
export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: usersKeys.list({}),
    queryFn: async () => {
      // Use paginated API with large page size for backward compatibility
      const response = await getAllUsersPaginated({ page: 0, size: 1000 });
      return response.content;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch a single user by ID (legacy)
 */
export function useUser(userId: UserId | null) {
  return useQuery<User>({
    queryKey: usersKeys.detail(userId || ""),
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Search users (legacy)
 */
export function useSearchUsers(searchTerm: string) {
  return useQuery<User[]>({
    queryKey: [...usersKeys.lists(), { search: searchTerm }],
    queryFn: () => searchUsers(searchTerm),
    enabled: searchTerm.trim().length >= 3,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// ============================================
// INDIVIDUAL MUTATION HOOKS
// ============================================

/**
 * Hook for creating a complete user
 */
export function useCreateCompleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCompleteUser,
    onSuccess: (newUser) => {
      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
      
      // Add new user to cache
      queryClient.setQueryData(usersKeys.detail(newUser.id), newUser);
      
      console.log(`Created user: ${newUser.email}`);
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error.message);
    }
  });
}

/**
 * Hook for changing user email
 */
export function useChangeEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeEmail,
    onSuccess: (_, variables) => {
      // Invalidate user cache
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      
      console.log(`Email changed for user ${variables.userId}`);
    },
    onError: (error: Error) => {
      console.error('Error changing email:', error.message);
    }
  });
}

/**
 * Hook for admin password reset
 */
export function useAdminResetPassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminResetPassword,
    onSuccess: (_, variables) => {
      // Invalidate user cache
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
      
      console.log(`Password reset for user ${variables.userId}`);
    },
    onError: (error: Error) => {
      console.error('Error resetting password:', error.message);
    }
  });
}

/**
 * Hook for deleting a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
      
      console.log("User deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error.message);
    }
  });
}

/**
 * Hook for updating user info
 */
export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserInfo,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error updating user info:", error.message);
    }
  });
}

/**
 * Hook for changing user password
 */
export function useChangeUserPassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: changeUserPassword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error changing password:", error.message);
    }
  });
}

/**
 * Hook for activating a user
 */
export function useActivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: activateUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error activating user:", error.message);
    }
  });
}

/**
 * Hook for deactivating a user
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error deactivating user:", error.message);
    }
  });
}

/**
 * Hook for updating user address
 */
export function useUpdateUserAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserAddress,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
    },
    onError: (error: Error) => {
      console.error("Error updating address:", error.message);
    }
  });
}

/**
 * Hook for updating user image
 */
export function useUpdateUserImage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserImage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
    },
    onError: (error: Error) => {
      console.error("Error updating image:", error.message);
    }
  });
}

/**
 * Utility functions for user email operations
 */
export function useGetUserByEmail() {
  return {
    fetch: getUserByEmail,
    checkAvailability: isEmailAvailable
  };
}

// ============================================
// COMPOSITE MUTATION HOOK (for backward compatibility)
// ============================================

/**
 * Hook that returns all user management mutations
 * @deprecated Use individual mutation hooks instead (useCreateCompleteUser, useDeleteUser, etc.)
 */
export function useUserMutations() {
  const queryClient = useQueryClient();

  // Create user mutation
  const createCompleteUserMutation = useMutation({
    mutationFn: createCompleteUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
      queryClient.setQueryData(usersKeys.detail(newUser.id), newUser);
      console.log("User created successfully:", newUser.email);
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
      console.log("User deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error.message);
    }
  });

  // Update user info mutation
  const updateUserInfoMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error updating user info:", error.message);
    }
  });

  // Change email mutation
  const changeEmailMutation = useMutation({
    mutationFn: changeUserEmail,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
    },
    onError: (error: Error) => {
      console.error("Error changing email:", error.message);
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: usersKeys.detail(variables.userId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error changing password:", error.message);
    }
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error activating user:", error.message);
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
      queryClient.invalidateQueries({ queryKey: usersKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error deactivating user:", error.message);
    }
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: updateUserAddress,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
    },
    onError: (error: Error) => {
      console.error("Error updating address:", error.message);
    }
  });

  // Update profile image mutation
  const updateImageMutation = useMutation({
    mutationFn: updateUserImage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) });
    },
    onError: (error: Error) => {
      console.error("Error updating image:", error.message);
    }
  });

  return {
    createCompleteUser: createCompleteUserMutation,
    deleteUser: deleteUserMutation,
    updateUserInfo: updateUserInfoMutation,
    changeEmail: changeEmailMutation,
    changePassword: changePasswordMutation,
    activateUser: activateUserMutation,
    deactivateUser: deactivateUserMutation,
    updateAddress: updateAddressMutation,
    updateImage: updateImageMutation,
    getUserByEmail: useGetUserByEmail(),
  };
}