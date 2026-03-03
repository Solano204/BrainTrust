import { PaginatedResponse } from "@/app/shared/types/pagination";
import { PaginatedResponseDTO, Person, PersonDTO } from "../dtos/Person-dto";

export function mapPersonFromBackend(dto: PersonDTO): Person {
  return {
    id: dto.id,
    curp: dto.curp,
    rfc: dto.rfc,
    primerNombre: dto.primerNombre,
    segundoNombre: dto.segundoNombre,
    apellidoPaterno: dto.apellidoPaterno,
    apellidoMaterno: dto.apellidoMaterno,
    nombreCompleto: dto.nombreCompleto,
    gender: dto.gender,
    phone: dto.phone,
    birthDate: dto.birthDate,
    age: dto.age,
    registrationDate: dto.registrationDate,
    imagePath: dto.imagePath,
    address: dto.address,
    tieneUsuario: dto.tieneUsuario,
  };
}

export function mapPaginatedPersonResponseFromBackend(
  dto: PaginatedResponseDTO<PersonDTO>
): PaginatedResponse<Person> {  
  return {
    content: dto.content.map(mapPersonFromBackend),
    pageNumber: dto.pageNumber,
    pageSize: dto.pageSize,
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
    first: dto.first,
    last: dto.last,
  };
}