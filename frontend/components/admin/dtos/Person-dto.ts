export interface AddressDTO {
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

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

export interface PersonSummaryDTO {
  personId: string;
  nombreCompleto: string;
  tieneUsuario: boolean;
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

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}


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
  curp: string | null;
  rfc: string | null;
  primerNombre: string;
  segundoNombre: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  nombreCompleto: string;
  gender: string;
  phone: string;
  birthDate: string | null;
  age: number | null;
  registrationDate: string;
  imagePath: string;
  address: Address | null;
  tieneUsuario: boolean;
}

export interface PersonSummary {
  personId: PersonId;
  nombreCompleto: string;
  tieneUsuario: boolean;
}


export interface CreatePersonCommand {
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp?: string;
  rfc?: string;
  gender?: string;
  phone?: string;
  street: string;
  colony: string;
  municipality: string;
  state: string;
  postalCode: string;
}

export interface UpdatePersonInfoCommand {
  personId: string;
  primerNombre: string;
  segundoNombre?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  gender?: string;
  phone?: string;
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