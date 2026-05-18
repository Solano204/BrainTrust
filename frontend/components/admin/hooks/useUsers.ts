'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getAllUsersPaginated,
  searchUsersByNamePaginated,
  getUsersByRolePaginated,
  getUserById,
  getUserStats,
  createCompleteUser,
  updateUserInfo,
  changeEmail,
  changePassword,
  activateUser,
  deactivateUser,
  updateUserAddress,
  updateUserImage,
  searchUsers,
  deleteUser,
  adminResetPassword,
  getUserByEmail,
  isEmailAvailable,
} from "@/components/admin/api/usersApi";

import type {
  User,
  UserId,
  UserStats,
} from "@/app/shared/models/user.model";

import type { UserRole } from "@/app/shared/dtos/user.dto";

import type {
  PaginatedResponse,
  PaginationParams
} from "@/app/shared/types/pagination";

import { usersKeys } from "./users-keys";


export function useUsersPaginated(params: PaginationParams = {}) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.paginated(params),
    queryFn: () => getAllUsersPaginated(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUsersByRolePaginated(
    role: UserRole,
    params: Omit<PaginationParams, 'role'> = {}
) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.byRolePaginated(role, params),
    queryFn: () => getUsersByRolePaginated(role, params),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSearchUsersPaginated(
    search: string,
    params: Omit<PaginationParams, 'search'> = {}
) {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.searchPaginated(search, params),
    queryFn: () => searchUsersByNamePaginated(search, params),
    enabled: search.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUserById(userId: string) {
  return useQuery<User, Error>({
    queryKey: usersKeys.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

export function useUserStats() {
  return useQuery<UserStats, Error>({
    queryKey: usersKeys.stats(),
    queryFn: getUserStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: usersKeys.list({}),
    queryFn: async () => {
      const response = await getAllUsersPaginated({ page: 0, size: 1000 });
      return response.content;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useUser(userId: UserId | null) {
  return useQuery<User>({
    queryKey: usersKeys.detail(userId || ""),
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useSearchUsers(searchTerm: string) {
  return useQuery<User[]>({
    queryKey: [...usersKeys.lists(), { search: searchTerm }],
    queryFn: () => searchUsers(searchTerm),
    enabled: searchTerm.trim().length >= 3,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCompleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompleteUser,
    onSuccess: async (newUser) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);

      queryClient.setQueryData(usersKeys.detail(newUser.id), newUser);
      console.log(`Created user: ${newUser.email}`);
    },
    onError: (error: Error) => {
      console.error('Error creating user:', error.message);
    }
  });
}

export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeEmail,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) })
      ]);

      console.log(`Email changed for user ${variables.userId}`);
    },
    onError: (error: Error) => {
      console.error('Error changing email:', error.message);
    }
  });
}

export function useAdminResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminResetPassword,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId)
      });

      console.log(`Password reset for user ${variables.userId}`);
    },
    onError: (error: Error) => {
      console.error('Error resetting password:', error.message);
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async (_, userId) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);

      console.log("User deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error.message);
    }
  });
}

export function useUpdateUserInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error updating user info:", error.message);
    }
  });
}

export function useChangeUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId)
      });
    },
    onError: (error: Error) => {
      console.error("Error changing password:", error.message);
    }
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: async (_, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error activating user:", error.message);
    }
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: async (_, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error deactivating user:", error.message);
    }
  });
}

export function useUpdateUserAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserAddress,
    onSuccess: async (_) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error updating address:", error.message);
    }
  });
}

export function useUpdateUserImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserImage,
    onSuccess: async (_) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error updating image:", error.message);
    }
  });
}

export function useGetUserByEmail() {
  return {
    fetch: getUserByEmail,
    checkAvailability: isEmailAvailable
  };
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createCompleteUserMutation = useMutation({
    mutationFn: createCompleteUser,
    onSuccess: async (newUser) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
      queryClient.setQueryData(usersKeys.detail(newUser.id), newUser);
      console.log("User created successfully:", newUser.email);
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async (_, userId) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(userId) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
      console.log("User deleted successfully");
    },
    onError: (error: Error) => {
      console.error("Error deleting user:", error.message);
    }
  });

  const updateUserInfoMutation = useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error updating user info:", error.message);
    }
  });

  const changeEmailMutation = useMutation({
    mutationFn: changeEmail,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error changing email:", error.message);
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.userId)
      });
    },
    onError: (error: Error) => {
      console.error("Error changing password:", error.message);
    }
  });

  const activateUserMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: async (_, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error activating user:", error.message);
    }
  });

  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: async (_, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) }),
        queryClient.invalidateQueries({ queryKey: usersKeys.stats() })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error deactivating user:", error.message);
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: updateUserAddress,
    onSuccess: async (_) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) })
      ]);
    },
    onError: (error: Error) => {
      console.error("Error updating address:", error.message);
    }
  });

  const updateImageMutation = useMutation({
    mutationFn: updateUserImage,
    onSuccess: async (_) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.paginated({}) })
      ]);
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