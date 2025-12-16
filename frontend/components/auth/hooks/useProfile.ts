// hooks/useProfile.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Import individual functions instead of the object
import { 
  getProfile,
  updatePersonalInfo,
  updateAddress,
  updateImage,
  changePassword 
} from '@/components/auth/api/profile-api';
import { useAuth } from '@/app/context/AuthContext';
import { uploadImageFile } from '@/app/utils/cloudinary/cloudinary';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (userId?: string) => [...profileKeys.details(), userId] as const,
};

// Profile queries
export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: profileKeys.detail(user?.id),
    queryFn: getProfile,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Utility function to invalidate all profile queries
function invalidateProfileQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: profileKeys.all });
}

// Profile mutations
export function useUpdatePersonalInfo() {
  const queryClient = useQueryClient();
  const { refreshTokens } = useAuth();
  
  return useMutation({
    mutationFn: updatePersonalInfo,
    onSuccess: async (response, variables) => {
      // Invalidate profile queries
      invalidateProfileQueries(queryClient);
      
      // Refresh auth context to update user data
      await refreshTokens();
      
      // Show success message (you'll need to implement toast)
      console.log("Personal information updated successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to update personal information:", error.message);
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { refreshTokens } = useAuth();
  
  return useMutation({
    mutationFn: updateAddress,
    onSuccess: async (response, variables) => {
      invalidateProfileQueries(queryClient);
      await refreshTokens();
      
      console.log("Address updated successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to update address:", error.message);
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  const { refreshTokens } = useAuth();
  
  return useMutation({
    mutationFn: async ({ personId, imageFile }: { personId: string; imageFile: File }) => {
      // First upload the image
      const imagePath = await uploadImageFile(imageFile);
      
      // Then update the profile with the image path
      return updateImage({ personId, imagePath });
    },
    onSuccess: async (response, variables) => {
      invalidateProfileQueries(queryClient);
      await refreshTokens();
      
      console.log("Profile image updated successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to update profile image:", error.message);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return changePassword({ ...data, userId: user.id });
    },
    onSuccess: (response) => {
      // Invalidate all queries since password change affects auth state
      queryClient.invalidateQueries();
      
      console.log("Password changed successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to change password:", error.message);
    },
  });
}