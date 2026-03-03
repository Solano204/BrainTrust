"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
        import {
  getAllPersonsPaginated,
  searchPersonsByName,
  getPersonById,
  getAllPersonsSummary,
  createPerson,
  updatePersonInfo,
  updatePersonAddress,
  deletePerson,
} from "@/components/admin/api/Personsapi";
import { PaginationParams, PaginatedResponse } from "@/app/shared/types/pagination";

import { personsKeys } from "./persons-keys";
import { CreatePersonCommand, Person, PersonSummary } from "../dtos/Person-dto";

// ── Queries ───────────────────────────────────────────────────────────────────

export function usePersonsPaginated(params: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Person>, Error>({
    queryKey: personsKeys.paginated(params),
    queryFn: () => getAllPersonsPaginated(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSearchPersonsPaginated(search: string, params: PaginationParams = {}) {
  return useQuery<PaginatedResponse<Person>, Error>({
    queryKey: personsKeys.searchPaginated(search, params),
    queryFn: () => searchPersonsByName(search, params),
    enabled: search.length >= 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function usePersonById(personId: string) {
  return useQuery<Person, Error>({
    queryKey: personsKeys.detail(personId),
    queryFn: () => getPersonById(personId),
    enabled: !!personId,
  });
}

export function usePersonsSummary() {
  return useQuery<PersonSummary[], Error>({
    queryKey: personsKeys.summary(),
    queryFn: getAllPersonsSummary,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function usePersonMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: personsKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: personsKeys.all }),
      queryClient.invalidateQueries({ queryKey: personsKeys.summary() }),
    ]);
  };

 const createPersonMutation = useMutation({
    mutationFn: (command: CreatePersonCommand) => createPerson(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personsKeys.all });
    },
  });
  const updatePersonInfoMutation = useMutation({
    mutationFn: updatePersonInfo,
    onSuccess: async (_, variables) => {
      await invalidateAll();
      queryClient.invalidateQueries({ queryKey: personsKeys.detail(variables.personId) });
    },
    onError: (error: Error) => { console.error("Error updating person:", error.message); },
  });

  const updatePersonAddressMutation = useMutation({
    mutationFn: updatePersonAddress,
    onSuccess: async (_, variables) => {
      await invalidateAll();
      queryClient.invalidateQueries({ queryKey: personsKeys.detail(variables.personId) });
    },
    onError: (error: Error) => { console.error("Error updating address:", error.message); },
  });

  const deletePersonMutation = useMutation({
    mutationFn: deletePerson,
    onSuccess: async (result, personId) => {
      if (result.success) {
        queryClient.removeQueries({ queryKey: personsKeys.detail(personId) });
        await invalidateAll();
      }
    },
    onError: (error: Error) => { console.error("Error deleting person:", error.message); },
  });

  return {
    createPerson: createPersonMutation,
    updatePersonInfo: updatePersonInfoMutation,
    updatePersonAddress: updatePersonAddressMutation,
    deletePerson: deletePersonMutation,
  };
}