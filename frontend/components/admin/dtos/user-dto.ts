import { UserId } from "@/app/domain/valueObjects";
import { Person } from "./Person-dto";

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
  role: UserRole;
  userId?: string;
}

/** Create a user account linked to an already-existing person */
export interface RegisterUserForExistingPersonCommand {
  personId: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string; // required only when role = STUDENT
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

export interface AdminChangePasswordCommand {
  userId: string;
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

export interface User {
    id: UserId;
    email: string;
    role: UserRole;
    active: boolean;
    createdAt: string;
    person: Person;
    studentId?: string | null;
}


export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface AddressDTO {
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

/** PersonDTO as returned by the backend inside UserDTO */
export interface PersonDTO {
  id: string;
  curp: string | null;
  rfc: string | null;
  primerNombre: string;
  segundoNombre: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  nombreCompleto: string;
  gender: string;
  phone: string;
  birthDate: string | null;   // "YYYY-MM-DD"
  age: number | null;
  registrationDate: string;
  imagePath: string;
  address: AddressDTO | null;
  tieneUsuario: boolean;
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
  // Legacy flat fields from CompleteUserDTO (backend still sends these)
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