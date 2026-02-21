"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pageKeys } from "@/app/infraestructure/api/course/units/resources/page-keys";
import { Page } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";
import { 
  addLinkToPage, 
  addMultipleLinksToPage, 
  clearAllLinksFromPage, 
  createPage, 
  deletePage, 
  fetchPagesByUnit,
  fetchPageById,
  isValidUrl, 
  processLinks, 
  removeLinkFromPage, 
  removeMultipleLinksFromPage, 
  replaceAllPageLinks, 
  updatePage, 
  updatePageLinks,
  addAttachmentToPage,
  addMultipleAttachmentsToPage,
  removeAttachmentFromPage,
  removeMultipleAttachmentsFromPage,
  updatePageAttachments,
  replaceAllPageAttachments,
  isValidFileSize,
  isValidFileType,
  processFiles
} from "../api/page";

export function usePagesByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<Page[]>({
    queryKey: pageKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchPagesByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function usePage(pageId: string | null) {
  return useQuery<Page>({
    queryKey: pageKeys.detail(pageId || ""),
    queryFn: () => fetchPageById(pageId!),
    enabled: !!pageId,
    staleTime: 300000,
  });
}


export function usePageMutations() {
  const queryClient = useQueryClient();

  const createPageMutation = useMutation({
    mutationFn: ({ 
      courseId, 
      unitId, 
      pageData,
      attachments 
    }: { 
      courseId: CourseId; 
      unitId: UnitId; 
      pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">;
      attachments?: File[];
    }) => createPage(courseId, unitId, pageData, attachments),
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
    onSuccess: (_, variables) => {
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


export function usePageLinkMutations() {
  const queryClient = useQueryClient();

  const addLinkMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      linkUrl 
    }: { 
      pageId: string; 
      linkUrl: string;
    }) => addLinkToPage(pageId, linkUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const addMultipleLinksMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      links 
    }: { 
      pageId: string; 
      links: string[];
    }) => addMultipleLinksToPage(pageId, links),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const removeLinkMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      linkUrl 
    }: { 
      pageId: string; 
      linkUrl: string;
    }) => removeLinkFromPage(pageId, linkUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const removeMultipleLinksMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      links 
    }: { 
      pageId: string; 
      links: string[];
    }) => removeMultipleLinksFromPage(pageId, links),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const clearLinksMutation = useMutation({
    mutationFn: (pageId: string) => clearAllLinksFromPage(pageId),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const updateLinksMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      newLinks, 
      oldLinks 
    }: { 
      pageId: string; 
      newLinks: string[]; 
      oldLinks: string[];
    }) => updatePageLinks(pageId, newLinks, oldLinks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const replaceLinksMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      links 
    }: { 
      pageId: string; 
      links: string[];
    }) => replaceAllPageLinks(pageId, links),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  return {
    addLink: addLinkMutation,
    addMultipleLinks: addMultipleLinksMutation,
    removeLink: removeLinkMutation,
    removeMultipleLinks: removeMultipleLinksMutation,
    clearLinks: clearLinksMutation,
    updateLinks: updateLinksMutation,
    replaceLinks: replaceLinksMutation
  };
}


export function usePageAttachmentMutations() {
  const queryClient = useQueryClient();

  const addAttachmentMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      file 
    }: { 
      pageId: string; 
      file: File;
    }) => addAttachmentToPage(pageId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const addMultipleAttachmentsMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      files 
    }: { 
      pageId: string; 
      files: File[];
    }) => addMultipleAttachmentsToPage(pageId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      documentName 
    }: { 
      pageId: string; 
      documentName: string;
    }) => removeAttachmentFromPage(pageId, documentName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const removeMultipleAttachmentsMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      documentNames 
    }: { 
      pageId: string; 
      documentNames: string[];
    }) => removeMultipleAttachmentsFromPage(pageId, documentNames),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const updateAttachmentsMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      newFiles, 
      oldDocumentNames 
    }: { 
      pageId: string; 
      newFiles: File[]; 
      oldDocumentNames: string[];
    }) => updatePageAttachments(pageId, newFiles, oldDocumentNames),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  const replaceAttachmentsMutation = useMutation({
    mutationFn: ({ 
      pageId, 
      files 
    }: { 
      pageId: string; 
      files: File[];
    }) => replaceAllPageAttachments(pageId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.detail(variables.pageId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: pageKeys.lists() 
      });
    }
  });

  return {
    addAttachment: addAttachmentMutation,
    addMultipleAttachments: addMultipleAttachmentsMutation,
    removeAttachment: removeAttachmentMutation,
    removeMultipleAttachments: removeMultipleAttachmentsMutation,
    updateAttachments: updateAttachmentsMutation,
    replaceAttachments: replaceAttachmentsMutation
  };
}


export function usePageContentManagement(pageId: string) {
  const linkMutations = usePageLinkMutations();
  const attachmentMutations = usePageAttachmentMutations();
  
  const isLoadingLinks = 
    linkMutations.addLink.isPending ||
    linkMutations.addMultipleLinks.isPending ||
    linkMutations.removeLink.isPending ||
    linkMutations.removeMultipleLinks.isPending ||
    linkMutations.clearLinks.isPending ||
    linkMutations.updateLinks.isPending ||
    linkMutations.replaceLinks.isPending;
  
  const isLoadingAttachments = 
    attachmentMutations.addAttachment.isPending ||
    attachmentMutations.addMultipleAttachments.isPending ||
    attachmentMutations.removeAttachment.isPending ||
    attachmentMutations.removeMultipleAttachments.isPending ||
    attachmentMutations.updateAttachments.isPending ||
    attachmentMutations.replaceAttachments.isPending;
  
  const isLoading = isLoadingLinks || isLoadingAttachments;
  
  const hasLinkError = 
    !!linkMutations.addLink.error ||
    !!linkMutations.addMultipleLinks.error ||
    !!linkMutations.removeLink.error ||
    !!linkMutations.removeMultipleLinks.error ||
    !!linkMutations.clearLinks.error ||
    !!linkMutations.updateLinks.error ||
    !!linkMutations.replaceLinks.error;
  
  const hasAttachmentError = 
    !!attachmentMutations.addAttachment.error ||
    !!attachmentMutations.addMultipleAttachments.error ||
    !!attachmentMutations.removeAttachment.error ||
    !!attachmentMutations.removeMultipleAttachments.error ||
    !!attachmentMutations.updateAttachments.error ||
    !!attachmentMutations.replaceAttachments.error;
  
  const hasError = hasLinkError || hasAttachmentError;
  
  const getCombinedErrors = () => {
    const errors: string[] = [];
    
    if (linkMutations.addLink.error) errors.push(`Add link: ${linkMutations.addLink.error.message}`);
    if (linkMutations.addMultipleLinks.error) errors.push(`Add multiple links: ${linkMutations.addMultipleLinks.error.message}`);
    if (linkMutations.removeLink.error) errors.push(`Remove link: ${linkMutations.removeLink.error.message}`);
    if (linkMutations.removeMultipleLinks.error) errors.push(`Remove multiple links: ${linkMutations.removeMultipleLinks.error.message}`);
    if (linkMutations.clearLinks.error) errors.push(`Clear links: ${linkMutations.clearLinks.error.message}`);
    if (linkMutations.updateLinks.error) errors.push(`Update links: ${linkMutations.updateLinks.error.message}`);
    if (linkMutations.replaceLinks.error) errors.push(`Replace links: ${linkMutations.replaceLinks.error.message}`);
    
    if (attachmentMutations.addAttachment.error) errors.push(`Add attachment: ${attachmentMutations.addAttachment.error.message}`);
    if (attachmentMutations.addMultipleAttachments.error) errors.push(`Add multiple attachments: ${attachmentMutations.addMultipleAttachments.error.message}`);
    if (attachmentMutations.removeAttachment.error) errors.push(`Remove attachment: ${attachmentMutations.removeAttachment.error.message}`);
    if (attachmentMutations.removeMultipleAttachments.error) errors.push(`Remove multiple attachments: ${attachmentMutations.removeMultipleAttachments.error.message}`);
    if (attachmentMutations.updateAttachments.error) errors.push(`Update attachments: ${attachmentMutations.updateAttachments.error.message}`);
    if (attachmentMutations.replaceAttachments.error) errors.push(`Replace attachments: ${attachmentMutations.replaceAttachments.error.message}`);
    
    return errors;
  };
  
  return {
    links: {
      addLink: (linkUrl: string) => linkMutations.addLink.mutate({ pageId, linkUrl }),
      addMultipleLinks: (links: string[]) => linkMutations.addMultipleLinks.mutate({ pageId, links }),
      removeLink: (linkUrl: string) => linkMutations.removeLink.mutate({ pageId, linkUrl }),
      removeMultipleLinks: (links: string[]) => linkMutations.removeMultipleLinks.mutate({ pageId, links }),
      clearLinks: () => linkMutations.clearLinks.mutate(pageId),
      updateLinks: (newLinks: string[], oldLinks: string[]) => 
        linkMutations.updateLinks.mutate({ pageId, newLinks, oldLinks }),
      replaceLinks: (links: string[]) => linkMutations.replaceLinks.mutate({ pageId, links }),
      
      isLoading: isLoadingLinks,
      hasError: hasLinkError,
      
      isAddingLink: linkMutations.addLink.isPending,
      isAddingMultipleLinks: linkMutations.addMultipleLinks.isPending,
      isRemovingLink: linkMutations.removeLink.isPending,
      isRemovingMultipleLinks: linkMutations.removeMultipleLinks.isPending,
      isClearingLinks: linkMutations.clearLinks.isPending,
      isUpdatingLinks: linkMutations.updateLinks.isPending,
      isReplacingLinks: linkMutations.replaceLinks.isPending,
      
      isLinkAdded: linkMutations.addLink.isSuccess,
      areLinksAdded: linkMutations.addMultipleLinks.isSuccess,
      isLinkRemoved: linkMutations.removeLink.isSuccess,
      areLinksRemoved: linkMutations.removeMultipleLinks.isSuccess,
      areLinksCleared: linkMutations.clearLinks.isSuccess,
      areLinksUpdated: linkMutations.updateLinks.isSuccess,
      areLinksReplaced: linkMutations.replaceLinks.isSuccess,
    },
    
    attachments: {
      addAttachment: (file: File) => attachmentMutations.addAttachment.mutate({ pageId, file }),
      addMultipleAttachments: (files: File[]) => attachmentMutations.addMultipleAttachments.mutate({ pageId, files }),
      removeAttachment: (documentName: string) => attachmentMutations.removeAttachment.mutate({ pageId, documentName }),
      removeMultipleAttachments: (documentNames: string[]) => 
        attachmentMutations.removeMultipleAttachments.mutate({ pageId, documentNames }),
      updateAttachments: (newFiles: File[], oldDocumentNames: string[]) => 
        attachmentMutations.updateAttachments.mutate({ pageId, newFiles, oldDocumentNames }),
      replaceAttachments: (files: File[]) => attachmentMutations.replaceAttachments.mutate({ pageId, files }),
      
      isLoading: isLoadingAttachments,
      hasError: hasAttachmentError,
      
      isAddingAttachment: attachmentMutations.addAttachment.isPending,
      isAddingMultipleAttachments: attachmentMutations.addMultipleAttachments.isPending,
      isRemovingAttachment: attachmentMutations.removeAttachment.isPending,
      isRemovingMultipleAttachments: attachmentMutations.removeMultipleAttachments.isPending,
      isUpdatingAttachments: attachmentMutations.updateAttachments.isPending,
      isReplacingAttachments: attachmentMutations.replaceAttachments.isPending,
      
      isAttachmentAdded: attachmentMutations.addAttachment.isSuccess,
      areAttachmentsAdded: attachmentMutations.addMultipleAttachments.isSuccess,
      isAttachmentRemoved: attachmentMutations.removeAttachment.isSuccess,
      areAttachmentsRemoved: attachmentMutations.removeMultipleAttachments.isSuccess,
      areAttachmentsUpdated: attachmentMutations.updateAttachments.isSuccess,
      areAttachmentsReplaced: attachmentMutations.replaceAttachments.isSuccess,
    },
    
    isLoading,
    hasError,
    errors: getCombinedErrors(),
    
    utils: {
      isValidUrl,
      processLinks,
      isValidFileSize,
      isValidFileType,
      processFiles
    }
  };
}

export { isValidUrl, processLinks, isValidFileSize, isValidFileType, processFiles };