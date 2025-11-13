// File: src/app/features/courses/api/task-inventory-api.ts
"use server";

import {
  SubmissionDetailData,
  TaskInventoryItem,
  TaskType,
} from "@/app/domain/entities/CourseEntities";
import { CourseId, SubmissionId } from "@/app/domain/valueObjects";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  MonitorCheck,
  Paperclip,
  Download,
  HelpCircle,
  MessageSquare,
  ClipboardList,
  FileText,
} from "lucide-react";

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true;

// --- Mock Data Types ---

// --- Mock Data ---
const MOCK_STUDENTS = [
  {
    id: "USER-001",
    name: "Alice Johnson",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "USER-002",
    name: "Bob Smith",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "USER-003",
    name: "Charlie Davis",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "USER-004",
    name: "Diana Wilson",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "USER-005",
    name: "Ethan Brown",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];

const MOCK_ASSIGNMENTS = [
  {
    id: "TASK-101",
    name: "Assignment 2: Wireframe Final",
    unit: "Unit 3: Prototyping & Testing",
    maxPoints: 100,
    type: "ASSIGNMENT" as TaskType,
    instructions:
      "Create high-fidelity wireframes for a mobile banking app. Focus on user flow and accessibility. Submit your Figma file and a brief explanation of your design decisions.",
  },
  {
    id: "TASK-102",
    name: "Critical Thinking Essay",
    unit: "Unit 4: Design Systems",
    maxPoints: 50,
    type: "ASSIGNMENT" as TaskType,
    instructions:
      "Write a 1500-word essay analyzing the impact of design systems on team collaboration and product consistency. Include at least 5 academic references.",
  },

  {
    id: "TASK-104",
    name: "Midterm Quiz: User Research",
    unit: "Unit 2: User Research",
    maxPoints: 75,
    type: "QUIZ" as TaskType,
    instructions:
      "Complete the 30-minute quiz covering user research methodologies, interview techniques, and data analysis approaches.",
  },
  {
    id: "TASK-105",
    name: "Final Project Proposal",
    unit: "Unit 6: Final Project",
    maxPoints: 25,
    type: "ASSIGNMENT" as TaskType,
    instructions:
      "Submit a 2-page project proposal outlining your final capstone project. Include problem statement, target users, and proposed solution approach.",
  },
];

// Mock task inventory data
const MOCK_TASK_INVENTORY: TaskInventoryItem[] = [
  {
    id: "SUB-TASK-101-001",
    taskId: "TASK-101",
    title: "Assignment 2: Wireframe Final",
    unit: "Unit 3: Prototyping & Testing",
    type: "ASSIGNMENT",
    deadline: "2024-03-15",
    isOverdue: true,
    courseId: "COURSE-001",
    studentId: "student-1",
  },
  {
    id: "SUB-TASK-102-001",
    taskId: "TASK-102",
    title: "Critical Thinking Essay",
    unit: "Unit 4: Design Systems",
    type: "ASSIGNMENT",
    deadline: "2024-03-20",
    isOverdue: false,
    courseId: "COURSE-001",
    studentId: "student-1",
  },
  {
    id: "SUB-TASK-103-001",
    taskId: "TASK-103",
    title: "Week 5 Discussion: Accessibility",
    unit: "Unit 5: Accessibility",
    type: "FORUM",
    deadline: "2024-03-10",
    isOverdue: true,
    courseId: "COURSE-001",
    studentId: "student-1",
  },
  {
    id: "SUB-TASK-104-001",
    taskId: "TASK-104",
    title: "Midterm Quiz: User Research",
    unit: "Unit 2: User Research",
    type: "QUIZ",
    deadline: "2024-03-25",
    isOverdue: false,
    courseId: "COURSE-001",
    studentId: "student-1",
  },
  {
    id: "SUB-TASK-105-001",
    taskId: "TASK-105",
    title: "Final Project Proposal",
    unit: "Unit 6: Final Project",
    type: "ASSIGNMENT",
    deadline: "2024-04-01",
    isOverdue: false,
    courseId: "COURSE-001",
    studentId: "student-1",
  },
];

// Mock submission details
const MOCK_SUBMISSION_DETAILS: { [key: string]: SubmissionDetailData } = {
  "SUB-TASK-101-001": {
    submission: {
      id: "SUB-TASK-101-001",
      content:
        "I've created wireframes for a mobile banking app focusing on three key user flows: account overview, money transfer, and bill payment. The design emphasizes clarity and accessibility with high contrast ratios and clear typography hierarchy.\n\nKey design decisions:\n- Used a bottom navigation bar for primary actions\n- Implemented a dashboard-style account overview\n- Created a step-by-step flow for money transfers\n- Added confirmation screens for all financial transactions\n\nThe wireframes follow iOS human interface guidelines while maintaining brand consistency across all screens.",
      submittedAt: "2024-03-14T23:45:00Z",
      status: "LATE_SUBMITTED",
      attachments: [
        {
          name: "wireframes.fig",
          storagePath: "/submissions/TASK-101/wireframes.fig",
          createdAt: "2024-03-14T23:45:00Z",
        },
        {
          name: "design-rationale.pdf",
          storagePath: "/submissions/TASK-101/design-rationale.pdf",
          createdAt: "2024-03-14T23:45:00Z",
        },
        {
          name: "user-flow-diagram.png",
          storagePath: "/submissions/TASK-101/user-flow.png",
          createdAt: "2024-03-14T23:45:00Z",
        },
      ],
      grade: { value: 20, maxScore: 100 },
      teacherFeedback:
        "Good attention to accessibility. Consider adding more micro-interactions for better user engagement.",
    },
    task: {
      id: "TASK-101",
      title: "Assignment 2: Wireframe Final",
      maxPoints: 100,
      instructions:
        "Create high-fidelity wireframes for a mobile banking app. Focus on user flow and accessibility. Submit your Figma file and a brief explanation of your design decisions.",
    },
    student: MOCK_STUDENTS[0],
    aiAnalysis: {
      status: "COMPLETED",
      result: {
        aiProbability: { value: "0.12", maxScore: "1.0" },
        detectedSegments: [
          { start: 150, end: 220, probability: "0.78" },
          { start: 450, end: 520, probability: "0.65" },
        ],
        writingStyle: "Academic",
        readabilityScore: "Good",
        potentialIssues: ["Minor repetition in design rationale section"],
      },
    },
  },
  "SUB-TASK-102-001": {
    submission: {
      id: "SUB-TASK-102-001",
      content:
        "Design systems have revolutionized how organizations approach digital product development. This essay explores the multifaceted impact of design systems on team collaboration and product consistency...",
      submittedAt: "2024-03-18T14:30:00Z",
      status: "SUBMITTED",
      attachments: [
        {
          name: "design-systems-essay.docx",
          storagePath: "/submissions/TASK-102/essay.docx",
          createdAt: "2024-03-18T14:30:00Z",
        },
        {
          name: "references.bib",
          storagePath: "/submissions/TASK-102/references.bib",
          createdAt: "2024-03-18T14:30:00Z",
        },
      ],
      grade: null,
      teacherFeedback: null,
    },
    task: {
      id: "TASK-102",
      title: "Critical Thinking Essay",
      maxPoints: 50,
      instructions:
        "Write a 1500-word essay analyzing the impact of design systems on team collaboration and product consistency. Include at least 5 academic references.",
    },
    student: MOCK_STUDENTS[1],
    aiAnalysis: {
      status: "PENDING",
      result: null,
    },
  },
};

// Utility to simulate network delay for mock data
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --- API CLIENT CONFIGURATION (ONLY USED WHEN MOCKING IS DISABLED) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

/**
 * Error handling wrapper for API calls
 */
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// --- API FUNCTIONS WITH MOCKING LOGIC ---

/**
 * Fetch task inventory for a course
 */

// HERE THE BACKEND WILL GET TOGETHER THE QUIZ AND TASKS
export async function fetchTaskInventory(
  courseId: CourseId
): Promise<TaskInventoryItem[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning task inventory for course ${courseId}`);
    console.log("MOCK TASK INVENTORY DATA:", MOCK_TASK_INVENTORY);
    return MOCK_TASK_INVENTORY;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get(
      `/courses/${courseId}/tasks/inventory`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch submission detail by ID
 */
export async function fetchSubmissionDetail(
  submissionId: SubmissionId
): Promise<SubmissionDetailData> {
  if (isMockEnabled) {
    await simulateDelay(600);

    const submission = MOCK_SUBMISSION_DETAILS[submissionId];
    if (!submission) {
      // Generate a mock submission if not found
      const student =
        MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
      const task =
        MOCK_ASSIGNMENTS[Math.floor(Math.random() * MOCK_ASSIGNMENTS.length)];

      const mockSubmission: SubmissionDetailData = {
        submission: {
          id: submissionId,
          content:
            "This is a generated submission content for demonstration purposes. The student has completed the assignment according to the provided instructions.",
          submittedAt: new Date().toISOString(),
          status: "SUBMITTED",
          attachments: [
            {
              name: `submission-${submissionId}.pdf`,
              storagePath: `/submissions/${submissionId}/doc.pdf`,
              createdAt: new Date().toISOString(),
            },
          ],
          grade: null,
          teacherFeedback: null,
        },
        task: {
          id: task.id,
          title: task.name,
          maxPoints: task.maxPoints,
          instructions: task.instructions,
        },
        student: student,
        aiAnalysis: {
          status: Math.random() > 0.5 ? "COMPLETED" : "PENDING",
          result:
            Math.random() > 0.5
              ? {
                  aiProbability: {
                    value: (Math.random() * 0.3).toFixed(2),
                    maxScore: "1.0",
                  },
                  detectedSegments: [
                    {
                      start: 20,
                      end: 50,
                      probability: (Math.random() * 0.5 + 0.5).toFixed(2),
                    },
                  ],
                  writingStyle: "Academic",
                  readabilityScore: "Good",
                }
              : null,
        },
      };

      console.log(
        `MOCK: Generated submission detail for ${submissionId} (not found in predefined data)`
      );
      console.log("GENERATED SUBMISSION DATA:", mockSubmission);
      return mockSubmission;
    }

    console.log(`MOCK: Returning submission detail for ${submissionId}`);
    console.log("SUBMISSION DETAIL DATA:", submission);
    return submission;
  }

  try {
    if (!submissionId) throw new Error("Submission ID is required");
    const response = await apiClient.get(`/submissions/${submissionId}/detail`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update submission grade and feedback
 */
export async function updateSubmissionGrade(
  submissionId: SubmissionId,
  gradeData: {
    grade: number;
    feedback: string;
  }
): Promise<SubmissionDetailData> {
  if (isMockEnabled) {
    await simulateDelay(800);

    // Find or create submission
    let submission = MOCK_SUBMISSION_DETAILS[submissionId];
    if (!submission) {
      // Create a new submission entry
      const student =
        MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
      const task =
        MOCK_ASSIGNMENTS.find((t) => submissionId.includes(t.id)) ||
        MOCK_ASSIGNMENTS[0];

      submission = {
        submission: {
          id: submissionId,
          content: "Submission content",
          submittedAt: new Date().toISOString(),
          status: "SUBMITTED",
          attachments: [],
          grade: null,
          teacherFeedback: null,
        },
        task: {
          id: task.id,
          title: task.name,
          maxPoints: task.maxPoints,
          instructions: task.instructions,
        },
        student: student,
        aiAnalysis: { status: "PENDING", result: null },
      };
      MOCK_SUBMISSION_DETAILS[submissionId] = submission;
    }

    // Update grade and feedback
    const originalGrade = submission.submission.grade;
    submission.submission.grade = {
      value: gradeData.grade,
      maxScore: submission.task.maxPoints,
    };
    submission.submission.teacherFeedback = gradeData.feedback;
    submission.submission.status = "GRADED";

    console.log(`MOCK: Updated grade for submission ${submissionId}`);
    console.log("GRADE DATA PROVIDED:", gradeData);
    console.log("ORIGINAL GRADE:", originalGrade);
    console.log("UPDATED SUBMISSION:", submission);

    return submission;
  }

  try {
    const response = await apiClient.put(
      `/submissions/${submissionId}/grade`,
      gradeData
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Request AI analysis for a submission
 */
export async function requestAIAnalysis(
  submissionId: SubmissionId
): Promise<SubmissionDetailData> {
  if (isMockEnabled) {
    await simulateDelay(2000); // Simulate longer processing time for AI analysis

    let submission = MOCK_SUBMISSION_DETAILS[submissionId];
    if (!submission) {
      console.error(
        `MOCK: Submission ${submissionId} not found for AI analysis`
      );
      throw new Error(`Submission not found: ${submissionId}`);
    }

    const originalAiStatus = submission.aiAnalysis.status;

    // Simulate AI analysis completion
    submission.aiAnalysis = {
      status: "COMPLETED",
      result: {
        aiProbability: {
          value: (Math.random() * 0.2).toFixed(2),
          maxScore: "1.0",
        },
        detectedSegments: [
          {
            start: 50,
            end: 120,
            probability: (Math.random() * 0.3 + 0.6).toFixed(2),
          },
          {
            start: 200,
            end: 280,
            probability: (Math.random() * 0.2 + 0.4).toFixed(2),
          },
        ],
        writingStyle: ["Academic", "Formal"][Math.floor(Math.random() * 2)],
        readabilityScore: ["Excellent", "Good", "Average"][
          Math.floor(Math.random() * 3)
        ],
        potentialIssues: [
          "Minor repetition detected",
          "Citation format needs review",
        ],
        confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      },
    };

    console.log(`MOCK: Completed AI analysis for submission ${submissionId}`);
    console.log("ORIGINAL AI STATUS:", originalAiStatus);
    console.log("AI ANALYSIS RESULT:", submission.aiAnalysis.result);
    console.log("UPDATED SUBMISSION:", submission);

    return submission;
  }

  try {
    const response = await apiClient.post(
      `/submissions/${submissionId}/analyze`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Download submission attachment
 */
export async function downloadSubmissionAttachment(
  submissionId: SubmissionId,
  attachmentId: string
): Promise<Blob> {
  if (isMockEnabled) {
    await simulateDelay(800);

    console.log(
      `MOCK: Simulating download for attachment ${attachmentId} from submission ${submissionId}`
    );

    // Create a mock blob (in real scenario, this would be the actual file)
    const mockContent = `Mock file content for ${attachmentId}`;
    const blob = new Blob([mockContent], { type: "application/octet-stream" });

    console.log("DOWNLOAD DETAILS:", {
      submissionId,
      attachmentId,
      blobSize: blob.size,
      blobType: blob.type,
    });

    return blob;
  }

  try {
    const response = await apiClient.get(
      `/submissions/${submissionId}/attachments/${attachmentId}/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get task inventory statistics
 */

/**
 * Bulk update task deadlines
 */
export async function bulkUpdateTaskDeadlines(
  courseId: CourseId,
  updates: Array<{
    taskId: string;
    newDeadline: string;
  }>
): Promise<TaskInventoryItem[]> {
  if (isMockEnabled) {
    await simulateDelay(1000);

    console.log(
      `MOCK: Bulk updating deadlines for ${updates.length} tasks in course ${courseId}`
    );
    console.log("DEADLINE UPDATES REQUESTED:", updates);

    const updatedTasks: TaskInventoryItem[] = [];

    updates.forEach((update) => {
      const taskIndex = MOCK_TASK_INVENTORY.findIndex(
        (task) => task.taskId === update.taskId
      );
      if (taskIndex !== -1) {
        const originalDeadline = MOCK_TASK_INVENTORY[taskIndex].deadline;
        MOCK_TASK_INVENTORY[taskIndex].deadline = update.newDeadline;

        // Update overdue status based on new deadline
        const newDeadlineDate = new Date(update.newDeadline);
        const today = new Date();
        MOCK_TASK_INVENTORY[taskIndex].isOverdue = newDeadlineDate < today;

        updatedTasks.push(MOCK_TASK_INVENTORY[taskIndex]);

        console.log(
          `Task ${update.taskId}: ${originalDeadline} -> ${update.newDeadline}, Overdue: ${MOCK_TASK_INVENTORY[taskIndex].isOverdue}`
        );
      }
    });

    console.log("UPDATED TASK INVENTORY:", updatedTasks);
    return updatedTasks;
  }

  try {
    const response = await apiClient.put(
      `/courses/${courseId}/tasks/deadlines/bulk`,
      { updates }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Export types for external use
