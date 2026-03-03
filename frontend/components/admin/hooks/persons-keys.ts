import { PaginationParams } from "@/app/shared/types/pagination";

export const personsKeys = {
  all: ["admin", "persons"] as const,
  lists: () => [...personsKeys.all, "list"] as const,
  list: (params: PaginationParams) => [...personsKeys.lists(), params] as const,
  paginated: (params: PaginationParams) => [...personsKeys.all, "paginated", params] as const,
  searchPaginated: (search: string, params: PaginationParams) =>
    [...personsKeys.all, "search", search, "paginated", params] as const,
  details: () => [...personsKeys.all, "detail"] as const,
  detail: (id: string) => [...personsKeys.details(), id] as const,
  summary: () => [...personsKeys.all, "summary"] as const,
};