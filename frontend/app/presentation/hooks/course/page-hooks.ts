// File: src/app/features/courses/hooks/page-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pageKeys } from "@/app/infraestructure/api/course/units/resources/page-keys";
import {
  fetchPagesByUnit,
  fetchPageById,
  createPage,
  updatePage,
  deletePage
} from "@/app/infraestructure/api/course/units/resources/page-api";
import { Page} from "@/app/domain/entities/CourseEntities";

import { CourseId, UnitId } from "@/app/domain/valueObjects";
export function usePagesByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<Page[]>({
    queryKey: pageKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchPagesByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
      // Remove any refetchOnMount, refetchOnWindowFocus if present
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function usePageMutations() {
  const queryClient = useQueryClient();

  const createPageMutation = useMutation({
    mutationFn: ({ 
      courseId, 
      unitId, 
      pageData 
    }: { 
      courseId: CourseId; 
      unitId: UnitId; 
      pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">;
    }) => createPage(courseId, unitId, pageData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.list(variables.courseId, variables.unitId) 
      });
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      pageData 
    }: { 
      pageId: string; 
      pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>;
    }) => updatePage(pageId, pageData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  return {
    createPage: createPageMutation,
    updatePage: updatePageMutation,
    deletePage: deletePageMutation
  };
}