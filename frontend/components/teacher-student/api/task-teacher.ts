// File: src/app/features/courses/api/assignment-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { sub } from "date-fns";
import { deleteDocumentByUrl, deleteMultipleDocuments, extractPublicIdFromUrl, getPdfContent, uploadDocumentFile } from "@/app/utils/cloudinary/cloudinary-pdf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const isMockEnabled = false; // Enable mock data

// ============================================
// DTO INTERFACES - MATCHING BACKEND
// ============================================

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

export type submissionFormat = "DIGITAL" | "NOTEBOOK";

export interface AssignmentDTO {
  id: string;
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  targetType: "INDIVIDUAL" | "TEAM";
    submissionFormat: submissionFormat;

  attachments: DocumentDTO[];
  externalLinks: string[];
  createdAt: string;
  active: boolean;
  availableNow: boolean;
}

export interface DocumentDTO {
  name: string;
  storagePath: string;
  createdAt: string;
}

export interface CreateAssignmentCommand {
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  targetType: "INDIVIDUAL" | "TEAM";
  attachments?: DocumentDTO[];
  externalLinks?: string[];
}

export interface UpdateAssignmentCommand {
  assignmentId: string;
  title: string;
  description: string;
  instructions: string;
  submissionFormat: submissionFormat;

}


// Types matching your backend DTOs
interface FrontendDocumentDTO {
  originalFilename: string;
  // fileSize?: number;
  // mimeType?: string;
  // fileHash?: string;
  uploadedUrl?: string; // Cloudinary URL
}

interface CreateAssignmentFrontendDTO {
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  attachments?: FrontendDocumentDTO[];
  links?: string[];
  targetType: string; // "INDIVIDUAL" or "TEAM"
  submissionFormat: string; // "DIGITAL" or "NOTEBOOK"
}
// ============================================
// MAPPERS - FRONTEND TO BACKEND CONVERSION
// ============================================

/**
 * Maps backend AssignmentDTO to frontend Assignment interface
 */
async function mapAssignmentFromBackend(dto: AssignmentDTO): Promise<Assignment> {
  return {
    id: dto.id,
    title: dto.title,
    courseId: dto.courseId,
    unitId: dto.unitId,
    description: dto.description,
    createdAt: dto.createdAt,
    attachments: dto.attachments || [],
    urls: dto.externalLinks || [],
    links: [],
    deliveryMode: dto.targetType === "INDIVIDUAL" ? "INDIVIDUAL" : "TEAM",
    submissionFormat: dto.submissionFormat || "DIGITAL", // NEW
    dueDate: dto.dueDate || null,
    maxScore: { value: 0, maxPoints: dto.maxPoints || 100 },
    instructions: dto.instructions || "",
    submissions: [],
    allowLateSubmissions: true,
    idUser: ""
  };
}

/**
 * Maps frontend Assignment data to backend CreateAssignmentCommand
 */


/**
 * Maps frontend Assignment data to backend UpdateAssignmentCommand
 */
async function mapAssignmentToUpdateCommand(
  assignmentId: string,
  assignmentData: Partial<Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions" | "idUser">>
): Promise<UpdateAssignmentCommand> {
  return {
    assignmentId,
    title: assignmentData.title || "",
    description: assignmentData.description || "",
    instructions: assignmentData.instructions || "",
    submissionFormat: assignmentData.submissionFormat || "DIGITAL",
  };
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
// MOCK DATA
// ============================================

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-1",
    title: "JavaScript Variables Assignment",
    courseId: "crs-101",
    unitId: "unit-1-1",
    description: "Practice declaring and using variables in JavaScript",
    createdAt: "2024-01-15T10:00:00Z",
    attachments: [
      {
        name: "assignment-instructions.pdf",
        storagePath: "/assignments/instructions.pdf",
        createdAt: "2024-01-15T10:00:00Z"
      }
    ],
    urls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript"],
    links: [],
    deliveryMode: "INDIVIDUAL",
    dueDate: "2024-02-01T23:59:00Z",
    maxScore: { value: 0, maxPoints: 100 },
    instructions: "Complete the following exercises:\n1. Declare variables using let, const, and var\n2. Create different data types\n3. Practice variable scope",
    submissions: [],
    allowLateSubmissions: true,
    idUser: ""
  },
  {
    id: "assign-2",
    title: "Control Flow Exercises",
    courseId: "crs-101",
    unitId: "unit-1-2",
    description: "Practice if/else statements and loops",
    createdAt: "2024-01-20T10:00:00Z",
    attachments: [
      {
        name: "control-flow-exercises.pdf",
        storagePath: "/assignments/control-flow.pdf",
        createdAt: "2024-01-20T10:00:00Z"
      }
    ],
    urls: ["https://javascript.info/ifelse", "https://javascript.info/while-for"],
    links: [],
    deliveryMode: "GROUP",
    dueDate: "2024-02-10T23:59:00Z",
    maxScore: { value: 0, maxPoints: 150 },
    instructions: "Work in groups to solve the control flow problems. Submit one solution per group.",
    submissions: [],
    allowLateSubmissions: false,
    idUser: ""
  }
];

const simulateDelay = async (ms: number = 500): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch assignments by course unit
 * Backend: GET /api/assignments/course/{courseId}/unit/{unitId}
 */
export async function fetchAssignmentsByUnit(courseId: string, unitId: string): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching assignments for course ${courseId}, unit ${unitId}`);
    return MOCK_ASSIGNMENTS.filter(assign => assign.courseId === courseId && assign.unitId === unitId);
  }

  try {
    const response = await apiClient.get<AssignmentDTO[]>(
      `/api/assignments/course/${courseId}/unit/${unitId}`
    );
    
    const assignments = await Promise.all(
      response.data.map(dto => mapAssignmentFromBackend(dto))
    );
    
    return assignments;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch assignment by ID
 * Backend: GET /api/assignments/{assignmentId}
 */
export async function fetchAssignmentById(assignmentId: string): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay();
    const assignment = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }
    console.log(`MOCK: Fetching assignment ${assignmentId}`);
    return assignment;
  }

  try {

    console.log(`API: Fetching assignment ${assignmentId}`);
    const response = await apiClient.get<AssignmentDTO>(
      `/api/assignments/${assignmentId}`
    );
    
    const assignment = await mapAssignmentFromBackend(response.data);
    return assignment;
  } catch (error) {
    return await handleApiError(error);
  }
}


/**
 * Process and upload a single file to Cloudinary
 */
async function processAssignmentFile(
  file: File,
  courseId: string,
  assignmentTitle: string
): Promise<FrontendDocumentDTO> {
  // Create folder structure: assignments/{courseId}/{sanitized-title}
  const sanitizedTitle = assignmentTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  const folder = `assignments/${courseId}/${sanitizedTitle}`;

  // Upload file to Cloudinary
  const uploadResult = await uploadDocumentFile(file, folder);

  // Generate file hash (optional - simple checksum)
  const fileHash = await generateFileHash(file);

  // Create document DTO
  const document: FrontendDocumentDTO = {
    originalFilename: file.name,
    // fileSize: file.size,
    // mimeType: file.type,
    // fileHash: uploadResult.url,
    uploadedUrl: uploadResult.url,
  };

  console.log(`✅ Processed file: ${file.name} -> ${uploadResult.url}`);
  return document;
}

/**
 * Generate a simple hash for file verification (optional)
 */
async function generateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16); // First 16 chars
  } catch (error) {
    console.warn('Failed to generate file hash:', error);
    return `${file.size}-${file.name}`; // Fallback
  }
}

/**
 * Process all assignment files in parallel
 */
async function processAssignmentFiles(
  files: File[],
  courseId: string,
  assignmentTitle: string
): Promise<FrontendDocumentDTO[]> {
  if (!files || files.length === 0) {
    return [];
  }

  console.log(`Processing ${files.length} files for assignment: ${assignmentTitle}`);

  // Process all files in parallel for better performance
  const processedDocuments = await Promise.all(
    files.map(file => processAssignmentFile(file, courseId, assignmentTitle))
  );

  console.log(`✅ All ${processedDocuments.length} files processed successfully`);
  return processedDocuments;
}

/**
 * Create assignment with new frontend processing
 */
export async function createAssignment(
  courseId: string,
  unitId: string,
  taskData: any,
  files?: File[]
): Promise<any> {
  console.log("Creating assignment with frontend processing");
  console.log("Task data:", taskData);
  console.log("Files:", files?.length || 0);

  try {
    // Process and upload files to Cloudinary
    const attachments = files && files.length > 0
      ? await processAssignmentFiles(files, courseId, taskData.title)
      : [];

    // Prepare the DTO for backend
    const frontendDTO: CreateAssignmentFrontendDTO = {
      courseId: courseId,
      unitId: unitId,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      maxPoints: taskData.maxScore?.maxPoints || taskData.maxPoints || 100,
      instructions: taskData.instructions,
      attachments: attachments.length > 0 ? attachments : undefined,
      links: taskData.urls && taskData.urls.length > 0 ? taskData.urls : undefined,
      targetType: taskData.deliveryMode === "TEAM" ? "TEAM" : "INDIVIDUAL",
      submissionFormat: taskData.submissionFormat || "DIGITAL",
    };

    // Log the payload
    console.log("Frontend DTO to send:", JSON.stringify(frontendDTO, null, 2));

    // Send JSON to new frontend endpoint
    const response = await apiClient.post<any>(
      "/api/assignments/frontend",
      frontendDTO,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("✅ Assignment created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating assignment:", error);
    throw error;
  }
}
/**
 * Update an existing assignment
 * Backend: PUT /api/assignments/{assignmentId}
 */
export async function updateAssignment(
  assignmentId: string,
  assignmentData: Partial<Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions" | "idUser">>
): Promise<Assignment> {
  console.log("Updating assignment:", assignmentId, assignmentData);
  
  if (isMockEnabled) {
    await simulateDelay(600);
    const index = MOCK_ASSIGNMENTS.findIndex(assign => assign.id === assignmentId);
    if (index !== -1) {
      MOCK_ASSIGNMENTS[index] = { ...MOCK_ASSIGNMENTS[index], ...assignmentData };
      console.log(`MOCK: Updated assignment ${assignmentId}`, assignmentData);
      return MOCK_ASSIGNMENTS[index];
    }
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  try {
  

    console.log(`API: Updating assignment ${assignmentData}`);
    const command = await mapAssignmentToUpdateCommand(assignmentId, assignmentData);
    
    console.log("Sending update assignment request:", command);
    
    await apiClient.put<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}`,
      command
    );
    
    // Fetch the updated assignment details
    const updatedAssignment = await fetchAssignmentById(assignmentId);
    
    console.log("Backend: Updated assignment:", assignmentId);
    return updatedAssignment;
  } catch (error) {
    console.error("Error updating assignment:", error);
    return await handleApiError(error);
  }
}

/**
 * Delete an assignment
 * Backend: DELETE /api/assignments/{assignmentId}
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);
    const index = MOCK_ASSIGNMENTS.findIndex(assign => assign.id === assignmentId);
    if (index !== -1) {
      MOCK_ASSIGNMENTS.splice(index, 1);
      console.log(`MOCK: Deleted assignment ${assignmentId}`);
      return;
    }
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  try {
    console.log("Deleting assignment:", assignmentId);
    
    await apiClient.delete<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}`
    );
    
    console.log("Backend: Deleted assignment:", assignmentId);
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return await handleApiError(error);
  }
}

/**
 * Extend due date for an assignment
 * Backend: PUT /api/assignments/{assignmentId}/due-date
 */
export async function extendAssignmentDueDate(
  assignmentId: string,
  newDueDate: string
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(500);
    const assignment = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
    if (assignment) {
      assignment.dueDate = newDueDate;
      console.log(`MOCK: Extended due date for assignment ${assignmentId} to ${newDueDate}`);
    }
    return;
  }

  try {
    await apiClient.put<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/due-date`,
      { newDueDate }
    );
    
    console.log("Backend: Extended due date for assignment:", assignmentId);
  } catch (error) {
    console.error("Error extending due date:", error);
    return await handleApiError(error);
  }
}

/**
 * Activate an assignment
 * Backend: PUT /api/assignments/{assignmentId}/activate
 */
export async function activateAssignment(assignmentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(500);
    console.log(`MOCK: Activated assignment ${assignmentId}`);
    return;
  }

  try {
    await apiClient.put<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/activate`
    );
    
    console.log("Backend: Activated assignment:", assignmentId);
  } catch (error) {
    console.error("Error activating assignment:", error);
    return await handleApiError(error);
  }
}

/**
 * Deactivate an assignment
 * Backend: PUT /api/assignments/{assignmentId}/deactivate
 */
export async function deactivateAssignment(assignmentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(500);
    console.log(`MOCK: Deactivated assignment ${assignmentId}`);
    return;
  }

  try {
    await apiClient.put<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/deactivate`
    );
    
    console.log("Backend: Deactivated assignment:", assignmentId);
  } catch (error) {
    console.error("Error deactivating assignment:", error);
    return await handleApiError(error);
  }
}

/**
 * Fetch all assignments for a course
 * Backend: GET /api/assignments/course/{courseId}
 */
export async function fetchAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const assignments = MOCK_ASSIGNMENTS.filter(assign => assign.courseId === courseId);
    console.log(`MOCK: Fetching ${assignments.length} assignments for course ${courseId}`);
    return assignments;
  }

  try {
    const response = await apiClient.get<AssignmentDTO[]>(
      `/api/assignments/course/${courseId}`
    );
    
    const assignments = await Promise.all(
      response.data.map(dto => mapAssignmentFromBackend(dto))
    );
    
    return assignments;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Validate assignment data before creation/update
 */
export async function validateAssignmentData(
  assignmentData: Partial<Assignment>
): Promise<{ 
  isValid: boolean; 
  errors: string[] 
}> {
  const errors: string[] = [];

  if (!assignmentData.title?.trim()) {
    errors.push("Assignment title is required");
  }

  if (!assignmentData.description?.trim()) {
    errors.push("Assignment description is required");
  }

  if (!assignmentData.instructions?.trim()) {
    errors.push("Assignment instructions are required");
  }

  if (assignmentData.maxScore?.maxPoints && assignmentData.maxScore.maxPoints <= 0) {
    errors.push("Maximum points must be greater than 0");
  }

  if (assignmentData.deliveryMode && !["INDIVIDUAL", "GROUP"].includes(assignmentData.deliveryMode)) {
    errors.push("Delivery mode must be either INDIVIDUAL or GROUP");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}


// File: src/app/features/courses/api/assignment-api.ts
// Add these functions to your existing assignment-api.ts file

// ============================================
// LINK MANAGEMENT
// ============================================

/**
 * Add a single link to an assignment
 * Backend: POST /api/assignments/{assignmentId}/links
 */
export async function addLinkToAssignment(
  assignmentId: string,
  link: string
): Promise<void> {
  try {
    console.log(`Adding link to assignment ${assignmentId}:`, link);
    
    await apiClient.post<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/links`,
      { link }
    );
    
    console.log("✅ Link added successfully");
  } catch (error) {
    console.error("❌ Error adding link:", error);
    return await handleApiError(error);
  }
}

/**
 * Add multiple links to an assignment
 * Backend: POST /api/assignments/{assignmentId}/links/batch
 */
export async function addMultipleLinksToAssignment(
  assignmentId: string,
  links: string[]
): Promise<void> {
  try {
    console.log(`Adding ${links.length} links to assignment ${assignmentId}`);
    
    await apiClient.post<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/links/batch`,
      { links }
    );
    
    console.log("✅ Links added successfully");
  } catch (error) {
    console.error("❌ Error adding links:", error);
    return await handleApiError(error);
  }
}

/**
 * Remove a link from an assignment
 * Backend: DELETE /api/assignments/{assignmentId}/links
 */
export async function removeLinkFromAssignment(
  assignmentId: string,
  linkUrl: string
): Promise<void> {
  try {
    console.log(`Removing link from assignment ${assignmentId}:`, linkUrl);
    
    await apiClient.delete<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/links`,
      { data: { linkUrl } }
    );
    
    console.log("✅ Link removed successfully");
  } catch (error) {
    console.error("❌ Error removing link:", error);
    return await handleApiError(error);
  }
}

/**
 * Clear all links from an assignment
 * Backend: DELETE /api/assignments/{assignmentId}/links/all
 */
export async function clearAllLinksFromAssignment(
  assignmentId: string
): Promise<void> {
  try {
    console.log(`Clearing all links from assignment ${assignmentId}`);
    
    await apiClient.delete<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/links/all`
    );
    
    console.log("✅ All links cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing links:", error);
    return await handleApiError(error);
  }
}





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

/**
 * Add a single attachment to an assignment
 * Backend: POST /api/assignments/{assignmentId}/attachments/single-json
 */
export async function addAttachmentToAssignment(
  assignmentId: string,
  file: File
): Promise<void> {
  try {
    console.log(`Adding attachment to assignment ${assignmentId}:`, file.name);
    
    // Process file: upload to Cloudinary and extract text
    const documentDTO = await processFileToDTO(file, 'assignment-attachments');
    
    // Send metadata to backend
    await apiClient.post<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/attachments/single-json`,
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
 * Add multiple attachments to an assignment
 * Backend: POST /api/assignments/{assignmentId}/attachments/bulk-json
 */
export async function addMultipleAttachmentsToAssignment(
  assignmentId: string,
  files: File[]
): Promise<void> {
  try {
    console.log(`Adding ${files.length} attachments to assignment ${assignmentId}`);
    
    // Process all files in parallel
    const documentDTOs = await Promise.all(
      files.map(file => processFileToDTO(file, 'assignment-attachments'))
    );
    
    // Create command with processed attachments
    const command = {
      attachments: documentDTOs
    };
    
    // Send metadata to backend
    await apiClient.post<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/attachments/bulk-json`,
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
export async function addMultipleAttachmentsToAssignmentWithProgress(
  assignmentId: string,
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<void> {
  try {
    console.log(`Adding ${files.length} attachments to assignment ${assignmentId} with progress tracking`);
    
    const documentDTOs: FrontendDocumentDTO[] = [];
    
    // Process files one by one to track progress
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i + 1, files.length, file.name);
      
      const documentDTO = await processFileToDTO(file, 'assignment-attachments');
      documentDTOs.push(documentDTO);
    }
    
    // Send all metadata to backend
    const command = {
      attachments: documentDTOs
    };
    
    await apiClient.post<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/attachments/bulk-json`,
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
 * Remove an attachment from an assignment
 * Backend: DELETE /api/assignments/{assignmentId}/attachments
 */
export async function removeAttachmentFromAssignment(
  assignmentId: string,
  documentName: string,
  cloudinaryUrl?: string
): Promise<void> {
  try {
    console.log(`Removing attachment from assignment ${assignmentId}:`, documentName);
    console.log('Cloudinary URL:', cloudinaryUrl); // Add this
    
    if (cloudinaryUrl) {
      try {
        console.log('Attempting Cloudinary deletion...'); // Add this
        const result = await deleteDocumentByUrl(cloudinaryUrl);
        console.log('✓ Deleted from Cloudinary:', result); // Add result
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError); // Change to error
        // Consider throwing here instead of continuing
        throw cloudinaryError;
      }
    } else {
      console.warn('⚠️ No Cloudinary URL provided - skipping cloud deletion'); // Add this
    }
    
    await apiClient.delete<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/attachments`,
      { data: { documentName } }
    );
    
    console.log("✅ Attachment removed successfully");
  } catch (error) {
    console.error("❌ Error removing attachment:", error);
    return await handleApiError(error);
  }
}

// UPDATED: clearAllAttachmentsFromAssignment with Cloudinary deletion
export async function clearAllAttachmentsFromAssignment(
  assignmentId: string,
  attachments?: Array<{ name: string; storagePath: string }> // Add this parameter
): Promise<void> {
  try {
    console.log(`Clearing all attachments from assignment ${assignmentId}`);
    
    // Delete all from Cloudinary if attachments info is provided
    if (attachments && attachments.length > 0) {
      try {
        const publicIds = attachments
          .map(att => extractPublicIdFromUrl(att.storagePath))
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
    
    // Clear from backend database
    await apiClient.delete<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/attachments/all`
    );
    
    console.log("✅ All attachments cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing attachments:", error);
    return await handleApiError(error);
  }
}
