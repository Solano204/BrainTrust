export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface AddressDTO {
    street: string;
    colony: string;
    municipality: string;
    state: string;
    postalCode: string;
}

export interface PersonDTO {
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

export interface UserDTO {
    id: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    person: PersonDTO;
    studentId?: string | null;
}

export interface CompleteUserResponseDTO {
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

export interface TeacherDTO {
    userId: string;
    personId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
}

export interface StudentDTO {
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

export interface UserStatsDTO {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    teachers: number;
    students: number;
    admins: number;
}

export interface SuccessResponseDTO {
    success: boolean;
    message: string;
    data: any;
}

export interface PaginatedResponseDTO<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}