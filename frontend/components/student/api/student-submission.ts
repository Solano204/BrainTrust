
"use server";

import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";
import axios from "axios";

import {
  AssignmentDTO,
  SubmissionDTO,
  SubmissionBasicDTO,
  SuccessResponseDTO,
  SubmissionAnalyticsDTO,
} from "@/app/shared/dtos/assignment.dto";

import {
  GradeSubmissionCommand,
} from "@/app/shared/dtos/commands/assignment.commands";

import {
  Assignment,
  Submission,
  SubmissionTask,
  SubmissionAnalytics,
} from "@/app/shared/models/assignment.model";

import {
  mapAssignmentFromBackend,
  mapSubmissionFromBackend,
  mapSubmissionToTask,
  mapIndividualSubmissionToFrontendDTO,
  mapTeamSubmissionToFrontendDTO,
} from "@/app/shared/mappers/assignment.mappers";


export async function fetchAssignmentById(
    assignmentId: string
): Promise<Assignment> {
  try {
    const { data } = await apiClient.get<AssignmentDTO>(
        `/api/assignments/${assignmentId}`
    );
    return mapAssignmentFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchAssignmentsByCourse(
    courseId: string
): Promise<Assignment[]> {
  try {
    const { data } = await apiClient.get<AssignmentDTO[]>(
        `/api/assignments/course/${courseId}`
    );
    return data.map(mapAssignmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchAssignmentsByUnit(
    courseId: string,
    unitId: string
): Promise<Assignment[]> {
  try {
    const { data } = await apiClient.get<AssignmentDTO[]>(
        `/api/assignments/course/${courseId}/unit/${unitId}`
    );
    return data.map(mapAssignmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}


export async function fetchStudentSubmissions(
    courseId: string,
    studentId: string,
    unitId: string
): Promise<SubmissionTask[]> {
  try {
    const { data } = await apiClient.get<SubmissionDTO[]>(
        `/api/submissions/student/${studentId}/course/${courseId}/unit/${unitId}`
    );
    return data.map(mapSubmissionToTask);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTeacherSubmissions(
    courseId: string,
    unitId: string
): Promise<SubmissionTask[]> {
  try {
    const { data } = await apiClient.get<SubmissionDTO[]>(
        `/api/submissions/course/${courseId}/unit/${unitId}`
    );

    const teamGroups = new Map<string, SubmissionDTO[]>();
    const individual: SubmissionDTO[] = [];

    for (const sub of data) {
      if (sub.isTeamSubmission && sub.teamId) {
        const key = `${sub.assignmentId}-${sub.teamId}`;
        if (!teamGroups.has(key)) teamGroups.set(key, []);
        teamGroups.get(key)!.push(sub);
      } else {
        individual.push(sub);
      }
    }

    const teamRepresentatives = Array.from(teamGroups.values()).map(members => {
      const representative = members.find(m => m.content) ?? members[0];
      return { ...representative, _teamMemberIds: members.map(m => m.id) };
    });

    return [...individual, ...teamRepresentatives].map(mapSubmissionToTask);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchSubmissionsByCourseBasic(
    courseId: string
): Promise<SubmissionBasicDTO[]> {
  try {
    const { data } = await apiClient.get<SubmissionBasicDTO[]>(
        `/api/submissions/course/${courseId}/basic`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getStudentTaskSubmission(
    assignmentId: string,
    studentId: string
): Promise<Submission | null> {
  try {
    const { data } = await apiClient.get<SubmissionDTO[]>(
        `/api/submissions/student/${studentId}`
    );

    const submissions = data.map(mapSubmissionFromBackend);
    return submissions.find(s => s.assignmentId === assignmentId) || null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return handleApiError(error);
  }
}

export async function fetchSubmissionById(
    submissionId: string
): Promise<Submission> {
  try {
    const { data } = await apiClient.get<SubmissionDTO>(
        `/api/submissions/${submissionId}`
    );
    return mapSubmissionFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}


export async function submitTask(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
  submissionType: "INDIVIDUAL" | "TEAM";
  groupId?: string;
}): Promise<Submission> {
  if (params.submissionType === "TEAM" && !params.groupId) {
    throw new Error("Group ID is required for team submissions");
  }

  try {
    console.log("Processing submission with frontend extraction", params);
    let response;

    if (params.submissionType === "TEAM") {
      const frontendDTO = await mapTeamSubmissionToFrontendDTO({
        ...params,
        groupId: params.groupId!,
      });

      response = await apiClient.post<SubmissionDTO>(
          `/api/submissions/team/frontend`,
          frontendDTO,
          {
            headers: { "Content-Type": "application/json" },
          }
      );
    } else {
      const frontendDTO = await mapIndividualSubmissionToFrontendDTO(params);

      response = await apiClient.post<SubmissionDTO>(
          `/api/submissions/individual/frontend`,
          frontendDTO,
          {
            headers: { "Content-Type": "application/json" },
          }
      );
    }

    return mapSubmissionFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}


export async function gradeSubmission(
    submissionId: string,
    gradeValue: string,
    maxScore: string,
    feedback: string
): Promise<Submission> {
  try {
    const command: GradeSubmissionCommand = {
      submissionId,
      gradeValue,
      maxScore,
      feedback,
    };

    const { data } = await apiClient.put<SubmissionDTO>(
        `/api/submissions/${submissionId}/grade`,
        command
    );

    return mapSubmissionFromBackend(data);
  } catch (error) {
    return handleApiError(error);
  }
}


export async function deleteSubmission(submissionId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/submissions/${submissionId}`);
  } catch (error) {
    return handleApiError(error);
  }
}


export async function fetchSubmissionAnalytics(
    assignmentId: string
): Promise<SubmissionAnalytics> {
  try {
    const { data } = await apiClient.get<SubmissionAnalyticsDTO>(
        `/api/submissions/assignment/${assignmentId}/analytics`
    );

    return {
      totalSubmissions: data.totalSubmissions,
      gradedSubmissions: data.gradedSubmissions,
      averageGrade: data.averageGrade,
      lateSubmissions: data.lateSubmissions,
      submissionRate: data.submissionRate,
    };
  } catch (error) {
    return handleApiError(error);
  }
}