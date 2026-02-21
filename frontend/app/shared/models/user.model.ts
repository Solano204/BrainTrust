import { UserRole, UserStatus } from "@/app/shared/dtos/user.dto";

export type CourseId = string;
export type UserId = string;
export type PersonId = string;

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

export interface Teacher {
    userId: string;
    personId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
}

export interface Student {
    userId: string;
    personId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    studentRefId: string;
    isAlreadyEnrolled: boolean;
    enrollmentId: string | null;
    enrollmentStatus: string | null;
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

export interface UserFilters {
    search?: string;
    role?: UserRole | "all";
    status?: UserStatus;
    sortBy?: "name" | "email" | "createdAt" | "lastLogin";
    sortOrder?: "asc" | "desc";
}