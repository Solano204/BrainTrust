'use client';


import { PaginationParams, UserRole } from "../api/usersApi";

export const usersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...usersKeys.lists(), params] as const,
  paginated: (params: PaginationParams) => [...usersKeys.all, 'paginated', params] as const,
  byRolePaginated: (role: UserRole, params: Omit<PaginationParams, 'role'>) => 
    [...usersKeys.all, 'role', role, 'paginated', params] as const,
  searchPaginated: (search: string, params: Omit<PaginationParams, 'search'>) => 
    [...usersKeys.all, 'search', search, 'paginated', params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  stats: () => [...usersKeys.all, 'stats'] as const,
};