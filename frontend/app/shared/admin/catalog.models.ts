// ============================================================
// FILE 1: types/catalog.types.ts
// ============================================================

// ─── Core DTOs ───────────────────────────────────────────────────

export interface CatalogItem {
  id: number;
  value: string;
}
// ============================================================
// FILE 1: types/catalog.types.ts
// ============================================================

// ─── Core DTOs ───────────────────────────────────────────────────

export interface CatalogItem {
  id: number;
  value: string;
}

export interface CatalogMunicipality {
  id: number;
  municipalityName: string;
  stateId: number;
}

export interface CatalogColony {
  id: number;
  colonyName: string;
  municipalityId: number;
}

export interface CatalogStreet {
  id: number;
  streetName: string;
  colonyId: number;
}

export interface CatalogPostalCode {
  id: number;
  postalCode: string;
  colonyId: number;
}

export interface RoleActivitySummary {
  id: number;
  code: string;
  activity: string;
  description: string;
}

export interface CatRole {
  id: number;
  code: string;
  description: string;
  activities: RoleActivitySummary[];
}

export interface CatalogRoleActivity {
  id: number;
  code: string;
  activity: string;
  description: string;
}

// ─── Pagination ───────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  search?: string;
}

// ─── Request Bodies ───────────────────────────────────────────────

export interface CatalogValueRequest {
  value: string;
}

export interface CatalogMunicipalityRequest {
  stateId: number;
  municipalityName: string;
}

export interface CatalogColonyRequest {
  municipalityId: number;
  colonyName: string;
}

export interface CatalogStreetRequest {
  colonyId: number;
  streetName: string;
}

export interface CatalogPostalCodeRequest {
  colonyId: number;
  postalCode: string;
}

export interface CatRoleRequest {
  code: string;
  description: string;
}

export interface CatalogRoleActivityRequest {
  roleId: number;
  code: string;
  activity: string;
  description: string;
}

// ─── Backend Success/Error Response ──────────────────────────────

export interface CatalogSuccessResponse {
  success: boolean;
  message: string;
  data: unknown | null;
}

export type CatalogSectionKey =
  | 'first-names'
  | 'last-names'
  | 'states'
  | 'municipalities'
  | 'colonies'
  | 'streets'
  | 'postal-codes'
  | 'roles'
  | 'role-activities';

export interface CatalogMunicipality {
  id: number;
  municipalityName: string;
  stateId: number;
}

export interface CatalogColony {
  id: number;
  colonyName: string;
  municipalityId: number;
}

export interface CatalogStreet {
  id: number;
  streetName: string;
  colonyId: number;
}

export interface CatalogPostalCode {
  id: number;
  postalCode: string;
  colonyId: number;
}

export interface CatRole {
  id: number;
  code: string;
  description: string;
}

export interface CatalogRoleActivity {
  id: number;
  roleId: number;
  [key: string]: unknown;
}

// ─── Pagination ───────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageParams {
  page?: number;
  size?: number;
  search?: string;
}

// ─── Request Bodies ───────────────────────────────────────────────

export interface CatalogValueRequest {
  value: string;
}

export interface CatalogMunicipalityRequest {
  stateId: number;
  municipalityName: string;
}

export interface CatalogColonyRequest {
  municipalityId: number;
  colonyName: string;
}

export interface CatalogStreetRequest {
  colonyId: number;
  streetName: string;
}

export interface CatalogPostalCodeRequest {
  colonyId: number;
  postalCode: string;
}

export interface CatRoleRequest {
  code: string;
  description: string;
}

export interface CatalogRoleActivityRequest {
  roleId: number;
  [key: string]: unknown;
}

// ─── Backend Success/Error Response ──────────────────────────────

export interface CatalogSuccessResponse {
  success: boolean;
  message: string;
  data: unknown | null;
}

