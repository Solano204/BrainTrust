import { UserRole } from "@/app/shared/dtos/user.dto";

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