import {
  CompleteUserResponseDTO,
  PaginatedResponseDTO,
  UserRole,
} from "@/app/shared/dtos/user.dto";
import { PaginatedResponse } from "@/app/shared/types/pagination";
import { User, UserDTO } from "@/components/admin/dtos/user-dto";

export function mapUserFromBackend(dto: UserDTO): User {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role as UserRole,
    active: dto.active,
    createdAt: dto.createdAt,
    person: {
      id: dto.person.id,
      curp: dto.person.curp,
      rfc: dto.person.rfc,
      primerNombre: dto.person.primerNombre,
      segundoNombre: dto.person.segundoNombre,
      apellidoPaterno: dto.person.apellidoPaterno,
      apellidoMaterno: dto.person.apellidoMaterno,
      nombreCompleto: dto.person.nombreCompleto,
      gender: dto.person.gender,
      phone: dto.person.phone,
      birthDate: dto.person.birthDate,
      age: dto.person.age,
      registrationDate: dto.person.registrationDate,
      imagePath: dto.person.imagePath,
      address: dto.person.address,
      tieneUsuario: dto.person.tieneUsuario,
    },
    studentId: dto.studentId,
  };
}

/** Maps the flat CompleteUserResponseDTO (legacy create endpoint) */
export function mapCompleteUserFromBackend(dto: CompleteUserResponseDTO): User {
  return {
    id: dto.userId,
    email: dto.email,
    role: dto.role as UserRole,
    active: dto.active,
    createdAt: dto.createdAt,
    person: {
      id: dto.personId,
      curp: null,
      rfc: null,
      // Legacy flat fields — backend sends firstName/lastName for this endpoint
      primerNombre: dto.firstName,
      segundoNombre: null,
      apellidoPaterno: dto.lastName,
      apellidoMaterno: null,
      nombreCompleto: dto.fullName,
      gender: dto.gender,
      phone: dto.phone,
      birthDate: null,
      age: null,
      registrationDate: dto.registrationDate,
      imagePath: dto.imagePath,
      address: dto.address,
      tieneUsuario: true,
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