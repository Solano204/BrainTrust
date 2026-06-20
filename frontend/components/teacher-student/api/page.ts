"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CourseId, UnitId } from "@/app/domain/valueObjects";
import { Document, PageId } from "@/app/domain/valueObjects/CourseValues";
import { Page } from "@/app/domain/entities/CourseEntities";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { deleteDocumentByUrl, deleteMultipleDocuments, extractPublicIdFromUrl, getPdfContent, uploadDocumentFile } from "@/app/utils/cloudinary/cloudinary-pdf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface AddLinkCommandDTO {
  linkUrl: string;
}

export interface AddMultipleLinksCommandDTO {
  links: string[];
}

export interface RemoveLinkCommandDTO {
  linkUrl: string;
}

export interface RemoveMultipleLinksCommandDTO {
  links: string[];
}

export interface AddAttachmentCommandDTO {
  file: File;
}

export interface AddMultipleAttachmentsCommandDTO {
  files: File[];
}

export interface RemoveAttachmentCommandDTO {
  documentName: string;
}

export interface RemoveMultipleAttachmentsCommandDTO {
  documentNames: string[];
}

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface PageDTO {
  id: string;
  courseId: string;
  unitId: string;
  courseName: string;
  unitName: string;
  title: string;
  content: string;
  attachments: DocumentDTO[];
  externalLinks: string[];
  createdAt: string;
  lastModified: string;
  published: boolean;
}

export interface DocumentDTO {
  name: string;
  storagePath: string;
  createdAt: string;
}

export interface CreatePageCommand {
  courseId: string;
  unitId: string;
  title: string;
  content: string;
  attachments?: DocumentDTO[];
  externalLinks?: string[];
  published?: boolean;
}

export interface UpdatePageCommand {
  title?: string;
  content?: string;
  attachments?: DocumentDTO[];
  externalLinks?: string[];
  published?: boolean;
}

export interface UpdatePageCommandBasic {
  title?: string;
  content?: string;
  pageId?: string;
}

export interface ErrorResponseDTO {
  success: false;
  message: string;
  error: string;
  timestamp: string;
}

export interface FrontendDocumentDTO {
  originalFilename: string;
  uploadedUrl?: string;
}

export interface CreateAssignmentFrontendDTO {
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  submissionFormat: string;
  targetType: string;
  links: string[];
  attachments: FrontendDocumentDTO[];
  publishImmediately?: boolean;
}

async function mapPageFromBackend(dto: PageDTO): Promise<Page> {
  return {
    id: dto.id,
    title: dto.title,
    sectionContent: dto.content,
    courseId: dto.courseId,
    unitId: dto.unitId,
    createdAt: dto.createdAt,
    attachments:
      dto.attachments?.map((attachment) => ({
        name: attachment.name,
        storagePath: attachment.storagePath,
        createdAt: attachment.createdAt,
      })) || [],
    urlsSupport: dto.externalLinks || [],
  };
}

async function mapPageToCreateCommand(
  courseId: CourseId,
  unitId: UnitId,
  pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">
): Promise<CreatePageCommand> {
  return {
    courseId: courseId,
    unitId: unitId,
    title: pageData.title,
    content: pageData.sectionContent,
    attachments: pageData.attachments,
    externalLinks: pageData.urlsSupport,
    published: true,
  };
}

async function mapPageToUpdateCommand(
  pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>,
  pageId: PageId
): Promise<UpdatePageCommand> {
  const command: UpdatePageCommand = {};

  if (pageData.title !== undefined) command.title = pageData.title;
  if (pageData.sectionContent !== undefined)
    command.content = pageData.sectionContent;
  if (pageData.attachments !== undefined)
    command.attachments = pageData.attachments;
  if (pageData.urlsSupport !== undefined)
    command.externalLinks = pageData.urlsSupport;

  return command;
}

async function mapPageToUpdateCommandUpdate(
  pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>,
  pageId: PageId
): Promise<UpdatePageCommandBasic> {
  const command: UpdatePageCommandBasic = {};

  if (pageData.title !== undefined) command.title = pageData.title;
  if (pageData.sectionContent !== undefined)
    command.content = pageData.sectionContent;
  if (pageId !== undefined) command.pageId = pageId;
  return command;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data as ErrorResponseDTO;
    const errorMessage = errorResponse?.message || error.message;
    console.error("API Error:", errorMessage);

    if (error.response?.status === 401 || error.response?.status === 403) {
      redirect("/courses");
    }

    throw new Error(errorMessage);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("An unexpected error occurred");
};

export async function fetchPagesByUnit(
  courseId: CourseId,
  unitId: UnitId
): Promise<Page[]> {
  try {
    const response = await apiClient.get<PageDTO[]>(
      `/api/pages/unit/${unitId}`
    );
    const pages = await Promise.all(
      response.data.map((dto) => mapPageFromBackend(dto))
    );
    return pages;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchPageById(pageId: string): Promise<Page> {
  try {
    const response = await apiClient.get<PageDTO>(`/api/pages/${pageId}`);
    const page = await mapPageFromBackend(response.data);
    return page;
  } catch (error) {
    return await handleApiError(error);
  }
}

export interface CreatePageFrontendDTO {
  courseId: string;
  unitId: string;
  title: string;
  content: string;
  attachments: FrontendDocumentDTO[];
  externalLinks: string[];
  publishImmediately: boolean;
}

export async function createPage(
  courseId: CourseId,
  unitId: UnitId,
  pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">,
  attachments?: File[]
): Promise<Page> {
  try {
    console.log("Creating page:", { courseId, unitId, pageData, attachments });

    const processedAttachments: FrontendDocumentDTO[] = [];

    if (attachments && attachments.length > 0) {
      console.log(`Processing ${attachments.length} file(s)...`);

      for (const file of attachments) {
        console.log(`- Processing: ${file.name} (${file.size} bytes)`);

        try {
          const uploadResult = await uploadDocumentFile(file, "course-documents");
          console.log(`  ✓ Uploaded to Cloudinary: ${uploadResult.url}`);

          const fileHash = await calculateFileHash(file);

          const documentDto: FrontendDocumentDTO = {
            originalFilename: file.name,
            uploadedUrl: uploadResult.url,
          };

          processedAttachments.push(documentDto);
          console.log(`  ✓ Processed successfully`);
        } catch (fileError) {
          console.error(`  ✗ Error processing file ${file.name}:`, fileError);
          throw new Error(`Failed to process file ${file.name}: ${fileError}`);
        }
      }
    } else {
      console.log("- No files to process");
    }

    const command: CreatePageFrontendDTO = {
      courseId,
      unitId,
      title: pageData.title,
      content: pageData.sectionContent,
      attachments: processedAttachments,
      externalLinks: pageData.urlsSupport || [],
      publishImmediately: false,
    };

    console.log("Sending command to backend:");
    console.log("- Title:", command.title);
    console.log("- Attachments:", command.attachments.length);
    console.log("- External Links:", command.externalLinks.length);

    const response = await apiClient.post<PageDTO>(
      "/api/pages/frontend",
      command,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API Response:", response.data);

    const page = await mapPageFromBackend(response.data);
    return page;
  } catch (error) {
    console.error("❌ Error creating page:", error);
    return await handleApiError(error);
  }
}

async function calculateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  } catch (error) {
    console.warn("Failed to calculate file hash:", error);
    return "";
  }
}

export async function updatePage(
  pageId: string,
  pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>
): Promise<Page> {
  console.log("Updating page:", pageId, pageData);

  try {
    console.log("Mapped update command:", pageData);
    const command = await mapPageToUpdateCommandUpdate(pageData, pageId);
    console.log("UpdatePageCommand DTO:", command);
    const response = await apiClient.put<PageDTO>(`/api/pages/${pageId}`, command);

    const page = await mapPageFromBackend(response.data);
    return page;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function deletePage(pageId: string): Promise<void> {
  try {
    await apiClient.delete<SuccessResponseDTO>(`/api/pages/${pageId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchPagesByCourse(courseId: CourseId): Promise<Page[]> {
  try {
    const response = await apiClient.get<PageDTO[]>(
      `/api/pages/course/${courseId}`
    );
    const pages = await Promise.all(
      response.data.map((dto) => mapPageFromBackend(dto))
    );
    return pages;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function searchPages(
  courseId: CourseId,
  query: string
): Promise<Page[]> {
  try {
    const response = await apiClient.get<PageDTO[]>(`/api/pages/search`, {
      params: { courseId, query },
    });
    const pages = await Promise.all(
      response.data.map((dto) => mapPageFromBackend(dto))
    );
    return pages;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function validatePageData(
  pageData: Partial<Page>
): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];

  if (!pageData.title?.trim()) {
    errors.push("Page title is required");
  }
  if (!pageData.sectionContent?.trim()) {
    errors.push("Page content is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function addLinkToPage(
  pageId: string,
  linkUrl: string
): Promise<void> {
  const command: AddLinkCommandDTO = { linkUrl };

  try {
    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/links`,
      command
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function addMultipleLinksToPage(
  pageId: string,
  links: string[]
): Promise<void> {
  const command: AddMultipleLinksCommandDTO = { links };

  try {
    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/links/bulk`,
      command
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function removeLinkFromPage(
  pageId: string,
  linkUrl: string
): Promise<void> {
  const command: RemoveLinkCommandDTO = { linkUrl };

  console.log(`Removing link from page ${pageId}:`, linkUrl);
  try {
    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/links`,
      { data: command }
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function removeMultipleLinksFromPage(
  pageId: string,
  links: string[]
): Promise<void> {
  const command: RemoveMultipleLinksCommandDTO = { links };

  try {
    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/links/batch`,
      { data: command }
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function clearAllLinksFromPage(pageId: string): Promise<void> {
  try {
    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/links/all`
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

async function processFileToDTO(
  file: File,
  folder: string
): Promise<FrontendDocumentDTO> {
  console.log(`Processing file: ${file.name} (${file.size} bytes)`);

  const uploadResult = await uploadDocumentFile(file, folder);
  console.log(`✓ Uploaded to Cloudinary: ${uploadResult.url}`);

  return {
    originalFilename: file.name,
    uploadedUrl: uploadResult.url,
  };
}

export async function addAttachmentToPage(
  pageId: string,
  file: File
): Promise<void> {
  try {
    console.log(`Adding attachment to page ${pageId}:`, file.name);

    const documentDTO = await processFileToDTO(file, "page-attachments");

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/single-json`,
      documentDTO,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Attachment added successfully");
  } catch (error) {
    console.error("❌ Error adding attachment:", error);
    return await handleApiError(error);
  }
}

export async function addMultipleAttachmentsToPage(
  pageId: string,
  files: File[]
): Promise<void> {
  try {
    console.log(`Adding ${files.length} attachments to page ${pageId}`);

    const documentDTOs = await Promise.all(
      files.map((file) => processFileToDTO(file, "page-attachments"))
    );

    const command = {
      attachments: documentDTOs,
    };

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/bulk-json`,
      command,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Attachments added successfully");
  } catch (error) {
    console.error("❌ Error adding attachments:", error);
    return await handleApiError(error);
  }
}

export async function addMultipleAttachmentsToPageWithProgress(
  pageId: string,
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<void> {
  try {
    console.log(
      `Adding ${files.length} attachments to page ${pageId} with progress tracking`
    );

    const documentDTOs: FrontendDocumentDTO[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i + 1, files.length, file.name);

      const documentDTO = await processFileToDTO(file, "page-attachments");
      documentDTOs.push(documentDTO);
    }

    const command = {
      attachments: documentDTOs,
    };

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/bulk-json`,
      command,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ All attachments added successfully");
  } catch (error) {
    console.error("❌ Error adding attachments:", error);
    return await handleApiError(error);
  }
}

export async function removeAttachmentFromPage(
  pageId: string,
  documentName: string,
  cloudinaryUrl?: string
): Promise<void> {
  const command: RemoveAttachmentCommandDTO = { documentName };

  console.log(`Removing attachment from page ${pageId}:`, documentName);

  try {
    if (cloudinaryUrl) {
      try {
        await deleteDocumentByUrl(cloudinaryUrl);
        console.log("✓ Deleted from Cloudinary");
      } catch (cloudinaryError) {
        console.warn("Failed to delete from Cloudinary:", cloudinaryError);
      }
    }

    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments`,
      { data: command }
    );

    return;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function removeMultipleAttachmentsFromPage(
  pageId: string,
  documentNames: string[],
  cloudinaryUrls?: string[]
): Promise<void> {
  const command: RemoveMultipleAttachmentsCommandDTO = { documentNames };

  try {
    if (cloudinaryUrls && cloudinaryUrls.length > 0) {
      try {
        const publicIds = cloudinaryUrls
          .map((url) => extractPublicIdFromUrl(url))
          .filter(Boolean) as string[];

        if (publicIds.length > 0) {
          const result = await deleteMultipleDocuments(publicIds);
          console.log(
            `✓ Deleted ${result.success} files from Cloudinary (${result.failed} failed)`
          );
        }
      } catch (cloudinaryError) {
        console.warn("Failed to delete from Cloudinary:", cloudinaryError);
      }
    }

    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/batch`,
      { data: command }
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function isValidUrl(url: string): Promise<boolean> {
  try {
    new URL(url);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}

export async function isValidFileSize(
  file: File,
  maxSizeMB: number = 10
): Promise<boolean> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

export async function isValidFileType(
  file: File,
  allowedTypes: string[] = [
    "image/*",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]
): Promise<boolean> {
  return Promise.resolve(
    allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const mainType = type.split("/")[0];
        return file.type.startsWith(mainType + "/");
      }
      return file.type === type;
    })
  );
}

export async function processLinks(links: string[]): Promise<string[]> {
  return links
    .map((link) => link.trim())
    .filter((link) => link.length > 0)
    .map((link) => {
      if (!link.startsWith("http://") && !link.startsWith("https://")) {
        return `https://${link}`;
      }
      return link;
    });
}

export async function processFiles(
  files: File[]
): Promise<{ validFiles: File[]; errors: string[] }> {
  const validFiles: File[] = [];
  const errors: string[] = [];

  files.forEach((file, index) => {
    if (!isValidFileSize(file)) {
      errors.push(`File "${file.name}" exceeds maximum size (10MB)`);
    } else if (!isValidFileType(file)) {
      errors.push(`File "${file.name}" has unsupported file type`);
    } else {
      validFiles.push(file);
    }
  });

  return Promise.resolve({ validFiles, errors });
}

export async function updatePageLinks(
  pageId: string,
  newLinks: string[],
  oldLinks: string[]
): Promise<void> {
  try {
    const linksToRemove = oldLinks.filter((link) => !newLinks.includes(link));
    if (linksToRemove.length > 0) {
      if (linksToRemove.length === 1) {
        await removeLinkFromPage(pageId, linksToRemove[0]);
      } else {
        await removeMultipleLinksFromPage(pageId, linksToRemove);
      }
    }

    const linksToAdd = newLinks.filter((link) => !oldLinks.includes(link));
    if (linksToAdd.length > 0) {
      if (linksToAdd.length === 1) {
        await addLinkToPage(pageId, linksToAdd[0]);
      } else {
        await addMultipleLinksToPage(pageId, linksToAdd);
      }
    }
  } catch (error) {
    console.error("Error updating page links:", error);
    throw error;
  }
}

export async function updatePageAttachments(
  pageId: string,
  newFiles: File[],
  oldDocumentNames: string[]
): Promise<void> {
  try {
    const { validFiles, errors } = await processFiles(newFiles);
    if (errors.length > 0) {
      throw new Error(`File validation errors: ${errors.join(", ")}`);
    }

    if (validFiles.length > 0) {
      if (validFiles.length === 1) {
        await addAttachmentToPage(pageId, validFiles[0]);
      } else {
        await addMultipleAttachmentsToPage(pageId, validFiles);
      }
    }
  } catch (error) {
    console.error("Error updating page attachments:", error);
    throw error;
  }
}

export async function replaceAllPageLinks(
  pageId: string,
  links: string[]
): Promise<void> {
  try {
    await clearAllLinksFromPage(pageId);

    if (links.length > 0) {
      await addMultipleLinksToPage(pageId, links);
    }
  } catch (error) {
    console.error("Error replacing page links:", error);
    throw error;
  }
}

export async function replaceAllPageAttachments(
  pageId: string,
  files: File[]
): Promise<void> {
  try {
    await clearAllAttachmentsFromPage(pageId);

    const { validFiles, errors } = await processFiles(files);
    if (errors.length > 0) {
      throw new Error(`File validation errors: ${errors.join(", ")}`);
    }

    if (validFiles.length > 0) {
      await addMultipleAttachmentsToPage(pageId, validFiles);
    }
  } catch (error) {
    console.error("Error replacing page attachments:", error);
    throw error;
  }
}

function clearAllAttachmentsFromPage(pageId: string) {
  throw new Error("Function not implemented.");
}
