"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { deleteDocumentByUrl, deleteMultipleDocuments, extractPublicIdFromUrl, uploadDocumentFile } from "@/app/utils/cloudinary/cloudinary-pdf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  links: string[];
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

interface FrontendDocumentDTO {
  originalFilename: string;
  uploadedUrl?: string;
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
  targetType: string;
  submissionFormat: string;
}

async function mapAssignmentFromBackend(dto: AssignmentDTO): Promise<Assignment> {
  return {
    id: dto.id,
    title: dto.title,
    courseId: dto.courseId,
    unitId: dto.unitId,
    description: dto.description,
    createdAt: dto.createdAt,
    attachments: dto.attachments || [],
    urls: dto.links || [],
    links:dto.links || [],
    deliveryMode: dto.targetType === "INDIVIDUAL" ? "INDIVIDUAL" : "TEAM",
    submissionFormat: dto.submissionFormat || "DIGITAL",
    dueDate: dto.dueDate || null,
    maxScore: { value: 0, maxPoints: dto.maxPoints || 100 },
    instructions: dto.instructions || "",
    submissions: [],
    allowLateSubmissions: true,
    idUser: ""
  };
}

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

export async function fetchAssignmentsByUnit(courseId: string, unitId: string): Promise<Assignment[]> {
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

export async function fetchAssignmentById(assignmentId: string): Promise<Assignment> {
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

async function processAssignmentFile(
  file: File,
  courseId: string,
  assignmentTitle: string
): Promise<FrontendDocumentDTO> {
  const sanitizedTitle = assignmentTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  const folder = `assignments/${courseId}/${sanitizedTitle}`;

  const uploadResult = await uploadDocumentFile(file, folder);

  const document: FrontendDocumentDTO = {
    originalFilename: file.name,
    uploadedUrl: uploadResult.url,
  };

  console.log(`✅ Processed file: ${file.name} -> ${uploadResult.url}`);
  return document;
}

async function processAssignmentFiles(
  files: File[],
  courseId: string,
  assignmentTitle: string
): Promise<FrontendDocumentDTO[]> {
  if (!files || files.length === 0) {
    return [];
  }

  console.log(`Processing ${files.length} files for assignment: ${assignmentTitle}`);

  const processedDocuments = await Promise.all(
    files.map(file => processAssignmentFile(file, courseId, assignmentTitle))
  );

  console.log(`✅ All ${processedDocuments.length} files processed successfully`);
  return processedDocuments;
}

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
    const attachments = files && files.length > 0
      ? await processAssignmentFiles(files, courseId, taskData.title)
      : [];

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

    console.log("Frontend DTO to send:", JSON.stringify(frontendDTO, null, 2));

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

export async function updateAssignment(
  assignmentId: string,
  assignmentData: Partial<Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions" | "idUser">>
): Promise<Assignment> {
  console.log("Updating assignment:", assignmentId, assignmentData);

  try {
    console.log(`API: Updating assignment ${assignmentData}`);
    const command = await mapAssignmentToUpdateCommand(assignmentId, assignmentData);
    
    console.log("Sending update assignment request:", command);
    
    await apiClient.put<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}`,
      command
    );
    
    const updatedAssignment = await fetchAssignmentById(assignmentId);
    
    console.log("Backend: Updated assignment:", assignmentId);
    return updatedAssignment;
  } catch (error) {
    console.error("Error updating assignment:", error);
    return await handleApiError(error);
  }
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
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

export async function extendAssignmentDueDate(
  assignmentId: string,
  newDueDate: string
): Promise<void> {
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

export async function activateAssignment(assignmentId: string): Promise<void> {
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

export async function deactivateAssignment(assignmentId: string): Promise<void> {
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

export async function fetchAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
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

export async function addLinkToAssignment(
  assignmentId: string,
  link: string
): Promise<void> {
  try {
    console.log(`Adding link to assignment ${assignmentId}:`, link);
    
   const response = await apiClient.post<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/links`,
      { link }
    );
    
    console.log("✅ Link added successfully",response);
  } catch (error) {
    console.error("❌ Error adding link:", error);
    return await handleApiError(error);
  }
}

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

async function processFileToDTO(file: File, folder: string): Promise<FrontendDocumentDTO> {
  console.log(`Processing file: ${file.name} (${file.size} bytes)`);
  
  const uploadResult = await uploadDocumentFile(file, folder);
  console.log(`✓ Uploaded to Cloudinary: ${uploadResult.url}`);
  
  return {
    originalFilename: file.name,
    uploadedUrl: uploadResult.url,
  };
}

export async function addAttachmentToAssignment(
  assignmentId: string,
  file: File
): Promise<void> {
  try {
    console.log(`Adding attachment to assignment ${assignmentId}:`, file.name);
    
    const documentDTO = await processFileToDTO(file, 'assignment-attachments');
    
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

export async function addMultipleAttachmentsToAssignment(
  assignmentId: string,
  files: File[]
): Promise<void> {
  try {
    console.log(`Adding ${files.length} attachments to assignment ${assignmentId}`);
    
    const documentDTOs = await Promise.all(
      files.map(file => processFileToDTO(file, 'assignment-attachments'))
    );
    
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
    
    console.log("✅ Attachments added successfully");
  } catch (error) {
    console.error("❌ Error adding attachments:", error);
    return await handleApiError(error);
  }
}

export async function addMultipleAttachmentsToAssignmentWithProgress(
  assignmentId: string,
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<void> {
  try {
    console.log(`Adding ${files.length} attachments to assignment ${assignmentId} with progress tracking`);
    
    const documentDTOs: FrontendDocumentDTO[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.(i + 1, files.length, file.name);
      
      const documentDTO = await processFileToDTO(file, 'assignment-attachments');
      documentDTOs.push(documentDTO);
    }
    
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

export async function removeAttachmentFromAssignment(
  assignmentId: string,
  documentName: string,
  cloudinaryUrl?: string
): Promise<void> {
  try {
    console.log(`Removing attachment from assignment ${assignmentId}:`, documentName);
    console.log('Cloudinary URL:', cloudinaryUrl);
    
    if (cloudinaryUrl) {
      try {
        console.log('Attempting Cloudinary deletion...');
        const result = await deleteDocumentByUrl(cloudinaryUrl);
        console.log('✓ Deleted from Cloudinary:', result);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        throw cloudinaryError;
      }
    } else {
      console.warn('⚠️ No Cloudinary URL provided - skipping cloud deletion');
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

export async function clearAllAttachmentsFromAssignment(
  assignmentId: string,
  attachments?: Array<{ name: string; storagePath: string }>
): Promise<void> {
  try {
    console.log(`Clearing all attachments from assignment ${assignmentId}`);
    
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
      }
    }
    
    await apiClient.delete<SuccessResponseDTO>(
      `/api/assignments/${assignmentId}/attachments/all`
    );
    
    console.log("✅ All attachments cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing attachments:", error);
    return await handleApiError(error);
  }
} 