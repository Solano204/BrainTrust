// File: src/app/features/courses/api/page-api.ts
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
const isMockEnabled = false; // Enable mock data

// ============================================
// DTO INTERFACES - MATCHING BACKEND
// ============================================


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

// NEW: Command DTOs for attachment management
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

// Success response type remains the same
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
  pageId ?: string;
}


export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface ErrorResponseDTO {
  success: false;
  message: string;
  error: string;
  timestamp: string;
}
// types/assignment.ts
export interface FrontendDocumentDTO {
  originalFilename: string;
  uploadedUrl?: string; // Cloudinary URL
  // extractedText?: string;
  // fileSize?: number;
  // mimeType?: string;
  // fileHash?: string;
  // publicId?: string;
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
// ============================================
// MAPPERS - UPDATED TO MATCH BACKEND STRUCTURE
// ============================================

/**
 * Maps backend PageDTO to frontend Page interface
 */
async function mapPageFromBackend(dto: PageDTO): Promise<Page> {
  return {
    id: dto.id,
    title: dto.title,
    // Map backend fields to frontend structure
    sectionContent: dto.content, // Map content to sectionContent
    courseId: dto.courseId,
    unitId: dto.unitId,
    createdAt: dto.createdAt,
    attachments:
      dto.attachments?.map((attachment) => ({
        name: attachment.name,
        storagePath: attachment.storagePath,
        createdAt: attachment.createdAt,
      })) || [],
    urlsSupport: dto.externalLinks || [], // Map externalLinks to urlsSupport
  };
}

/**
 * Maps frontend Page data to backend CreatePageCommand
 */
async function mapPageToCreateCommand(
  courseId: CourseId,
  unitId: UnitId,
  pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">
): Promise<CreatePageCommand> {
  return {
    courseId: courseId,
    unitId: unitId,
    title: pageData.title,
    content: pageData.sectionContent, // Map sectionContent to content
    attachments: pageData.attachments,
    externalLinks: pageData.urlsSupport, // Map urlsSupport to externalLinks
    published: true, // Default value
  };
}

/**
 * Maps frontend Page data to backend UpdatePageCommand
 */
async function mapPageToUpdateCommand(
  pageData: Partial<Omit<Page,  "id" | "courseId" | "unitId" | "createdAt">>
, pageId: PageId): Promise<UpdatePageCommand> {
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
  pageData: Partial<Omit<Page,  "id" | "courseId" | "unitId" | "createdAt">>
, pageId: PageId): Promise<UpdatePageCommandBasic> {
  const command: UpdatePageCommandBasic = {};

  if (pageData.title !== undefined) command.title = pageData.title;
  if (pageData.sectionContent !== undefined)
    command.content = pageData.sectionContent;
  if (pageId !== undefined)
    command.pageId = pageId;
  return command;
}

// ============================================
// CONFIGURATION & CLIENT SETUP
// ============================================

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

// ============================================
// MOCK DATA - UPDATED TO MATCH NEW STRUCTURE
// ============================================

const MOCK_PAGES: Page[] = [
  {
    id: "page-1",
    title: "Introduction to JavaScript",
    welcomeTitle: "Welcome to JavaScript Fundamentals",
    welcomeSubtitle: "Start your journey into programming",
    sectionTitle: "Getting Started with JavaScript",
    sectionContent:
      "JavaScript is a versatile programming language that runs in web browsers and on servers. In this module, you'll learn the basics of JavaScript syntax, variables, and data types.\n\nJavaScript was created in 1995 by Brendan Eich and has evolved into one of the most popular programming languages in the world.",
    courseId: "crs-101",
    unitId: "unit-1-1",
    createdAt: "2024-01-10T09:00:00Z",
    attachments: [
      {
        name: "javascript-cheatsheet.pdf",
        storagePath: "/pages/cheatsheet.pdf",
        createdAt: "2024-01-10T09:00:00Z",
      },
    ],
    urlsSupport: [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      "https://javascript.info/",
    ],
  },
  {
    id: "page-2",
    title: "Control Flow in Programming",
    welcomeSubtitle: "Learn to direct your program's execution",
    sectionTitle: "Conditionals and Loops",
    sectionContent:
      "Control flow statements allow your program to make decisions and repeat actions. You'll learn about:\n- if/else statements\n- switch statements\n- for loops\n- while loops\n- do...while loops\n\nUnderstanding control flow is essential for writing dynamic and responsive programs.",
    courseId: "crs-101",
    unitId: "unit-1-2",
    createdAt: "2024-01-18T14:30:00Z",
    attachments: [
      {
        name: "control-flow-examples.js",
        storagePath: "/pages/examples.js",
        createdAt: "2024-01-18T14:30:00Z",
      },
    ],
    urlsSupport: [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
    ],
  },
];

const simulateDelay = async (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch pages by course unit
 * Backend: GET /api/pages/unit/{unitId}
 */


// CURRENTLY WORKS

export async function fetchPagesByUnit(
  courseId: CourseId,
  unitId: UnitId
): Promise<Page[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching pages for course ${courseId}, unit ${unitId}`);
    return MOCK_PAGES.filter(
      (page) => page.courseId === courseId && page.unitId === unitId
    );
  }

  try {
    const response = await apiClient.get<PageDTO[]>(
      `/api/pages/unit/${unitId}`
    );
    const pages = await Promise.all(
      response.data.map((dto) => mapPageFromBackend(dto))
    );
    // console.log("Fetched pages:", pages);
    // console.log("Response data:", response.data);
    return pages;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch page by ID
 * Backend: GET /api/pages/{pageId}
 */
export async function fetchPageById(pageId: string): Promise<Page> {
  if (isMockEnabled) {
    await simulateDelay();
    const page = MOCK_PAGES.find((p) => p.id === pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }
    console.log(`MOCK: Fetching page ${pageId}`);
    return page;
  }

  try {
    const response = await apiClient.get<PageDTO>(`/api/pages/${pageId}`);
    const page = await mapPageFromBackend(response.data);
    return page;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Create a new page with frontend document processing
 * Backend: POST /api/pages/frontend (application/json)
 */




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
  if (isMockEnabled) {
    await simulateDelay(800);
    const newPage: Page = {
      ...pageData,
      id: `page-${Date.now()}`,
      courseId,
      unitId,
      createdAt: new Date().toISOString(),
    };
    MOCK_PAGES.push(newPage);
    console.log("MOCK: Created new page", newPage);
    return newPage;
  }

  try {
    console.log("Creating page:", { courseId, unitId, pageData, attachments });

    // Process attachments: upload to Cloudinary and extract text
    const processedAttachments: FrontendDocumentDTO[] = [];
    
    if (attachments && attachments.length > 0) {
      console.log(`Processing ${attachments.length} file(s)...`);
      
      for (const file of attachments) {
        console.log(`- Processing: ${file.name} (${file.size} bytes)`);
        
        try {
          // 1. Upload to Cloudinary
          const uploadResult = await uploadDocumentFile(file, 'course-documents');
          console.log(`  ✓ Uploaded to Cloudinary: ${uploadResult.url}`);
          
          // 2. Extract text if it's a PDF
          // let extractedText = '';
          // if (file.type === 'application/pdf') {
          //   console.log(`  - Extracting text from PDF...`);
          //   extractedText = await getPdfContent(file);
          //   console.log(`  ✓ Extracted ${extractedText.length} characters`);
          // } else {
          //   console.log(`  - Not a PDF, skipping text extraction`);
          // }
          
          // 3. Calculate file hash (optional, for verification)
          const fileHash = await calculateFileHash(file);
          
          // 4. Create FrontendDocumentDTO
          const documentDto: FrontendDocumentDTO = {
            originalFilename: file.name,
            uploadedUrl: uploadResult.url
            // extractedText: extractedText,
          };
          
          processedAttachments.push(documentDto);
          console.log(`  ✓ Processed successfully`);
          
        } catch (fileError) {
          console.error(`  ✗ Error processing file ${file.name}:`, fileError);
          // You can choose to throw or continue with other files
          throw new Error(`Failed to process file ${file.name}: ${fileError}`);
        }
      }
    } else {
      console.log("- No files to process");
    }

    // Create the command for backend
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

    // Send JSON request to new endpoint
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

    // Map response to Page object
    const page = await mapPageFromBackend(response.data);
    return page;
    
  } catch (error) {
    console.error("❌ Error creating page:", error);
    return await handleApiError(error);
  }
}
/**
 * Calculate SHA-256 hash of a file for verification
 */
async function calculateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.warn('Failed to calculate file hash:', error);
    return '';
  }
}


/**
 * Update an existing page
 * Backend: PUT /api/pages/{pageId}
 */
export async function updatePage(
  pageId: string,
  pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>
): Promise<Page> {
  console.log("Updating page:", pageId, pageData);

  if (isMockEnabled) {
    await simulateDelay(600);
    const index = MOCK_PAGES.findIndex((page) => page.id === pageId);
    if (index !== -1) {
      MOCK_PAGES[index] = { ...MOCK_PAGES[index], ...pageData };
      console.log(`MOCK: Updated page ${pageId}`, pageData);
      return MOCK_PAGES[index];
    }
    throw new Error(`Page not found: ${pageId}`);
  }

  try {

    console.log("Mapped update command:", pageData);
    const command = await mapPageToUpdateCommandUpdate(pageData, pageId);
    console.log("UpdatePageCommand DTO:", command);
    const response = await apiClient.put <PageDTO>(
      `/api/pages/${pageId}`,
      command
    );

    // Fetch the updated page to get full details
    const page = await mapPageFromBackend(response.data);
    return page;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Delete a page
 * Backend: DELETE /api/pages/{pageId}
 */
export async function deletePage(pageId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);
    const index = MOCK_PAGES.findIndex((page) => page.id === pageId);
    if (index !== -1) {
      MOCK_PAGES.splice(index, 1);
      console.log(`MOCK: Deleted page ${pageId}`);
      return;
    }
    throw new Error(`Page not found: ${pageId}`);
  }

  try {
    await apiClient.delete<SuccessResponseDTO>(`/api/pages/${pageId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch all pages for a course
 * Backend: GET /api/pages/course/{courseId}
 */
export async function fetchPagesByCourse(courseId: CourseId): Promise<Page[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const pages = MOCK_PAGES.filter((page) => page.courseId === courseId);
    console.log(`MOCK: Fetching ${pages.length} pages for course ${courseId}`);
    return pages;
  }

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

/**
 * Search pages by title or content
 * Backend: GET /api/pages/search?courseId={courseId}&query={query}
 */
export async function searchPages(
  courseId: CourseId,
  query: string
): Promise<Page[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const searchTerm = query.toLowerCase();
    const pages = MOCK_PAGES.filter(
      (page) =>
        page.courseId === courseId &&
        (page.title.toLowerCase().includes(searchTerm) ||
          page.sectionContent.toLowerCase().includes(searchTerm))
    );
    console.log(
      `MOCK: Found ${pages.length} pages matching "${query}" in course ${courseId}`
    );
    return pages;
  }

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

/**
 * Validate page data before creation/update
 */
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


/**
 * Add a single link to a page
 * Backend: POST /api/pages/{pageId}/links
 */
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

/**
 * Add multiple links to a page in bulk
 * Backend: POST /api/pages/{pageId}/links/bulk
 */
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

/**
 * Remove a specific link from a page
 * Backend: DELETE /api/pages/{pageId}/links
 */
export async function removeLinkFromPage(
  pageId: string,
  linkUrl: string
): Promise<void>{
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

/**
 * Remove multiple links from a page
 * Backend: DELETE /api/pages/{pageId}/links/batch
 */
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

/**
 * Clear all links from a page
 * Backend: DELETE /api/pages/{pageId}/links/all
 */
export async function clearAllLinksFromPage(
  pageId: string
): Promise<void> {
  try {
    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/links/all`
    );
    
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================
// NEW API FUNCTIONS FOR ATTACHMENT MANAGEMENT
// ============================================

/**
 * Add a single attachment to a page
 * Backend: POST /api/pages/{pageId}/attachments (multipart/form-data)
 */

// ============================================
// PAGE ATTACHMENT MANAGEMENT
// ============================================

/**
 * Add a single attachment to a page
 * Backend: POST /api/pages/{pageId}/attachments/single-json
 */



// Helper function to process a file and create FrontendDocumentDTO
async function processFileToDTO(file: File, folder: string): Promise<FrontendDocumentDTO> {
  console.log(`Processing file: ${file.name} (${file.size} bytes)`);
  
  // 1. Upload to Cloudinary
  const uploadResult = await uploadDocumentFile(file, folder);
  console.log(`✓ Uploaded to Cloudinary: ${uploadResult.url}`);
  
  // 3. Calculate file hash
  // 4. Create FrontendDocumentDTO
  return {
    originalFilename: file.name,
    uploadedUrl: uploadResult.url,
    // extractedText: extractedText,
    // fileSize: file.size,
    // mimeType: file.type,
    // fileHash: fileHash,
  };
}

export async function addAttachmentToPage(
  pageId: string,
  file: File
): Promise<void> {
  try {
    console.log(`Adding attachment to page ${pageId}:`, file.name);
    
    // Process file: upload to Cloudinary and extract text
    const documentDTO = await processFileToDTO(file, 'page-attachments');
    
    // Send metadata to backend
    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/single-json`,
      documentDTO,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("✅ Attachment added successfully");
  } catch (error) {
    console.error("❌ Error adding attachment:", error);
    return await handleApiError(error);
  }
}

/**
 * Add multiple attachments to a page in bulk
 * Backend: POST /api/pages/{pageId}/attachments/bulk-json
 */
export async function addMultipleAttachmentsToPage(
  pageId: string,
  files: File[]
): Promise<void> {
  try {
    console.log(`Adding ${files.length} attachments to page ${pageId}`);
    
    // Process all files in parallel
    const documentDTOs = await Promise.all(
      files.map(file => processFileToDTO(file, 'page-attachments'))
    );
    
    // Create command with processed attachments
    const command = {
      attachments: documentDTOs
    };
    
    // Send metadata to backend
    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/bulk-json`,
      command,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("✅ Attachments added successfully");
    
  } catch (error) {
    console.error("❌ Error adding attachments:", error);
    return await handleApiError(error);
  }
}

/**
 * Add multiple attachments with progress tracking
 * Useful for showing upload progress to users
 */
export async function addMultipleAttachmentsToPageWithProgress(
  pageId: string,
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
):Promise<void>{
  try {
    console.log(`Adding ${files.length} attachments to page ${pageId} with progress tracking`);
    
    const documentDTOs: FrontendDocumentDTO[] = [];
    
    // Process files one by one to track progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i + 1, files.length, file.name);
      
      const documentDTO = await processFileToDTO(file, 'page-attachments');
      documentDTOs.push(documentDTO);
    }
    
    // Send all metadata to backend
    const command = {
      attachments: documentDTOs
    };
    
    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/bulk-json`,
      command,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log("✅ All attachments added successfully");
    
  } catch (error) {
    console.error("❌ Error adding attachments:", error);
    return await handleApiError(error);
  }
}

/**
 * Remove a specific attachment from a page
 * Backend: DELETE /api/pages/{pageId}/attachments
 */

// UPDATED: removeAttachmentFromPage with Cloudinary deletion
export async function removeAttachmentFromPage(
  pageId: string,
  documentName: string,
  cloudinaryUrl?: string // Add this parameter
): Promise<void> {
  const command: RemoveAttachmentCommandDTO = { documentName };

  console.log(`Removing attachment from page ${pageId}:`, documentName);
  
  try {
    // Delete from Cloudinary if URL is provided
    if (cloudinaryUrl) {
      try {
        await deleteDocumentByUrl(cloudinaryUrl);
        console.log('✓ Deleted from Cloudinary');
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue anyway
      }
    }
    
    // Remove from backend database
    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments`,
      { data: command }
    );
    
    return 
  } catch (error) {
    return await handleApiError(error);
  }
}
/**
 * Remove multiple attachments from a page
 * Backend: DELETE /api/pages/{pageId}/attachments/batch
 */

// UPDATED: removeMultipleAttachmentsFromPage with Cloudinary deletion
export async function removeMultipleAttachmentsFromPage(
  pageId: string,
  documentNames: string[],
  cloudinaryUrls?: string[] // Add this parameter
):  Promise<void> {
  const command: RemoveMultipleAttachmentsCommandDTO = { documentNames };

  try {
    // Delete from Cloudinary if URLs are provided
    if (cloudinaryUrls && cloudinaryUrls.length > 0) {
      try {
        const publicIds = cloudinaryUrls
          .map(url => extractPublicIdFromUrl(url))
          .filter(Boolean) as string[];
        
        if (publicIds.length > 0) {
          const result = await deleteMultipleDocuments(publicIds);
          console.log(`✓ Deleted ${result.success} files from Cloudinary (${result.failed} failed)`);
        }
      } catch (cloudinaryError) {
        console.warn('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue anyway
      }
    }
    
    // Remove from backend database
    const response = await apiClient.delete<SuccessResponseDTO>(
      `/api/pages/${pageId}/attachments/batch`,
      { data: command }
    );
    

  } catch (error) {
    return await handleApiError(error);
  }
}


// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Helper to validate URLs
 */
/**
 * Helper to validate URLs
 */
export async function isValidUrl(url: string): Promise<boolean> {
  try {
    new URL(url);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}
/**
 * Helper to validate file size (max 10MB)
 */
export async function isValidFileSize(file: File, maxSizeMB: number = 10): Promise<boolean> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
/**
 * Helper to validate file types
 */
/**
 * Helper to validate file types
 */
export async function isValidFileType(
  file: File,
  allowedTypes: string[] = ["image/*", "application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
): Promise<boolean> {
  return Promise.resolve(allowedTypes.some(type => {
    if (type.endsWith("/*")) {
      const mainType = type.split("/")[0];
      return file.type.startsWith(mainType + "/");
    }
    return file.type === type;
  }));
}

/**
 * Process links - validate and clean URLs
 */
export async function processLinks(links: string[]): Promise<string[]> {
  return links
    .map(link => link.trim())
    .filter(link => link.length > 0)
    .map(link => {
      // Add https:// if no protocol specified
      if (!link.startsWith("http://") && !link.startsWith("https://")) {
        return `https://${link}`;
      }
      return link;
    });
}

/**
 * Process files - validate and prepare for upload
 */
/**
 * Process files - validate and prepare for upload
 */
export async function processFiles(files: File[]): Promise<{ validFiles: File[], errors: string[] }> {
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

// ============================================
// COMPOSITE FUNCTIONS FOR COMMON OPERATIONS
// ============================================

/**
 * Update page links (add new, remove old)
 */
export async function updatePageLinks(
  pageId: string,
  newLinks: string[],
  oldLinks: string[]
): Promise<void> {
  try {
    // Remove links that are no longer present
    const linksToRemove = oldLinks.filter(link => !newLinks.includes(link));
    if (linksToRemove.length > 0) {
      if (linksToRemove.length === 1) {
        await removeLinkFromPage(pageId, linksToRemove[0]);
      } else {
        await removeMultipleLinksFromPage(pageId, linksToRemove);
      }
    }

    // Add new links
    const linksToAdd = newLinks.filter(link => !oldLinks.includes(link));
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

/**
 * Update page attachments
 */
export async function updatePageAttachments(
  pageId: string,
  newFiles: File[],
  oldDocumentNames: string[]
): Promise<void> {
  try {
    // Process and validate new files
    const { validFiles, errors } = processFiles(newFiles);
    if (errors.length > 0) {
      throw new Error(`File validation errors: ${errors.join(", ")}`);
    }

    // Add new files
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

/**
 * Replace all page links (clear and add new)
 */
export async function replaceAllPageLinks(
  pageId: string,
  links: string[]
): Promise<void> {
  try {
    // Clear existing links
    await clearAllLinksFromPage(pageId);
    
    // Add new links if any
    if (links.length > 0) {
      await addMultipleLinksToPage(pageId, links);
    }
  } catch (error) {
    console.error("Error replacing page links:", error);
    throw error;
  }
}

/**
 * Replace all page attachments
 */
export async function replaceAllPageAttachments(
  pageId: string,
  files: File[]
): Promise<void> {
  try {
    // Clear existing attachments
    await clearAllAttachmentsFromPage(pageId);
    
    // Process and validate new files
    const { validFiles, errors } = processFiles(files);
    if (errors.length > 0) {
      throw new Error(`File validation errors: ${errors.join(", ")}`);
    }

    // Add new files if any
    if (validFiles.length > 0) {
      await addMultipleAttachmentsToPage(pageId, validFiles);
    }
  } catch (error) {
    console.error("Error replacing page attachments:", error);
    throw error;
  }
}


