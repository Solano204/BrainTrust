"use server";

import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";



import { PaginatedResponse, PaginationParams } from "@/app/shared/types/pagination";
import { CreatePersonCommand, PaginatedResponseDTO, Person, PersonDTO, PersonSummary, PersonSummaryDTO, SuccessResponseDTO, UpdateImageCommand, UpdatePersonAddressCommand, UpdatePersonInfoCommand } from "../dtos/Person-dto";
import { mapPaginatedPersonResponseFromBackend, mapPersonFromBackend } from "../maps/person-mappers";

// ── Create ────────────────────────────────────────────────────────────────────

export async function createPerson(command: CreatePersonCommand): Promise<string> {
  try {
    const { data } = await apiClient.post<SuccessResponseDTO>("/api/persons", command);
    return data.data as string; // personId
  } catch (error) {
    return handleApiError(error);
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getPersonById(personId: string): Promise<Person> {
  try {
    const { data } = await apiClient.get<PersonDTO>(`/api/persons/${personId}`);
    return mapPersonFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getAllPersonsPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResponse<Person>> {
  try {
    const { page = 0, size = 20, sort = "registrationDate,desc" } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });
    const { data } = await apiClient.get<PaginatedResponseDTO<PersonDTO>>(
      `/api/persons/paginated?${queryParams.toString()}`
    );
    return mapPaginatedPersonResponseFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchPersonsByName(
  name: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<Person>> {
  try {
    const { page = 0, size = 20 } = params;
    const queryParams = new URLSearchParams({
      name,
      page: page.toString(),
      size: size.toString(),
    });
    const { data } = await apiClient.get<PaginatedResponseDTO<PersonDTO>>(
      `/api/persons/search?${queryParams.toString()}`
    );
    return mapPaginatedPersonResponseFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getAllPersonsSummary(): Promise<PersonSummary[]> {
  try {
    const { data } = await apiClient.get<PersonSummaryDTO[]>("/api/persons/summary");
    return data.map((d) => ({
      personId: d.personId,
      nombreCompleto: d.nombreCompleto,
      tieneUsuario: d.tieneUsuario,
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updatePersonInfo(command: UpdatePersonInfoCommand): Promise<void> {
  try {
    await apiClient.put("/api/persons/personal-info", command);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updatePersonAddress(command: UpdatePersonAddressCommand): Promise<void> {
  try {
    await apiClient.put("/api/persons/contact-address", command);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updatePersonImage(command: UpdateImageCommand): Promise<void> {
  try {
    await apiClient.put("/api/persons/profile-image", command);
  } catch (error) {
    return handleApiError(error);
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deletePerson(personId: string): Promise<SuccessResponseDTO> {
  try {
    const { data } = await apiClient.delete<SuccessResponseDTO>(`/api/persons/${personId}`);
    return data;
  } catch (error) {
    // 409 Conflict — person has linked user — return the error response
    if ((error as any)?.response?.status === 409) {
      return {
        success: false,
        message: (error as any).response.data?.message ?? "La persona tiene un usuario vinculado y no puede eliminarse.",
        data: null,
      };
    }
    return handleApiError(error);
  }
}