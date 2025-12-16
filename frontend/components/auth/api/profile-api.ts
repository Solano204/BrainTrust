// api/profile-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";



// types/profile.ts
export interface UserProfile {
  userId: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  
  // Person information
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  phone: string;
  imagePath: string;
  registrationDate: string;
  
  // Address information
  address?: {
    street: string;
    colony: string;
    municipality: string;
    state: string;
    postalCode: string;
  };
  
  // Student-specific (if applicable)
  studentId?: string;
}

export interface UpdatePersonalInfoRequest {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
}

export interface UpdateAddressRequest {
  personId: string;
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

export interface UpdateImageRequest {
  personId: string;
  imagePath: string;
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';



// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding token
apiClient.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API errors
const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message;
    console.error("Profile API Error:", errorMessage);
    throw new Error(errorMessage);
  }
  throw error;
};

// Map backend user to profile
function mapUserToProfile(backendUser: any) {
  return {
    userId: backendUser.id,
    email: backendUser.email,
    role: backendUser.role,
    active: backendUser.active,
    createdAt: backendUser.createdAt,
    
    // Person information
    personId: backendUser.person?.id || '',
    firstName: backendUser.person?.firstName || '',
    lastName: backendUser.person?.lastName || '',
    fullName: backendUser.person?.fullName || '',
    gender: backendUser.person?.gender || 'OTHER',
    phone: backendUser.person?.phone || '',
    imagePath: backendUser.person?.imagePath || '',
    registrationDate: backendUser.person?.registrationDate || '',
    
    // Address information
    address: backendUser.person?.address ? {
      street: backendUser.person.address.street || '',
      colony: backendUser.person.address.colony || '',
      municipality: backendUser.person.address.municipality || '',
      state: backendUser.person.address.state || '',
      postalCode: backendUser.person.address.postalCode || ''
    } : undefined,
    
    // Student-specific
    studentId: backendUser.studentId || undefined
  };
}

// Individual async functions (not an object)

/**
 * Get current user's profile
 */
export async function getProfile() {
  try {
    // First get user ID from token
    const cookieStore = await cookies();
    const userData = cookieStore.get("user_data")?.value;
    let userId = '';
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      userId = parsedUser.id;
    }
    
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    // Fetch user details
    const response = await apiClient.get(`/api/users/${userId}`);
    
    return mapUserToProfile(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update personal information (PII)
 * Backend endpoint: PUT /api/users/personal-info
 */
export async function updatePersonalInfo(data: {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
}) {
  try {
    const response = await apiClient.put(
      '/api/users/personal-info',
      data
    );
    
    console.log(`Updated personal info for user ${data.userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update address
 * Backend endpoint: PUT /api/persons/contact-address
 */
export async function updateAddress(data: {
  personId: string;
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}) {
  try {
    const response = await apiClient.put(
      '/api/persons/contact-address',
      data
    );
    
    console.log(`Updated address for person ${data.personId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update profile image
 * Backend endpoint: PUT /api/persons/profile-image
 */
export async function updateImage(data: {
  personId: string;
  imagePath: string;
}) {
  try {
    const response = await apiClient.put(
      '/api/persons/profile-image',
      data
    );
    
    console.log(`Updated image for person ${data.personId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Upload image file
 */


/**
 * Change password
 * Backend endpoint: PUT /api/users/password
 */
export async function changePassword(data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const response = await apiClient.put(
      '/api/users/password',
      data
    );
    
    console.log(`Changed password for user ${data.userId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}