
"use server";


import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";
import type {
  CatalogItem,
  CatalogMunicipality,
  CatalogColony,
  CatalogStreet,
  CatalogPostalCode,
  CatRole,
  CatalogRoleActivity,
  PagedResponse,
  PageParams,
  CatalogValueRequest,
  CatalogMunicipalityRequest,
  CatalogColonyRequest,
  CatalogStreetRequest,
  CatalogPostalCodeRequest,
  CatRoleRequest,
  CatalogRoleActivityRequest,
  CatalogSuccessResponse,
} from "@/app/shared/admin/catalog.models";

const BASE = "/api/catalogs";

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  return q.toString() ? `?${q.toString()}` : '';
}


export async function fetchAllFirstNames(params: PageParams = {}): Promise<PagedResponse<CatalogItem>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogItem>>(
      `${BASE}/first-names${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addFirstName(request: CatalogValueRequest): Promise<CatalogItem> {
  try {
    const { data } = await apiClient.post<CatalogItem>(`${BASE}/first-names`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateFirstName(id: number, request: CatalogValueRequest): Promise<CatalogItem | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogItem>(`${BASE}/first-names/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteFirstName(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/first-names/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllLastNames(params: PageParams = {}): Promise<PagedResponse<CatalogItem>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogItem>>(
      `${BASE}/last-names${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addLastName(request: CatalogValueRequest): Promise<CatalogItem> {
  try {
    const { data } = await apiClient.post<CatalogItem>(`${BASE}/last-names`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateLastName(id: number, request: CatalogValueRequest): Promise<CatalogItem | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogItem>(`${BASE}/last-names/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteLastName(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/last-names/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllStates(params: PageParams = {}): Promise<PagedResponse<CatalogItem>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogItem>>(
      `${BASE}/states${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addState(request: CatalogValueRequest): Promise<CatalogItem> {
  try {
    const { data } = await apiClient.post<CatalogItem>(`${BASE}/states`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateState(id: number, request: CatalogValueRequest): Promise<CatalogItem | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogItem>(`${BASE}/states/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteState(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/states/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllMunicipalities(params: PageParams = {}): Promise<PagedResponse<CatalogMunicipality>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogMunicipality>>(
      `${BASE}/municipalities${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchMunicipalitiesByState(stateId: number, params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatalogMunicipality>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogMunicipality>>(
      `${BASE}/municipalities/by-state/${stateId}${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addMunicipality(request: CatalogMunicipalityRequest): Promise<CatalogMunicipality> {
  try {
    const { data } = await apiClient.post<CatalogMunicipality>(`${BASE}/municipalities`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateMunicipality(id: number, request: CatalogValueRequest): Promise<CatalogMunicipality | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogMunicipality>(`${BASE}/municipalities/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteMunicipality(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/municipalities/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllColonies(params: PageParams = {}): Promise<PagedResponse<CatalogColony>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogColony>>(
      `${BASE}/colonies${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchColoniesByMunicipality(municipalityId: number, params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatalogColony>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogColony>>(
      `${BASE}/colonies/by-municipality/${municipalityId}${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addColony(request: CatalogColonyRequest): Promise<CatalogColony> {
  try {
    const { data } = await apiClient.post<CatalogColony>(`${BASE}/colonies`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateColony(id: number, request: CatalogValueRequest): Promise<CatalogColony | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogColony>(`${BASE}/colonies/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteColony(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/colonies/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllStreets(params: PageParams = {}): Promise<PagedResponse<CatalogStreet>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogStreet>>(
      `${BASE}/streets${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchStreetsByColony(colonyId: number, params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatalogStreet>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogStreet>>(
      `${BASE}/streets/by-colony/${colonyId}${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addStreet(request: CatalogStreetRequest): Promise<CatalogStreet> {
  try {
    const { data } = await apiClient.post<CatalogStreet>(`${BASE}/streets`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateStreet(id: number, request: CatalogValueRequest): Promise<CatalogStreet | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogStreet>(`${BASE}/streets/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteStreet(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/streets/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllPostalCodes(params: PageParams = {}): Promise<PagedResponse<CatalogPostalCode>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogPostalCode>>(
      `${BASE}/postal-codes${buildQuery({ page: params.page ?? 0, size: params.size ?? 20, search: params.search })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchPostalCodesByColony(colonyId: number, params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatalogPostalCode>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogPostalCode>>(
      `${BASE}/postal-codes/by-colony/${colonyId}${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function addPostalCode(request: CatalogPostalCodeRequest): Promise<CatalogPostalCode> {
  try {
    const { data } = await apiClient.post<CatalogPostalCode>(`${BASE}/postal-codes`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updatePostalCode(id: number, request: CatalogValueRequest): Promise<CatalogPostalCode | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogPostalCode>(`${BASE}/postal-codes/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deletePostalCode(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/postal-codes/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllRoles(params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatRole>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatRole>>(
      `${BASE}/roles${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchAllRolesList(): Promise<CatRole[]> {
  try {
    const { data } = await apiClient.get<CatRole[]>(`${BASE}/roles/all`);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchRoleById(id: number): Promise<CatRole> {
  try {
    const { data } = await apiClient.get<CatRole>(`${BASE}/roles/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function createRole(request: CatRoleRequest): Promise<CatRole> {
  try {
    const { data } = await apiClient.post<CatRole>(`${BASE}/roles`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateRole(id: number, request: CatRoleRequest): Promise<CatRole | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatRole>(`${BASE}/roles/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteRole(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/roles/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}


export async function fetchAllRoleActivities(params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatalogRoleActivity>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogRoleActivity>>(
      `${BASE}/role-activities${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchRoleActivitiesByRole(roleId: number, params: Omit<PageParams, 'search'> = {}): Promise<PagedResponse<CatalogRoleActivity>> {
  try {
    const { data } = await apiClient.get<PagedResponse<CatalogRoleActivity>>(
      `${BASE}/role-activities/by-role/${roleId}${buildQuery({ page: params.page ?? 0, size: params.size ?? 20 })}`
    );
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function fetchRoleActivityById(id: number): Promise<CatalogRoleActivity> {
  try {
    const { data } = await apiClient.get<CatalogRoleActivity>(`${BASE}/role-activities/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function createRoleActivity(request: CatalogRoleActivityRequest): Promise<CatalogRoleActivity> {
  try {
    const { data } = await apiClient.post<CatalogRoleActivity>(`${BASE}/role-activities`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function updateRoleActivity(id: number, request: CatalogRoleActivityRequest): Promise<CatalogRoleActivity | CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.put<CatalogRoleActivity>(`${BASE}/role-activities/${id}`, request);
    return data;
  } catch (error) { return handleApiError(error); }
}

export async function deleteRoleActivity(id: number): Promise<CatalogSuccessResponse> {
  try {
    const { data } = await apiClient.delete<CatalogSuccessResponse>(`${BASE}/role-activities/${id}`);
    return data;
  } catch (error) { return handleApiError(error); }
}
