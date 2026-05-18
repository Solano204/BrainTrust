"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Assignment, Quiz, Page, CourseResourceType } from "@/app/domain/entities/CourseEntities";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};


export async function fetchCalendarEvents(
  teacherId: string,
  monthStart: string
): Promise<{ [dateKey: string]: (Assignment | Quiz | Page)[] }> {
  try {
    const response = await apiClient.get(`/teachers/${teacherId}/calendar/events`, {
      params: { monthStart }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}


export async function fetchThisWeekResources(
  teacherId: string,
  weekStart: string
): Promise<(Assignment | Quiz | Page)[]> {
  try {
    const response = await apiClient.get(`/teachers/${teacherId}/calendar/this-week`, {
      params: { weekStart }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}


export async function fetchMonthResources(
  teacherId: string,
  monthStart: string
): Promise<(Assignment | Quiz | Page)[]> {
  try {
    const response = await apiClient.get(`/teachers/${teacherId}/calendar/month-resources`, {
      params: { monthStart }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}