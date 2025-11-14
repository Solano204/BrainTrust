// app/utils/Domain/AuthenticationActions/AuthUser.ts
"use server";
import { UserRole } from "@/app/types/authentication";
import { cookies } from "next/headers";

export interface Session {
  idUser: string;
  token: string;
}

export async function getAuthUser(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    const id = cookieStore.get("sessionId")?.value;

    // For mock data, if we don't have cookies but have localStorage data (client-side)
    // This is a hybrid approach for testing
    if (!token || !id) {
      return { idUser: "", token: "" };
    }

    return {
      idUser: id || "",
      token: token || "",
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return { idUser: "", token: "" };
  }
}

export async function getAuthUserRole(): Promise<UserRole | null> {
  try {
    const user = await getAuthUser();
    if (!user.idUser || !user.token) return null;

    // In real app, decode JWT or call backend
    // For mock, check localStorage
    return null; // Will be handled by client-side context
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function isUserAdmin(): Promise<boolean> {
  try {
    const adminId = process.env.ID_ADMIN;
    const user = await getAuthUser();
    
    if (!user.idUser || !user.token) return false;

    // Mock admin check - in real app, verify with backend
    const tokenAccess = (await cookies()).get("session")?.value;
    const sessionId = (await cookies()).get("sessionId")?.value;

    return !!(tokenAccess && sessionId === adminId);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getPhotoUser(): Promise<string> {
  try {
    const photo = (await cookies()).get("photo")?.value;
    return photo || "";
  } catch (error) {
    console.error('Error getting user photo:', error);
    return "";
  }
}

// Helper functions for cookie management
export async function setAuthCookies(userId: string, token: string, photo?: string): Promise<void> {
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days

  cookieStore.set("session", token, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookieStore.set("sessionId", userId, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  if (photo) {
    cookieStore.set("photo", photo, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
}

export async function deleteAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("sessionId");
  cookieStore.delete("photo");
}