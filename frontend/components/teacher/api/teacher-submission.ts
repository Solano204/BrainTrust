"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const MOCK_ENABLED = false; // Set to false to use real API

export interface Assignment {
  id: string;
  courseId: string;
  unitId: string;
  courseName: string;
  unitName: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  active: boolean;
  submissionCount: number;
  attachmentCount: number;
  canAcceptSubmissions: boolean;
  targetType: string;
  isTeamAssignment: boolean;
  attachments: DocumentAttachment[];
}

export interface Quiz {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  active: boolean;
  availableNow: boolean;
}

export interface CompleteQuiz {
  id: string;
  courseId: string;
  courseName: string;
  unitId: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  active: boolean;
  availableNow: boolean;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOption[];
  correctAnswer: string;
}

export interface QuestionOption {
  text: string;
  correct: boolean;
}

export interface DocumentAttachment {
  name: string;
  storagePath: string;
}

interface AssignmentDTO {
  id: string;
  courseId: string;
  unitId: string;
  courseName: string;
  unitName: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  active: boolean;
  submissionCount: number;
  attachmentCount: number;
  canAcceptSubmissions: boolean;
  targetType: string;
  isTeamAssignment: boolean;
  attachments: DocumentDTO[];
}

interface QuizDTO {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  active: boolean;
  availableNow: boolean;
}

interface CompleteQuizDTO {
  id: string;
  courseId: string;
  courseName: string;
  unitId: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  active: boolean;
  availableNow: boolean;
  questions: CompleteQuizQuestionDTO[];
}

interface CompleteQuizQuestionDTO {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  correctAnswer: string;
}

interface QuestionOptionDTO {
  text: string;
  correct: boolean;
}

interface DocumentDTO {
  name: string;
  storagePath: string;
}

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

const MOCK_QUIZZES: Quiz[] = [
  {
    id: "QUIZ-001",
    courseId: "COURSE-001",
    courseName: "UX Design Fundamentals",
    title: "UX Principles Quiz",
    description: "Test your knowledge of fundamental UX principles",
    availableFrom: "2024-03-10T00:00:00Z",
    availableUntil: "2024-03-17T23:59:59Z",
    timeLimitMinutes: 30,
    maxAttempts: 2,
    shuffleQuestions: true,
    showCorrectAnswers: true,
    totalPoints: 100,
    questionCount: 10,
    createdAt: "2024-03-05T10:00:00Z",
    active: true,
    availableNow: true
  },
  {
    id: "QUIZ-002",
    courseId: "COURSE-001",
    courseName: "UX Design Fundamentals",
    title: "Prototyping Methods Quiz",
    description: "Assessment on different prototyping techniques",
    availableFrom: "2024-03-20T00:00:00Z",
    availableUntil: "2024-03-27T23:59:59Z",
    timeLimitMinutes: 45,
    maxAttempts: 1,
    shuffleQuestions: false,
    showCorrectAnswers: false,
    totalPoints: 50,
    questionCount: 5,
    createdAt: "2024-03-15T10:00:00Z",
    active: true,
    availableNow: false
  }
];

const MOCK_COMPLETE_QUIZ: CompleteQuiz = {
  id: "QUIZ-001",
  courseId: "COURSE-001",
  courseName: "UX Design Fundamentals",
  unitId: "UNIT-001",
  title: "UX Principles Quiz",
  description: "Test your knowledge of fundamental UX principles",
  availableFrom: "2024-03-10T00:00:00Z",
  availableUntil: "2024-03-17T23:59:59Z",
  timeLimitMinutes: 30,
  maxAttempts: 2,
  shuffleQuestions: true,
  showCorrectAnswers: true,
  totalPoints: 100,
  questionCount: 10,
  createdAt: "2024-03-05T10:00:00Z",
  active: true,
  availableNow: true,
  questions: [
    {
      id: "Q-001",
      questionText: "What is the primary goal of user-centered design?",
      questionType: "MULTIPLE_CHOICE",
      points: 10,
      options: [
        { text: "To create visually appealing interfaces", correct: false },
        { text: "To meet user needs and improve user experience", correct: true },
        { text: "To reduce development costs", correct: false },
        { text: "To implement the latest design trends", correct: false }
      ],
      correctAnswer: "To meet user needs and improve user experience"
    },
    {
      id: "Q-002",
      questionText: "Explain the importance of user research in the design process.",
      questionType: "OPEN_ENDED",
      points: 15,
      options: [],
      correctAnswer: "User research helps understand user needs, behaviors, and pain points, which inform design decisions and ensure the product meets actual user requirements."
    }
  ]
};

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
  (error) => Promise.reject(error)
);

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", errorMessage);
    redirect("/courses");
  }
  throw error;
};

const simulateDelay = async (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));


async function mapAssignmentDTOToAssignment(dto: AssignmentDTO): Promise<Assignment> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    unitId: dto.unitId,
    courseName: dto.courseName,
    unitName: dto.unitName,
    title: dto.title,
    description: dto.description,
    createdAt: dto.createdAt,
    dueDate: dto.dueDate,
    maxPoints: dto.maxPoints,
    instructions: dto.instructions,
    active: dto.active,
    submissionCount: dto.submissionCount,
    attachmentCount: dto.attachmentCount,
    canAcceptSubmissions: dto.canAcceptSubmissions,
    targetType: dto.targetType,
    isTeamAssignment: dto.isTeamAssignment,
    attachments: dto.attachments.map(att => ({
      name: att.name,
      storagePath: att.storagePath
    }))
  };
}

async function mapQuizDTOToQuiz(dto: QuizDTO): Promise<Quiz> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    courseName: dto.courseName,
    title: dto.title,
    description: dto.description,
    availableFrom: dto.availableFrom,
    availableUntil: dto.availableUntil,
    timeLimitMinutes: dto.timeLimitMinutes,
    maxAttempts: dto.maxAttempts,
    shuffleQuestions: dto.shuffleQuestions,
    showCorrectAnswers: dto.showCorrectAnswers,
    totalPoints: dto.totalPoints,
    questionCount: dto.questionCount,
    createdAt: dto.createdAt,
    active: dto.active,
    availableNow: dto.availableNow
  };
}

async function mapCompleteQuizDTOToCompleteQuiz(dto: CompleteQuizDTO): Promise<CompleteQuiz> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    courseName: dto.courseName,
    unitId: dto.unitId,
    title: dto.title,
    description: dto.description,
    availableFrom: dto.availableFrom,
    availableUntil: dto.availableUntil,
    timeLimitMinutes: dto.timeLimitMinutes,
    maxAttempts: dto.maxAttempts,
    shuffleQuestions: dto.shuffleQuestions,
    showCorrectAnswers: dto.showCorrectAnswers,
    totalPoints: dto.totalPoints,
    questionCount: dto.questionCount,
    createdAt: dto.createdAt,
    active: dto.active,
    availableNow: dto.availableNow,
    questions: dto.questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      points: q.points,
      options: q.options.map(opt => ({
        text: opt.text,
        correct: opt.correct
      })),
      correctAnswer: q.correctAnswer
    }))
  };
}

export async function fetchTaskInventory(courseId: string): Promise<TaskInventoryItem[]> {
  if (MOCK_ENABLED) {
    await simulateDelay();
    console.log(`MOCK: Returning task inventory for course ${courseId}`);
    return MOCK_TASK_INVENTORY;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    
    const [assignmentsResponse, quizzesResponse] = await Promise.all([
      apiClient.get<AssignmentDTO[]>(`/api/assignments/course/${courseId}`),
      apiClient.get<QuizDTO[]>(`/api/quizzes/course/${courseId}/basic`)
    ]);

    const assignments = assignmentsResponse.data;
    const quizzes = quizzesResponse.data;

    const taskInventory: TaskInventoryItem[] = [
      ...assignments.map(a => ({
        id: a.id,
        taskId: a.id,
        title: a.title,
        unit: a.unitName,
        type: "ASSIGNMENT" as TaskType,
        deadline: a.dueDate,
        isOverdue: new Date(a.dueDate) < new Date(),
        courseId: a.courseId,
        studentId: "",
      })),
      ...quizzes.map(q => ({
        id: q.id,
        taskId: q.id,
        title: q.title,
        unit: "Quiz",
        type: "QUIZ" as TaskType,
        deadline: q.availableUntil,
        isOverdue: new Date(q.availableUntil) < new Date(),
        courseId: q.courseId,
        studentId: "",
      }))
    ];

    return taskInventory;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchSubmissionDetail(submissionId: string): Promise<SubmissionDetailData> {
  if (MOCK_ENABLED) {
    await simulateDelay(600);

    const submission = MOCK_SUBMISSION_DETAILS[submissionId];
    if (!submission) {
      const student = MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
      const task = MOCK_ASSIGNMENTS[Math.floor(Math.random() * MOCK_ASSIGNMENTS.length)];

      const mockSubmission: SubmissionDetailData = {
        submission: {
          id: submissionId,
          content: "This is a generated submission content for demonstration purposes.",
          submittedAt: new Date().toISOString(),
          status: "SUBMITTED",
          attachments: [{
            name: `submission-${submissionId}.pdf`,
            storagePath: `/submissions/${submissionId}/doc.pdf`,
            createdAt: new Date().toISOString(),
          }],
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
          result: Math.random() > 0.5 ? {
            aiProbability: { value: (Math.random() * 0.3).toFixed(2), maxScore: "1.0" },
            detectedSegments: [{ start: 20, end: 50, probability: (Math.random() * 0.5 + 0.5).toFixed(2) }],
            writingStyle: "Academic",
            readabilityScore: "Good",
          } : null,
        },
      };

      console.log(`MOCK: Generated submission detail for ${submissionId}`);
      return mockSubmission;
    }

    console.log(`MOCK: Returning submission detail for ${submissionId}`);
    return submission;
  }

  try {
    if (!submissionId) throw new Error("Submission ID is required");
    const response = await apiClient.get(`/api/submissions/${submissionId}`);
    
    const dto = response.data;
    return {
      submission: {
        id: dto.id,
        content: dto.content,
        submittedAt: dto.submittedAt,
        status: dto.status,
        attachments: dto.attachments || [],
        grade: dto.grade,
        teacherFeedback: dto.teacherFeedback,
      },
      task: {
        id: dto.assignmentId,
        title: dto.assignmentTitle,
        maxPoints: dto.grade?.maxScore ? parseFloat(dto.grade.maxScore) : 100,
        instructions: "", // Not available in SubmissionDTO
      },
      student: {
        id: dto.studentId,
        name: dto.studentName,
        avatarUrl: "",
      },
      aiAnalysis: dto.aiAnalysis || { status: "PENDING", result: null },
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function updateSubmissionGrade(
  submissionId: string,
  gradeData: { grade: number; feedback: string }
): Promise<SubmissionDetailData> {
  if (MOCK_ENABLED) {
    await simulateDelay(800);

    let submission = MOCK_SUBMISSION_DETAILS[submissionId];
    if (!submission) {
      const student = MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
      const task = MOCK_ASSIGNMENTS.find((t) => submissionId.includes(t.id)) || MOCK_ASSIGNMENTS[0];

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

    submission.submission.grade = { value: gradeData.grade, maxScore: submission.task.maxPoints };
    submission.submission.teacherFeedback = gradeData.feedback;
    submission.submission.status = "GRADED";

    console.log(`MOCK: Updated grade for submission ${submissionId}`);
    return submission;
  }

  try {
    await apiClient.put(`/api/submissions/${submissionId}/grade`, {
      submissionId: submissionId,
      gradeValue: gradeData.grade.toString(),
      maxScore: "100", // You may need to pass this from context
      feedback: gradeData.feedback
    });

    return await fetchSubmissionDetail(submissionId);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function requestAIAnalysis(submissionId: string): Promise<SubmissionDetailData> {
  if (MOCK_ENABLED) {
    await simulateDelay(2000);

    let submission = MOCK_SUBMISSION_DETAILS[submissionId];
    if (!submission) {
      throw new Error(`Submission not found: ${submissionId}`);
    }

    submission.aiAnalysis = {
      status: "COMPLETED",
      result: {
        aiProbability: { value: (Math.random() * 0.2).toFixed(2), maxScore: "1.0" },
        detectedSegments: [
          { start: 50, end: 120, probability: (Math.random() * 0.3 + 0.6).toFixed(2) },
          { start: 200, end: 280, probability: (Math.random() * 0.2 + 0.4).toFixed(2) },
        ],
        writingStyle: ["Academic", "Formal"][Math.floor(Math.random() * 2)],
        readabilityScore: ["Excellent", "Good", "Average"][Math.floor(Math.random() * 3)],
        potentialIssues: ["Minor repetition detected", "Citation format needs review"],
        confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      },
    };

    console.log(`MOCK: Completed AI analysis for submission ${submissionId}`);
    return submission;
  }

  try {
    const response = await apiClient.post(`/api/submissions/${submissionId}/request-ai-analysis`);
    return await fetchSubmissionDetail(submissionId);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function downloadSubmissionAttachment(
  submissionId: string,
  attachmentId: string
): Promise<Blob> {
  if (MOCK_ENABLED) {
    await simulateDelay(800);
    console.log(`MOCK: Simulating download for attachment ${attachmentId}`);
    
    const mockContent = `Mock file content for ${attachmentId}`;
    const blob = new Blob([mockContent], { type: "application/octet-stream" });
    return blob;
  }

  try {
    const response = await apiClient.get(
      `/api/submissions/${submissionId}/attachments/${attachmentId}/download`,
      { responseType: "blob" }
    );
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function bulkUpdateTaskDeadlines(
  courseId: string,
  updates: Array<{ taskId: string; newDeadline: string }>
): Promise<TaskInventoryItem[]> {
  if (MOCK_ENABLED) {
    await simulateDelay(1000);
    console.log(`MOCK: Bulk updating deadlines for ${updates.length} tasks`);

    const updatedTasks: TaskInventoryItem[] = [];
    updates.forEach((update) => {
      const taskIndex = MOCK_TASK_INVENTORY.findIndex(
        (task) => task.taskId === update.taskId
      );
      if (taskIndex !== -1) {
        MOCK_TASK_INVENTORY[taskIndex].deadline = update.newDeadline;
        MOCK_TASK_INVENTORY[taskIndex].isOverdue = new Date(update.newDeadline) < new Date();
        updatedTasks.push(MOCK_TASK_INVENTORY[taskIndex]);
      }
    });

    return updatedTasks;
  }

  try {
    const response = await apiClient.put(
      `/api/courses/${courseId}/tasks/deadlines/bulk`,
      { updates }
    );
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}


export interface TaskInventoryItem {
  id: string;
  taskId: string;
  title: string;
  unit: string;
  type: TaskType;
  deadline: string;
  isOverdue: boolean;
  courseId: string;
  studentId: string;
}

export type TaskType = "ASSIGNMENT" | "QUIZ" | "FORUM";

export interface SimilarParagraphDTO {
  paragraphIndex: number;
  originalText: string;
  matchedText: string;
  similarityPercentage: string | null;
  segmentType: "AI" | "HUMAN" | null;
}

export interface PlagiarismSummaryDTO {
  plagiarismCheckId: string;
  comparedSubmissionId: string;
  comparedStudentId: string;
  comparedStudentName: string | null;
  overallSimilarityPercentage: string | null;
  similarParagraphsCount: number;
  status: string;
}

export interface PlagiarismCheckDTO {
  id: string;
  sourceSubmissionId: string;
  comparedSubmissionId: string;
  comparedStudentId: string;
  comparedStudentName: string | null;
  assignmentId: string;
  overallSimilarityPercentage: string | null;
  similarParagraphs: SimilarParagraphDTO[];
  status: string;
  checkedAt: string | null;
}

export interface SubmissionHistoryItemDTO {
  submissionId: string;
  assignmentId: string;
  assignmentName: string;
  unitId: string | null;
  unitName: string | null;
  unitOrder: number;
  submittedAt: string | null;
  status: string;
  grade: { value: string; maxScore: string; percentage: string } | null;
  isLate: boolean;
  aiProbabilityPercentage: string | null;
  isLikelyAI: boolean;
  hasAiAnalysis: boolean;
  allSegments: SimilarParagraphDTO[];
  plagiarismMatches: PlagiarismSummaryDTO[];
}

export interface StudentHistoryDTO {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  submissions: SubmissionHistoryItemDTO[];
}

export async function fetchPlagiarismResultsForSubmission(
  submissionId: string
): Promise<PlagiarismCheckDTO[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await apiClient.get<PlagiarismCheckDTO[]>(
      `/api/submissions/${submissionId}/plagiarism`
    );
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchPlagiarismResultsForAssignment(
  assignmentId: string
): Promise<PlagiarismCheckDTO[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await apiClient.get<PlagiarismCheckDTO[]>(
      `/api/assignments/${assignmentId}/plagiarism`
    );
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchStudentHistory(
  courseId: string,
  studentId: string
): Promise<StudentHistoryDTO> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await apiClient.get<StudentHistoryDTO>(
      `/api/submissions/course/${courseId}/students/${studentId}/history`
    );
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

export interface SubmissionDetailData {
  submission: {
    id: string;
    content: string;
    submittedAt: string;
    status: string;
    attachments: Array<{
      name: string;
      storagePath: string;
      createdAt: string;
    }>;
    grade: { value: number; maxScore: number } | null;
    teacherFeedback: string | null;
  };
  task: {
    id: string;
    title: string;
    maxPoints: number;
    instructions: string;
  };
  student: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  aiAnalysis: {
    status: string;
    result: {
      aiProbability: { value: string; maxScore: string };
      detectedSegments: Array<{ start: number; end: number; probability: string }>;
      writingStyle: string;
      readabilityScore: string;
      potentialIssues?: string[];
      confidence?: string;
    } | null;
  };
}
