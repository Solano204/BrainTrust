"use server";
import { CourseUnit, UnitResource } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import { uploadImageFile } from "@/app/utils/cloudinary/cloudinary";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface CourseUnitDTO {
  id: string;
  courseId: string;
  name: string;
  urlImage: string;
  numUnity: number;
  description: string;
}

interface AddUnitRequest {
  name: string;
  order: number;
  description: string;
}

interface AddUnitWithImageRequest {
  name: string;
  order: number;
  description: string;
  imageUrl: string;
}

interface UpdateUnitRequest {
  unitId: string;
  name: string;
  description: string;
  urlImage: string;
}

interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface CreateUnitWithImageCommand {
  name: string;
  order: number;
  description: string;
  imageUrl?: string;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

function mapCourseUnitFromBackend(dto: CourseUnitDTO): CourseUnit {
  return {
    id: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    urlImage: dto.urlImage,
    numUnity: dto.numUnity,
    description: dto.description,
    resources: []
  };
}

function mapAddUnitToBackendCommand(data: Omit<CourseUnit, "id" | "courseId" | "resources">): AddUnitRequest {
  return {
    name: data.name,
    order: data.numUnity,
    description: data.description
  };
}

function mapAddUnitWithImageToBackendCommand(data: Omit<CourseUnit, "id" | "courseId" | "resources">): AddUnitWithImageRequest {
  return {
    name: data.name,
    order: data.numUnity,
    description: data.description,
    imageUrl: data.urlImage || ""
  };
}

function mapUpdateUnitToBackendCommand(unitId: string, data: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>): UpdateUnitRequest {
  return {
    unitId,
    name: data.name || "",
    description: data.description || "",
    urlImage: data.urlImage || ""
  };
}

export async function createUnitWithImage(
  courseId: string,
  unitData: Omit<CourseUnit, "id" | "courseId" | "resources">,
  imageFile?: File
): Promise<CourseUnit> {
  try {
    let imageUrl = unitData.urlImage;
    
    if (imageFile) {
      console.log(`Uploading image for new unit in course ${courseId}...`);
      imageUrl = await uploadImageFile(imageFile);
    }

    const command: CreateUnitWithImageCommand = {
      name: unitData.name,
      order: unitData.numUnity,
      description: unitData.description,
      imageUrl: imageUrl || '',
    };

    const url = `/api/courses/${courseId}/units/with-image`;
    const response = await apiClient.post<CourseUnitDTO>(url, command);
    
    const unit = mapCourseUnitFromBackend(response.data);
    console.log(`Created unit ${unit.id} in course ${courseId}`);
    
    return unit;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function updateUnitImage(
  unitId: UnitId,
  imageUrl: string
): Promise<void> {
  try {
    await apiClient.put(`/api/courses/units/${unitId}/image`, { imageUrl });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchUnitsByCourse(courseId: CourseId): Promise<CourseUnit[]> {
  try {
    const response = await apiClient.get<CourseUnitDTO[]>(`/api/courses/${courseId}/units`);
    return response.data.map(mapCourseUnitFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchUnitById(unitId: UnitId): Promise<CourseUnit> {
  try {
    const response = await apiClient.get<CourseUnitDTO>(`/api/courses/units/${unitId}`);
    return mapCourseUnitFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createUnit(
  courseId: CourseId,
  unitData: Omit<CourseUnit, "id" | "courseId" | "resources">
): Promise<CourseUnit> {
  try {
    const backendCommand = {
      name: unitData.name,
      order: unitData.numUnity,
      description: unitData.description
    };
    
    const response = await apiClient.post<CourseUnitDTO>(
      `/api/courses/${courseId}/units`, 
      backendCommand
    );
    
    return mapCourseUnitFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUnit(
  unitId: UnitId,
  unitData: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>
): Promise<CourseUnit> {
  try {
    const backendCommand = {
      unitId,
      name: unitData.name || "",
      description: unitData.description || "",
      urlImage: unitData.urlImage || ""
    };
    
    const response = await apiClient.put<CourseUnitDTO>(`/api/courses/units/${unitId}`, backendCommand);

    return mapCourseUnitFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteUnit(unitId: UnitId): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/units/${unitId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function reorderUnits(
  courseId: CourseId,
  unitOrder: { unitId: UnitId; order: number }[]
): Promise<void> {
  try {
    await Promise.all(
      unitOrder.map(async (item) => {
        await updateUnit(item.unitId, { numUnity: item.order });
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function uploadUnitImageFile(unitId: string, file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/courses/units/${unitId}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const imageUrl = response.data.data?.url || response.data.data;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from upload");
    }

    return imageUrl;
  } catch (error) {
    return handleApiError(error);
  }
}