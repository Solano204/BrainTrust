// ============================================================
// FILE 3: hooks/useCatalogs.ts
// ============================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllFirstNames, addFirstName, updateFirstName, deleteFirstName,
  fetchAllLastNames, addLastName, updateLastName, deleteLastName,
  fetchAllStates, addState, updateState, deleteState,
  fetchAllMunicipalities, fetchMunicipalitiesByState, addMunicipality, updateMunicipality, deleteMunicipality,
  fetchAllColonies, fetchColoniesByMunicipality, addColony, updateColony, deleteColony,
  fetchAllStreets, fetchStreetsByColony, addStreet, updateStreet, deleteStreet,
  fetchAllPostalCodes, fetchPostalCodesByColony, addPostalCode, updatePostalCode, deletePostalCode,
  fetchAllRoles, fetchAllRolesList, createRole, updateRole, deleteRole,
  fetchAllRoleActivities, fetchRoleActivitiesByRole, createRoleActivity, updateRoleActivity, deleteRoleActivity,
} from '../api/catalogApi';
import type {
  PageParams,
  CatalogValueRequest,
  CatalogMunicipalityRequest,
  CatalogColonyRequest,
  CatalogStreetRequest,
  CatalogPostalCodeRequest,
  CatRoleRequest,
  CatalogRoleActivityRequest,
} from '@/app/shared/admin/catalog.models';

const STALE = 1000 * 60 * 5;

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────
export const catalogKeys = {
  all: ['catalogs'] as const,

  firstNames: (params?: PageParams) => [...catalogKeys.all, 'first-names', params] as const,
  lastNames:  (params?: PageParams) => [...catalogKeys.all, 'last-names',  params] as const,
  states:     (params?: PageParams) => [...catalogKeys.all, 'states',      params] as const,

  municipalities:         (params?: PageParams)                       => [...catalogKeys.all, 'municipalities', params] as const,
  municipalitiesByState:  (stateId: number, params?: PageParams)      => [...catalogKeys.all, 'municipalities', 'by-state', stateId, params] as const,

  colonies:               (params?: PageParams)                       => [...catalogKeys.all, 'colonies', params] as const,
  coloniesByMunicipality: (municipalityId: number, params?: PageParams) => [...catalogKeys.all, 'colonies', 'by-municipality', municipalityId, params] as const,

  streets:                (params?: PageParams)                       => [...catalogKeys.all, 'streets', params] as const,
  streetsByColony:        (colonyId: number, params?: PageParams)     => [...catalogKeys.all, 'streets', 'by-colony', colonyId, params] as const,

  postalCodes:            (params?: PageParams)                       => [...catalogKeys.all, 'postal-codes', params] as const,
  postalCodesByColony:    (colonyId: number, params?: PageParams)     => [...catalogKeys.all, 'postal-codes', 'by-colony', colonyId, params] as const,

  roles:                  (params?: PageParams)                       => [...catalogKeys.all, 'roles', params] as const,
  rolesList:              ()                                          => [...catalogKeys.all, 'roles', 'list'] as const,

  roleActivities:         (params?: PageParams)                       => [...catalogKeys.all, 'role-activities', params] as const,
  roleActivitiesByRole:   (roleId: number, params?: PageParams)       => [...catalogKeys.all, 'role-activities', 'by-role', roleId, params] as const,
};

// Helper to invalidate all variants of a key prefix
function invalidatePrefix(qc: ReturnType<typeof useQueryClient>, key: readonly unknown[]) {
  qc.invalidateQueries({ queryKey: key, exact: false });
}

// ─────────────────────────────────────────────
// FIRST NAMES
// ─────────────────────────────────────────────
export function useFirstNames(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.firstNames(params),
    queryFn: () => fetchAllFirstNames(params),
    staleTime: STALE,
  });
}

export function useAddFirstName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogValueRequest) => addFirstName(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'first-names']),
  });
}

export function useUpdateFirstName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updateFirstName(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'first-names']),
  });
}

export function useDeleteFirstName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFirstName(id),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'first-names']),
  });
}

// ─────────────────────────────────────────────
// LAST NAMES
// ─────────────────────────────────────────────
export function useLastNames(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.lastNames(params),
    queryFn: () => fetchAllLastNames(params),
    staleTime: STALE,
  });
}

export function useAddLastName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogValueRequest) => addLastName(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'last-names']),
  });
}

export function useUpdateLastName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updateLastName(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'last-names']),
  });
}

export function useDeleteLastName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLastName(id),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'last-names']),
  });
}

// ─────────────────────────────────────────────
// STATES
// ─────────────────────────────────────────────
export function useStates(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.states(params),
    queryFn: () => fetchAllStates(params),
    staleTime: STALE,
  });
}

export function useAddState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogValueRequest) => addState(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'states']),
  });
}

export function useUpdateState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updateState(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'states']),
  });
}

export function useDeleteState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteState(id),
    onSuccess: () => {
      invalidatePrefix(qc, [...catalogKeys.all, 'states']);
      invalidatePrefix(qc, [...catalogKeys.all, 'municipalities']);
    },
  });
}

// ─────────────────────────────────────────────
// MUNICIPALITIES
// ─────────────────────────────────────────────
export function useMunicipalities(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.municipalities(params),
    queryFn: () => fetchAllMunicipalities(params),
    staleTime: STALE,
  });
}

export function useMunicipalitiesByState(stateId: number | null, params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.municipalitiesByState(stateId!, params),
    queryFn: () => fetchMunicipalitiesByState(stateId!, params),
    enabled: stateId !== null,
    staleTime: STALE,
  });
}

export function useAddMunicipality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogMunicipalityRequest) => addMunicipality(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'municipalities']),
  });
}

export function useUpdateMunicipality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updateMunicipality(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'municipalities']),
  });
}

export function useDeleteMunicipality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMunicipality(id),
    onSuccess: () => {
      invalidatePrefix(qc, [...catalogKeys.all, 'municipalities']);
      invalidatePrefix(qc, [...catalogKeys.all, 'colonies']);
    },
  });
}

// ─────────────────────────────────────────────
// COLONIES
// ─────────────────────────────────────────────
export function useColonies(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.colonies(params),
    queryFn: () => fetchAllColonies(params),
    staleTime: STALE,
  });
}

export function useColoniesByMunicipality(municipalityId: number | null, params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.coloniesByMunicipality(municipalityId!, params),
    queryFn: () => fetchColoniesByMunicipality(municipalityId!, params),
    enabled: municipalityId !== null,
    staleTime: STALE,
  });
}

export function useAddColony() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogColonyRequest) => addColony(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'colonies']),
  });
}

export function useUpdateColony() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updateColony(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'colonies']),
  });
}

export function useDeleteColony() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteColony(id),
    onSuccess: () => {
      invalidatePrefix(qc, [...catalogKeys.all, 'colonies']);
      invalidatePrefix(qc, [...catalogKeys.all, 'streets']);
      invalidatePrefix(qc, [...catalogKeys.all, 'postal-codes']);
    },
  });
}

// ─────────────────────────────────────────────
// STREETS
// ─────────────────────────────────────────────
export function useStreets(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.streets(params),
    queryFn: () => fetchAllStreets(params),
    staleTime: STALE,
  });
}

export function useStreetsByColony(colonyId: number | null, params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.streetsByColony(colonyId!, params),
    queryFn: () => fetchStreetsByColony(colonyId!, params),
    enabled: colonyId !== null,
    staleTime: STALE,
  });
}

export function useAddStreet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogStreetRequest) => addStreet(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'streets']),
  });
}

export function useUpdateStreet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updateStreet(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'streets']),
  });
}

export function useDeleteStreet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStreet(id),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'streets']),
  });
}

// ─────────────────────────────────────────────
// POSTAL CODES
// ─────────────────────────────────────────────
export function usePostalCodes(params: PageParams = {}) {
  return useQuery({
    queryKey: catalogKeys.postalCodes(params),
    queryFn: () => fetchAllPostalCodes(params),
    staleTime: STALE,
  });
}

export function usePostalCodesByColony(colonyId: number | null, params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.postalCodesByColony(colonyId!, params),
    queryFn: () => fetchPostalCodesByColony(colonyId!, params),
    enabled: colonyId !== null,
    staleTime: STALE,
  });
}

export function useAddPostalCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogPostalCodeRequest) => addPostalCode(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'postal-codes']),
  });
}

export function useUpdatePostalCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogValueRequest }) => updatePostalCode(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'postal-codes']),
  });
}

export function useDeletePostalCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePostalCode(id),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'postal-codes']),
  });
}

// ─────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────
export function useRoles(params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.roles(params),
    queryFn: () => fetchAllRoles(params),
    staleTime: STALE,
  });
}

/** Flat list — used by dropdowns inside role-activities panel */
export function useRolesList() {
  return useQuery({
    queryKey: catalogKeys.rolesList(),
    queryFn: () => fetchAllRolesList(),
    staleTime: STALE,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatRoleRequest) => createRole(req),
    onSuccess: () => {
      invalidatePrefix(qc, [...catalogKeys.all, 'roles']);
    },
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatRoleRequest }) => updateRole(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'roles']),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => {
      invalidatePrefix(qc, [...catalogKeys.all, 'roles']);
      invalidatePrefix(qc, [...catalogKeys.all, 'role-activities']);
    },
  });
}

// ─────────────────────────────────────────────
// ROLE ACTIVITIES
// ─────────────────────────────────────────────
export function useRoleActivities(params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.roleActivities(params),
    queryFn: () => fetchAllRoleActivities(params),
    staleTime: STALE,
  });
}

export function useRoleActivitiesByRole(roleId: number | null, params: Omit<PageParams, 'search'> = {}) {
  return useQuery({
    queryKey: catalogKeys.roleActivitiesByRole(roleId!, params),
    queryFn: () => fetchRoleActivitiesByRole(roleId!, params),
    enabled: roleId !== null,
    staleTime: STALE,
  });
}

export function useCreateRoleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CatalogRoleActivityRequest) => createRoleActivity(req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'role-activities']),
  });
}

export function useUpdateRoleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: CatalogRoleActivityRequest }) => updateRoleActivity(id, req),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'role-activities']),
  });
}

export function useDeleteRoleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRoleActivity(id),
    onSuccess: () => invalidatePrefix(qc, [...catalogKeys.all, 'role-activities']),
  });
}