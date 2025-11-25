// File: src/app/features/courses/api/page-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Page } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const isMockEnabled = true; // Enable mock data

// ============================================
// DTO INTERFACES
// ============================================

export interface PageDTO {
  id: string;
  title: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  sectionTitle: string;
  sectionContent: string;
  courseId: CourseId;
  unitId: UnitId;
  createdAt: string;
  attachments: DocumentDTO[];
  urlsSupport: string[];
}

export interface DocumentDTO {
  name: string;
  storagePath: string;
  createdAt: string;
}

export interface CreatePageCommand {
  title: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  sectionTitle: string;
  sectionContent: string;
  courseId: CourseId;
  unitId: UnitId;
  attachments: DocumentDTO[];
  urlsSupport: string[];
}

export interface UpdatePageCommand {
  title?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  sectionTitle?: string;
  sectionContent?: string;
  attachments?: DocumentDTO[];
  urlsSupport?: string[];
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

const handleApiError = (error: unknown): never => {
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
// MOCK DATA
// ============================================

const MOCK_PAGES: Page[] = [
  {
    id: "page-1",
    title: "Introduction to JavaScript",
    welcomeTitle: "Welcome to JavaScript Fundamentals",
    welcomeSubtitle: "Start your journey into programming",
    sectionTitle: "Getting Started with JavaScript",
    sectionContent: "JavaScript is a versatile programming language that runs in web browsers and on servers. In this module, you'll learn the basics of JavaScript syntax, variables, and data types.\n\nJavaScript was created in 1995 by Brendan Eich and has evolved into one of the most popular programming languages in the world.",
    courseId: "crs-101",
    unitId: "unit-1-1",
    createdAt: "2024-01-10T09:00:00Z",
    attachments: [
      {
        name: "javascript-cheatsheet.pdf",
        storagePath: "/pages/cheatsheet.pdf",
        createdAt: "2024-01-10T09:00:00Z"
      }
    ],
    urlsSupport: [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      "https://javascript.info/"
    ]
  },
  {
    id: "page-2",
    title: "Control Flow in Programming",
    welcomeTitle: "Mastering Control Flow",
    welcomeSubtitle: "Learn to direct your program's execution",
    sectionTitle: "Conditionals and Loops",
    sectionContent: "Control flow statements allow your program to make decisions and repeat actions. You'll learn about:\n- if/else statements\n- switch statements\n- for loops\n- while loops\n- do...while loops\n\nUnderstanding control flow is essential for writing dynamic and responsive programs.",
    courseId: "crs-101", 
    unitId: "unit-1-2",
    createdAt: "2024-01-18T14:30:00Z",
    attachments: [
      {
        name: "control-flow-examples.js",
        storagePath: "/pages/examples.js",
        createdAt: "2024-01-18T14:30:00Z"
      }
    ],
    urlsSupport: [
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"
    ]
  }
];

const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// MAPPERS
// ============================================

/**
 * Maps backend PageDTO to frontend Page interface
 */
function mapPageFromBackend(dto: PageDTO): Page {
  return {
    id: dto.id,
    title: dto.title,
    welcomeTitle: dto.welcomeTitle,
    welcomeSubtitle: dto.welcomeSubtitle,
    sectionTitle: dto.sectionTitle,
    sectionContent: dto.sectionContent,
    courseId: dto.courseId,
    unitId: dto.unitId,
    createdAt: dto.createdAt,
    attachments: dto.attachments.map(attachment => ({
      name: attachment.name,
      storagePath: attachment.storagePath,
      createdAt: attachment.createdAt
    })),
    urlsSupport: dto.urlsSupport
  };
}

/**
 * Maps frontend Page data to backend CreatePageCommand
 */
function mapPageToCreateCommand(
  courseId: CourseId,
  unitId: UnitId,
  pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">
): CreatePageCommand {
  return {
    title: pageData.title,
    welcomeTitle: pageData.welcomeTitle,
    welcomeSubtitle: pageData.welcomeSubtitle,
    sectionTitle: pageData.sectionTitle,
    sectionContent: pageData.sectionContent,
    courseId,
    unitId,
    attachments: pageData.attachments,
    urlsSupport: pageData.urlsSupport
  };
}

/**
 * Maps frontend Page data to backend UpdatePageCommand
 */
function mapPageToUpdateCommand(
  pageData: Partial<Omit<Page, "id" | "courseId" | "unitId" | "createdAt">>
): UpdatePageCommand {
  return {
    title: pageData.title,
    welcomeTitle: pageData.welcomeTitle,
    welcomeSubtitle: pageData.welcomeSubtitle,
    sectionTitle: pageData.sectionTitle,
    sectionContent: pageData.sectionContent,
    attachments: pageData.attachments,
    urlsSupport: pageData.urlsSupport
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch pages by course unit
 * Backend: GET /api/pages/course/{courseId}/unit/{unitId}
 */
export async function fetchPagesByUnit(courseId: CourseId, unitId: UnitId): Promise<Page[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching pages for course ${courseId}, unit ${unitId}`);
    return MOCK_PAGES.filter(page => page.courseId === courseId && page.unitId === unitId);
  }

  try {
    const response = await apiClient.get<PageDTO[]>(`/api/pages/course/${courseId}/unit/${unitId}`);
    return response.data.map(mapPageFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch page by ID
 * Backend: GET /api/pages/{pageId}
 */
export async function fetchPageById(pageId: string): Promise<Page> {
  if (isMockEnabled) {
    await simulateDelay();
    const page = MOCK_PAGES.find(p => p.id === pageId);
    if (!page) {
      throw new Error(`Page not found: ${pageId}`);
    }
    console.log(`MOCK: Fetching page ${pageId}`);
    return page;
  }

  try {
    const response = await apiClient.get<PageDTO>(`/api/pages/${pageId}`);
    return mapPageFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new page
 * Backend: POST /api/pages
 */
export async function createPage(
  courseId: CourseId,
  unitId: UnitId,
  pageData: Omit<Page, "id" | "courseId" | "unitId" | "createdAt">
): Promise<Page> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const newPage: Page = {
      ...pageData,
      id: `page-${Date.now()}`,
      courseId,
      unitId,
      createdAt: new Date().toISOString()
    };
    MOCK_PAGES.push(newPage);
    console.log("MOCK: Created new page", newPage);
    return newPage;
  }

  try {
    const command: CreatePageCommand = mapPageToCreateCommand(courseId, unitId, pageData);
    const response = await apiClient.post<SuccessResponseDTO>("/api/pages", command);
    
    // Fetch the created page to get full details
    const pageId = response.data.data;
    const pageResponse = await apiClient.get<PageDTO>(`/api/pages/${pageId}`);
    return mapPageFromBackend(pageResponse.data);
  } catch (error) {
    return handleApiError(error);
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
    const index = MOCK_PAGES.findIndex(page => page.id === pageId);
    if (index !== -1) {
      MOCK_PAGES[index] = { ...MOCK_PAGES[index], ...pageData };
      console.log(`MOCK: Updated page ${pageId}`, pageData);
      return MOCK_PAGES[index];
    }
    throw new Error(`Page not found: ${pageId}`);
  }

  try {
    const command: UpdatePageCommand = mapPageToUpdateCommand(pageData);
    const response = await apiClient.put<SuccessResponseDTO>(`/api/pages/${pageId}`, command);
    
    // Fetch the updated page to get full details
    const pageResponse = await apiClient.get<PageDTO>(`/api/pages/${pageId}`);
    return mapPageFromBackend(pageResponse.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a page
 * Backend: DELETE /api/pages/{pageId}
 */
export async function deletePage(pageId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);
    const index = MOCK_PAGES.findIndex(page => page.id === pageId);
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
    return handleApiError(error);
  }
}

/**
 * Fetch all pages for a course
 * Backend: GET /api/pages/course/{courseId}
 */
export async function fetchPagesByCourse(courseId: CourseId): Promise<Page[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const pages = MOCK_PAGES.filter(page => page.courseId === courseId);
    console.log(`MOCK: Fetching ${pages.length} pages for course ${courseId}`);
    return pages;
  }

  try {
    const response = await apiClient.get<PageDTO[]>(`/api/pages/course/${courseId}`);
    return response.data.map(mapPageFromBackend);
  } catch (error) {
    return handleApiError(error);
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
    const pages = MOCK_PAGES.filter(page => 
      page.courseId === courseId && (
        page.title.toLowerCase().includes(searchTerm) ||
        page.sectionContent.toLowerCase().includes(searchTerm) ||
        page.sectionTitle.toLowerCase().includes(searchTerm)
      )
    );
    console.log(`MOCK: Found ${pages.length} pages matching "${query}" in course ${courseId}`);
    return pages;
  }

  try {
    const response = await apiClient.get<PageDTO[]>(`/api/pages/search`, {
      params: { courseId, query }
    });
    return response.data.map(mapPageFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Validate page data before creation/update
 */
export function validatePageData(pageData: Partial<Page>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!pageData.title?.trim()) {
    errors.push("Page title is required");
  }
  if (!pageData.sectionTitle?.trim()) {
    errors.push("Section title is required");
  }
  if (!pageData.sectionContent?.trim()) {
    errors.push("Section content is required");
  }
  if (!pageData.welcomeTitle?.trim()) {
    errors.push("Welcome title is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}