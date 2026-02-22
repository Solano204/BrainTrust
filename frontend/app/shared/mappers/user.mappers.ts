import {
    UserDTO,
    CompleteUserResponseDTO,
    PaginatedResponseDTO,
    UserRole
} from "@/app/shared/dtos/user.dto";
import { User } from "@/app/shared/models/user.model";
import { PaginatedResponse } from "@/app/shared/types/pagination";

export function mapUserFromBackend(dto: UserDTO): User {
    return {
        id: dto.id,
        email: dto.email,
        role: dto.role as UserRole,
        active: dto.active,
        createdAt: dto.createdAt,
        person: {
            id: dto.person.id,
            firstName: dto.person.firstName,
            lastName: dto.person.lastName,
            fullName: dto.person.fullName,
            gender: dto.person.gender,
            phone: dto.person.phone,
            registrationDate: dto.person.registrationDate,
            imagePath: dto.person.imagePath,
            address: dto.person.address,
        },
        studentId: dto.studentId,
    };
}

export function mapCompleteUserFromBackend(dto: CompleteUserResponseDTO): User {
    return {
        id: dto.userId,
        email: dto.email,
        role: dto.role as UserRole,
        active: dto.active,
        createdAt: dto.createdAt,
        person: {
            id: dto.personId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            fullName: dto.fullName,
            gender: dto.gender,
            phone: dto.phone,
            registrationDate: dto.registrationDate,
            imagePath: dto.imagePath,
            address: dto.address,
        },
        studentId: dto.studentId,
    };
}

export function mapPaginatedUserResponseFromBackend<T, U>(
    dto: PaginatedResponseDTO<U>,
    mapper: (item: U) => T
): PaginatedResponse<T> {
    return {
        content: dto.content.map(mapper),
        pageNumber: dto.pageNumber,
        pageSize: dto.pageSize,
        totalElements: dto.totalElements,
        totalPages: dto.totalPages,
        first: dto.first,
        last: dto.last,
    };
}