// File: src/app/infraestructure/api/types/backend-types.ts
"use server";

import { Submission } from "@/app/domain/entities";
import {
  QuizAnswers,
  SubmissionQuiz,
} from "@/app/domain/entities/CourseEntities";
import { Grade } from "@/app/domain/services/serviceCourse";
import {
  AssignmentId,
  CourseId,
  Document,
  SubmissionId,
  SubmissionStatus,
  UnitId,
  UserId,
} from "@/app/domain/valueObjects";
import axios from "axios";
import { cookies } from "next/headers";

// Backend DTO Types based on your Java controllers
export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface SubmissionCompleteIa {
  id: SubmissionId;
  assignmentId: AssignmentId;
  studentId: UserId;
  content: string;
  attachments: Document[];
  courseID: CourseId;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  submittedAt: string;
  status: String;
  grade: Grade | null;
  teacherFeedback: string | null;
}

export interface AssignmentDTO {
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

export interface DocumentDTO {
  name: string;
  storagePath: string;
}

export interface QuizDTO {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalPoints: number;
  questionCount: number;
  createdAt: string;
  active: boolean;
  availableNow: boolean;
}

export interface CompleteQuizDTO {
  id: string;
  courseId: string;
  courseName: string;
  unitId: string;
  title: string;
  description: string;
  availableFrom: string;
  availableUntil: string;
  timeLimitMinutes: number;
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

export interface CompleteQuizQuestionDTO {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  correctAnswer: string;
}

export interface QuestionOptionDTO {
  text: string;
  correct: boolean;
}

export interface SubmissionDTO {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  content: string;
  status: string;
  grade: GradeDTO;
  teacherFeedback: string;
  submittedAt: string;
  isLate: boolean;
  attachments: DocumentDTO[];
  aiAnalysis: AIDetectionResultDTO;
  teamId: string;
  teamName: string;
  isTeamSubmission: boolean;
}

export interface QuizSubmissionDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  answers: QuizAnswerDTO[];
  timeExpired: boolean;
}

export interface QuizSubmissionDetailDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  questionResponses: QuestionResponseDTO[];
  timeExpired: boolean;
}

export interface QuizAnswerDTO {
  questionId: string;
  questionText: string;
  selectedOptions: number[];
  textAnswer: string;
  correct: boolean;
  pointsEarned: number;
}

export interface QuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface GradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

export interface AIDetectionResultDTO {
  analysisId: string;
  probability: string;
  percentage: string;
  isLikelyAI: boolean;
  confidenceLevel: string;
  modelUsed: string;
  analyzedAt: string;
}

export interface SubmissionTask {
  id: string;
  name: string;
  unit: string;
  instructions: string;
  maxPoints: number;
  deadline: string;
  isOverdue: boolean;
  submission?: {
    id: string;
    content: string;
    submittedAt: string;
    status: string;
    grade?: { value: string; maxScore: number };
    teacherFeedback?: string;
    attachments: Array<{
      name: string;
      storagePath: string;
      createdAt: string;
    }>;
    aiAnalysis?: AIDetectionResultDTO;
  };
}

export interface StudentQuiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  maxGrade: number;
  dueDate?: string;
  isOverdue: boolean;
  submission?: {
    id: string;
    status: string;
    submittedAt: string;
    grade?: { value: number; maxScore: number };
    teacherFeedback?: string;
  };
}

export interface QuizSubmissionDetail {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  questionResponses: QuestionResponseDTO[];
  timeExpired: boolean;
}

// File: src/app/infraestructure/api/types/submission-types.ts
("use server");

// ============================================
// BACKEND DTO TYPES
// ============================================

export interface SubmissionDTO {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  content: string;
  status: string; // DRAFT, SUBMITTED, GRADED, RETURNED
  grade: GradeDTO;
  teacherFeedback: string;
  submittedAt: string;
  isLate: boolean;
  attachments: DocumentDTO[];
  aiAnalysis: AIDetectionResultDTO;
  teamId: string;
  teamName: string;
  isTeamSubmission: boolean;
}

export interface QuizSubmissionDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  answers: QuizAnswerDTO[];
  timeExpired: boolean;
}

export interface QuizSubmissionDetailDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: GradeDTO;
  autoGraded: boolean;
  questionResponses: QuestionResponseDTO[];
  timeExpired: boolean;
}

export interface QuizSubmissionBasicDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  status: string;
  submittedAt: string;
  attemptNumber: number;
}

export interface SubmissionBasicDTO {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  status: string;
  submittedAt: string;
  gradeValue: string;
  gradeMaxScore: string;
  isTeamSubmission: boolean;
  teamId: string;
}

export interface GradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

export interface DocumentDTO {
  name: string;
  storagePath: string;
}

export interface AIDetectionResultDTO {
  analysisId: string;
  probability: string;
  percentage: string;
  isLikelyAI: boolean;
  confidenceLevel: string;
  modelUsed: string;
  analyzedAt: string;
}

export interface QuizAnswerDTO {
  questionId: string;
  questionText: string;
  selectedOptions: number[];
  textAnswer: string;
  correct: boolean;
  pointsEarned: number;
}

export interface QuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuestionOptionDTO {
  text: string;
  correct: boolean;
}

// ============================================
// BACKEND COMMAND TYPES
// ============================================

export interface SubmitAssignmentCommand {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
}

export interface SubmitTeamAssignmentCommand {
  assignmentId: string;
  groupId: string;
  studentSenderId: string;
  content: string;
  attachments: File[];
}

export interface GradeSubmissionCommand {
  submissionId: string;
  gradeValue: string;
  maxScore: string;
  feedback: string;
}

export interface SubmitQuizWithAnswersCommand {
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: QuizAnswerData };
}

export interface QuizAnswerData {
  selectedOptions: number[];
  textAnswer: string;
  timeSpentSeconds: number;
}

export interface GradeQuizSubmissionCommand {
  quizSubmissionId: string;
  earnedPoints: number;
  totalPoints: number;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface SubmissionAnalyticsDTO {
  totalSubmissions: number;
  gradedSubmissions: number;
  averageGrade: number;
  lateSubmissions: number;
  submissionRate: number;
}

// Mock data for student assignments
const MOCK_STUDENT_ASSIGNMENTS: SubmissionTask[] = [
  {
    id: "TASK-101",
    name: "Assignment 2: Wireframe Final",
    unit: "Unit 3: Prototyping & Testing",
    instructions: "Create high-fidelity wireframes for a mobile banking app...",
    maxPoints: 100,
    deadline: "2024-03-15",
    isOverdue: true,
    submission: {
      id: "SUB-TASK-101-001",
      content:
        "I've created wireframes for a mobile banking app focusing on three key user flows...",
      submittedAt: "2024-03-14T23:45:00Z",
      status: "LATE_SUBMITTED",
      grade: { value: "85", maxScore: 100 },
      teacherFeedback:
        "Good attention to accessibility. Consider adding more micro-interactions...",
      attachments: [
        {
          name: "wireframes.fig",
          storagePath: "/submissions/TASK-101/wireframes.fig",
          createdAt: "2024-03-14T23:45:00Z",
        },
      ],
      aiAnalysis: {
        analysisId: "ai-001",
        probability: "0.15",
        percentage: "15%",
        isLikelyAI: false,
        confidenceLevel: "LOW",
        modelUsed: "GPT-4 Detector",
        analyzedAt: "2024-03-15T10:30:00Z",
      },
    },
  },
  {
    id: "TASK-102",
    name: "Critical Thinking Essay",
    unit: "Unit 4: Design Systems",
    instructions:
      "Write a 1500-word essay analyzing the impact of design systems...",
    maxPoints: 50,
    deadline: "2024-03-20",
    isOverdue: false,
    submission: undefined,
  },
];

// Mock data for student quizzes
const MOCK_STUDENT_QUIZZES: StudentQuiz[] = [
  {
    id: "quiz-2",
    title: "UX Design Fundamentals Quiz",
    description:
      "Test your knowledge of basic UX design principles and methodologies",
    timeLimit: 30,
    maxGrade: 100,
    dueDate: "2024-03-25T23:59:00Z",
    isOverdue: false,
    submission: {
      id: "sub-quiz-2-emma",
      status: "GRADED",
      submittedAt: "2024-03-21T10:15:00Z",
      grade: { value: 90, maxScore: 100 },
      teacherFeedback: "Excellent understanding of the concepts.",
    },
  },
];

// Mock data for quiz submission details
const MOCK_QUIZ_SUBMISSION_DETAIL: QuizSubmissionDetail = {
  id: "sub-quiz-2-emma",
  quizId: "quiz-2",
  quizTitle: "UX Design Fundamentals Quiz",
  studentId: "student-001",
  studentName: "Emma Johnson",
  attemptNumber: 1,
  startedAt: "2024-03-21T10:00:00Z",
  submittedAt: "2024-03-21T10:15:00Z",
  status: "GRADED",
  grade: {
    value: "90",
    maxScore: "100",
    percentage: "90%",
  },
  autoGraded: true,
  timeExpired: false,
  questionResponses: [
    {
      questionId: "q-101-1",
      questionText: "What does UCD stand for in design?",
      questionType: "multiple-choice",
      points: 10,
      options: [
        { text: "User-Centered Design", correct: true },
        { text: "User-Created Development", correct: false },
        { text: "Universal Component Design", correct: false },
        { text: "User Configuration Document", correct: false },
      ],
      selectedOptions: [0],
      textAnswer: "",
      correctAnswer: "User-Centered Design",
      isCorrect: true,
    },
    {
      questionId: "q-101-2",
      questionText:
        "Which of the following is NOT a key principle of UX design?",
      questionType: "multiple-choice",
      points: 10,
      options: [
        { text: "User Control", correct: false },
        { text: "Consistency", correct: false },
        { text: "Complex Navigation", correct: true },
        { text: "Accessibility", correct: false },
      ],
      selectedOptions: [2],
      textAnswer: "",
      correctAnswer: "Complex Navigation",
      isCorrect: true,
    },
  ],
};

// Utility to simulate network delay
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Flag to enable/disable mocking
const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === "tue";

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

// Mappers for backend to frontend types
const mapBackendAssignmentToFrontend = (
  backendAssignment: AssignmentDTO,
  submission?: SubmissionDTO
): SubmissionTask => {
  const isOverdue =
    new Date(backendAssignment.dueDate) < new Date() &&
    (!submission || submission.status === "PENDING");

  return {
    id: backendAssignment.id,
    name: backendAssignment.title,
    unit: backendAssignment.unitName,
    instructions: backendAssignment.instructions,
    maxPoints: backendAssignment.maxPoints,
    deadline: backendAssignment.dueDate,
    isOverdue,
    submission: submission
      ? {
          id: submission.id,
          content: submission.content,
          submittedAt: submission.submittedAt,
          status: submission.status,
          grade: submission.grade
            ? {
                value: submission.grade.value,
                maxScore: parseInt(submission.grade.maxScore),
              }
            : undefined,
          teacherFeedback: submission.teacherFeedback,
          attachments: submission.attachments.map((att) => ({
            name: att.name,
            storagePath: att.storagePath,
            createdAt: submission.submittedAt,
          })),
          aiAnalysis: submission.aiAnalysis,
        }
      : undefined,
  };
};

const mapBackendQuizToFrontend = (
  backendQuiz: QuizDTO,
  submission?: QuizSubmissionDTO
): StudentQuiz => {
  const isOverdue =
    backendQuiz.availableUntil &&
    new Date(backendQuiz.availableUntil) < new Date() &&
    (!submission || submission.status === "PENDING");

  return {
    id: backendQuiz.id,
    title: backendQuiz.title,
    description: backendQuiz.description,
    timeLimit: backendQuiz.timeLimitMinutes,
    maxGrade: backendQuiz.totalPoints,
    dueDate: backendQuiz.availableUntil,
    isOverdue = backendQuiz.availableUntil ? isOverdue : false || undefined,
    submission: submission
      ? {
          id: submission.id,
          status: submission.status,
          submittedAt: submission.submittedAt,
          grade: submission.grade
            ? {
                value: parseInt(submission.grade.value),
                maxScore: parseInt(submission.grade.maxScore),
              }
            : undefined,
          teacherFeedback: "", // Quiz submissions might not have direct teacher feedback
        }
      : undefined,
  };
};

const mapBackendQuizSubmissionDetailToFrontend = (
  backendDetail: QuizSubmissionDetailDTO
): QuizSubmissionDetail => {
  return {
    id: backendDetail.id,
    quizId: backendDetail.quizId,
    quizTitle: backendDetail.quizTitle,
    studentId: backendDetail.studentId,
    studentName: backendDetail.studentName,
    attemptNumber: backendDetail.attemptNumber,
    startedAt: backendDetail.startedAt,
    submittedAt: backendDetail.submittedAt,
    status: backendDetail.status,
    grade: backendDetail.grade,
    autoGraded: backendDetail.autoGraded,
    timeExpired: backendDetail.timeExpired,
    questionResponses: backendDetail.questionResponses,
  };
};

/**
 * Fetch student assignments with basic information
 */
export async function fetchStudentSubmissionsItem(
  courseId: CourseId,
  studentId: UserId,
  unitId: UnitId
): Promise<SubmissionTask[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(
      `MOCK: Returning student assignments for course ${courseId} and student ${studentId}`
    );
    return MOCK_STUDENT_ASSIGNMENTS;
  }

  
  try {
    // Get assignments for the specific unit
    const assignmentsResponse = await apiClient.get<AssignmentDTO[]>(
      `/api/assignments/course/${courseId}/unit/${unitId}`
    );
    const assignments = assignmentsResponse.data;

    // Get submissions for the student in this course and unit
    const submissionsResponse = await apiClient.get<SubmissionDTO[]>(
      `/api/submissions/student/${studentId}/course/${courseId}/unit/${unitId}`
    );
    const submissions = submissionsResponse.data;

    // Combine assignments with submissions
    const SubmissionTasks: SubmissionTask[] = assignments.map(assignment => {
      const submission = submissions.find(sub => sub.assignmentId === assignment.id);
      return mapBackendAssignmentToFrontend(assignment, submission);
    });

    return SubmissionTasks;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch student quizzes with basic information
 */
export async function fetchStudentSubmissionsQuizzesItem(
 courseId: CourseId, 
  studentId: UserId, 
  unitId: string
): Promise<StudentQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning student quizzes for course ${courseId}, student ${studentId}, unit ${unitId}`);
    // Filter mock data by unit (in real scenario, backend would filter)
    return MOCK_STUDENT_QUIZZES.filter(quiz => 
      quiz.title.toLowerCase().includes(unitId.toLowerCase())
    );
  }

  try {
    // Get quizzes for the course (you might need a unit-specific endpoint)
    const quizzesResponse = await apiClient.get<QuizDTO[]>(
      `/api/quizzes/course/${courseId}/unit/${unitId}/basic`
    );

    // Get quiz submissions for the student in this course and unit
    const submissionsResponse = await apiClient.get<QuizSubmissionDTO[]>(
      `/api/quiz-submissions/student/${studentId}/course/${courseId}/unit/${unitId}`
    );
    const submissions = submissionsResponse.data;

    // Combine quizzes with submissions
    const studentQuizzes: StudentQuiz[] = quizzesResponse.data.map(quiz => {
      const submission = submissions.find(sub => sub.quizId === quiz.id);
      return mapBackendQuizToFrontend(quiz, submission);
    });

    return studentQuizzes;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch detailed quiz submission
 */
export async function fetchQuizSubmissionDetail(
  submissionId: string
): Promise<QuizSubmissionDetail> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning quiz submission detail for ${submissionId}`);
    return MOCK_QUIZ_SUBMISSION_DETAIL;
  }

  try {
    const response = await apiClient.get<QuizSubmissionDetailDTO>(
      `/api/quiz-submissions/${submissionId}/detail`
    );
    return mapBackendQuizSubmissionDetailToFrontend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}





// ============================================

// TEACHER 



/**
 * Fetch student assignments with basic information
 */
export async function fetchTeacherSubmissionsItem(
  courseId: CourseId,
  unitId: UnitId
): Promise<SubmissionTask[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log( 
      `MOCK: Returning student assignments for course ${courseId}`
    );
    return MOCK_STUDENT_ASSIGNMENTS;
  }

  
  try {
    // Get assignments for the specific unit
    const assignmentsResponse = await apiClient.get<AssignmentDTO[]>(
      `/api/assignments/course/${courseId}/unit/${unitId}`
    );
    const assignments = assignmentsResponse.data;

    // Get submissions for the student in this course and unit
    const submissionsResponse = await apiClient.get<SubmissionDTO[]>(
      `/api/submissions/course/${courseId}/unit/${unitId}`
    );
    const submissions = submissionsResponse.data;

    // Combine assignments with submissions
    const SubmissionTasks: SubmissionTask[] = assignments.map(assignment => {
      const submission = submissions.find(sub => sub.assignmentId === assignment.id);
      return mapBackendAssignmentToFrontend(assignment, submission);
    });

    return SubmissionTasks;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch student quizzes with basic information
 */
export async function fetchTeacherSubmissionsQuizzesItem(
 courseId: CourseId, 
  unitId: string
): Promise<StudentQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning  quizzes for course ${courseId},  unit ${unitId}`);
    // Filter mock data by unit (in real scenario, backend would filter)
    return MOCK_STUDENT_QUIZZES.filter(quiz => 
      quiz.title.toLowerCase().includes(unitId.toLowerCase())
    );
  }

  try {
    // Get quizzes for the course (you might need a unit-specific endpoint)
    const quizzesResponse = await apiClient.get<QuizDTO[]>(
      `/api/quizzes/course/${courseId}/basic`
    );
    const quizzes = quizzesResponse.data;

    // Filter quizzes by unit (assuming quiz has unitId property)
    const unitQuizzes = quizzes.filter(quiz => 
      (quiz as any).unitId === unitId // Adjust based on your actual quiz DTO structure
    );

    // Get quiz submissions for the student in this course and unit
    const submissionsResponse = await apiClient.get<QuizSubmissionDTO[]>(
      `/api/quiz-submissions/course/${courseId}/unit/${unitId}`
    );
    const submissions = submissionsResponse.data;

    // Combine quizzes with submissions
    const studentQuizzes: StudentQuiz[] = unitQuizzes.map(quiz => {
      const submission = submissions.find(sub => sub.quizId === quiz.id);
      return mapBackendQuizToFrontend(quiz, submission);
    });

    return studentQuizzes;
  } catch (error) {
    return handleApiError(error);
  }
}




// ============================================

const MOCK_TASK_SUBMISSIONS: SubmissionCompleteIa[] = [
  {
    id: "sub-task-1",
    assignmentId: "task-1",
    courseID: "crs-101",
    studentId: "student-001",
    content:
      "This is my completed assignment submission with detailed explanations.",
    attachments: [
      {
        name: "assignment.pdf",
        storagePath: "/assignments/sub-task-1/assignment.pdf",
        createdAt: "2024-01-15T10:30:00Z",
      },
    ],
    submittedAt: "2024-01-15T10:30:00Z",
    status: "SUBMITTED",
    grade: { value: '90', maxScore: '100' },
    teacherFeedback: "Good work! Well structured and detailed.",
  },
];

const MOCK_QUIZ_SUBMISSIONS: SubmissionQuiz[] = [
  {
    id: "sub-quiz-1",
    courseId: "crs-101",
    quizId: "quiz-1",
    studentId: "student-001",
    studentName: "Emma Johnson",
    content: "Quiz submission for UX Design Fundamentals",
    status: "GRADED",
    submittedAt: "2024-01-16T14:20:00Z",
    grade: { value: 70, maxScore: 100 },
    teacherFeedback:
      "Check question 2 - the correct answer was Complex Navigation.",
    quizData: {
      answers: [
        {
          questionId: "q-101-1",
          questionText: "What does UCD stand for in design?",
          questionType: "multiple-choice",
          studentAnswer: 0,
          correctAnswer: 0,
          points: 10,
          maxPoints: 10,
          isCorrect: true,
          feedback: "Correct!",
        },
      ],
      timeSpent: 28,
      totalScore: 70,
      maxScore: 100,
    },
  },
];

// ============================================
// MAPPERS - BACKEND TO FRONTEND
// ============================================

/**
 * Maps backend SubmissionDTO to frontend Submission entity
 */
function mapSubmissionFromBackend(dto: SubmissionDTO): SubmissionCompleteIa {
  const mappedGrade: Grade = dto.grade
    ? {
        value: dto.grade.value.toString(),
        maxScore: dto.grade.maxScore.toString(),
      }
    : { value: "", maxScore: "" };

  return {
    id: dto.id,
    assignmentId: dto.assignmentId,
    courseID: dto.assignmentId, // Using assignmentId as fallback
    studentId: dto.studentId,
    content: dto.content,
    attachments: dto.attachments.map((att) => ({
      name: att.name,
      storagePath: att.storagePath,
      createdAt: dto.submittedAt,
    })),
    submittedAt: dto.submittedAt,
    status: dto.status,
    grade: mappedGrade,
    teacherFeedback: dto.teacherFeedback,
  };
}

/**
 * Maps backend QuizSubmissionDTO to frontend SubmissionQuiz entity
 */
function mapQuizSubmissionFromBackend(dto: QuizSubmissionDTO): SubmissionQuiz {
  return {
    id: dto.id,
    courseId: dto.quizId, // Using quizId as fallback
    quizId: dto.quizId,
    studentId: dto.studentId,
    studentName: dto.studentName,
    content: JSON.stringify(dto.answers),
    status: dto.status,
    submittedAt: dto.submittedAt,
    grade: dto.grade
      ? {
          value: parseFloat(dto.grade.value),
          maxScore: parseFloat(dto.grade.maxScore),
        }
      : null,
    teacherFeedback: "", // Quiz submissions might not have direct feedback
    quizData: {
      answers: dto.answers.map((answer) => ({
        questionId: answer.questionId,
        questionText: answer.questionText,
        questionType: "multiple-choice", // Default type
        studentAnswer:
          answer.selectedOptions.length > 0
            ? answer.selectedOptions[0]
            : answer.textAnswer,
        correctAnswer: answer.correct ? "Correct" : "Incorrect",
        points: answer.pointsEarned,
        maxPoints: answer.pointsEarned, // Assuming 1:1 ratio
        isCorrect: answer.correct,
        feedback: "",
      })),
      timeSpent: 0, // Calculate from startedAt/submittedAt if needed
      totalScore: dto.grade ? parseFloat(dto.grade.value) : 0,
      maxScore: dto.grade ? parseFloat(dto.grade.maxScore) : 0,
    },
  };
}

/**
 * Maps backend QuizSubmissionDetailDTO to frontend SubmissionQuiz entity
 */
function mapQuizSubmissionDetailFromBackend(
  dto: QuizSubmissionDetailDTO
): SubmissionQuiz {
  return {
    id: dto.id,
    courseId: dto.quizId,
    quizId: dto.quizId,
    studentId: dto.studentId,
    studentName: dto.studentName,
    content: JSON.stringify(dto.questionResponses),
    status: dto.status,
    submittedAt: dto.submittedAt,
    grade: dto.grade
      ? {
          value: parseFloat(dto.grade.value),
          maxScore: parseFloat(dto.grade.maxScore),
        }
      : null,
    teacherFeedback: "", // Quiz submissions might not have direct feedback
    quizData: {
      answers: dto.questionResponses.map((response) => ({
        questionId: response.questionId,
        questionText: response.questionText,
        questionType: response.questionType,
        studentAnswer:
          response.selectedOptions.length > 0
            ? response.selectedOptions[0]
            : response.textAnswer,
        correctAnswer: response.correctAnswer,
        points: response.points,
        maxPoints: response.points, // Assuming 1:1 ratio
        isCorrect: response.isCorrect,
        feedback: "",
      })),
      timeSpent: 0, // Calculate from startedAt/submittedAt if needed
      totalScore: dto.grade ? parseFloat(dto.grade.value) : 0,
      maxScore: dto.grade ? parseFloat(dto.grade.maxScore) : 0,
    },
  };
}

// ============================================
// MAPPERS - FRONTEND TO BACKEND
// ============================================

/**
 * Maps frontend submission data to backend SubmitAssignmentCommand as FormData
 */
function mapSubmissionToBackendCommand(data: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
}): FormData {
  const formData = new FormData();
  formData.append("assignmentId", data.assignmentId);
  formData.append("studentId", data.studentId);
  formData.append("content", data.content);

  data.attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  return formData;
}

/**
 * Maps quiz answers to backend SubmitQuizWithAnswersCommand
 */
function mapQuizAnswersToBackendCommand(
  quizId: string,
  studentId: string,
  answers: QuizAnswers,
  timeSpent?: number
): SubmitQuizWithAnswersCommand {
  const backendAnswers: { [questionId: string]: QuizAnswerData } = {};

  Object.entries(answers).forEach(([questionId, answerData]) => {
    backendAnswers[questionId] = {
      selectedOptions:
        answerData.type === "multiple-choice"
          ? [answerData.answer as number]
          : [],
      textAnswer:
        answerData.type === "open-ended" ? (answerData.answer as string) : "",
      timeSpentSeconds: answerData.timeSpent || timeSpent || 0,
    };
  });

  return {
    quizId,
    studentId,
    answers: backendAnswers,
  };
}

/**
 * Maps grading data to backend GradeSubmissionCommand
 */
function mapGradingToBackendCommand(
  submissionId: string,
  gradeValue: string,
  maxScore: string,
  feedback: string
): GradeSubmissionCommand {
  return {
    submissionId,
    gradeValue,
    maxScore,
    feedback,
  };
}

/**
 * Maps quiz grading data to backend GradeQuizSubmissionCommand
 */
function mapQuizGradingToBackendCommand(
  quizSubmissionId: string,
  earnedPoints: number,
  totalPoints: number
): GradeQuizSubmissionCommand {
  return {
    quizSubmissionId,
    earnedPoints,
    totalPoints,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get student's existing task submission
 */
export async function getStudentTaskSubmission(
  assignmentId: string,
  studentId: string
): Promise<SubmissionCompleteIa | null> {
  if (isMockEnabled) {
    await simulateDelay();

    const submission = MOCK_TASK_SUBMISSIONS.find(
      (sub) => sub.assignmentId === assignmentId && sub.studentId === studentId
    );

    console.log(
      `MOCK: Getting task submission for assignment ${assignmentId}, student ${studentId}`
    );
    return submission || null;
  }

  try {
    // Get all submissions for student and filter by assignment
    const response = await apiClient.get<SubmissionDTO[]>(
      `/api/submissions/student/${studentId}`
    );
    const submissions = response.data.map(mapSubmissionFromBackend);
    return (
      submissions.find(
        (s: SubmissionCompleteIa) => s.assignmentId === assignmentId
      ) || null
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return handleApiError(error);
  }
}

/**
 * Get student's existing quiz submission
 */
export async function getStudentQuizSubmission(
  quizId: string,
  studentId: string
): Promise<SubmissionQuiz | null> {
  if (isMockEnabled) {
    await simulateDelay();

    const submission = MOCK_QUIZ_SUBMISSIONS.find(
      (sub) => sub.quizId === quizId && sub.studentId === studentId
    );

    console.log(
      `MOCK: Getting quiz submission for quiz ${quizId}, student ${studentId}`
    );
    return submission || null;
  }

  try {
    const response = await apiClient.get<QuizSubmissionDTO>(
      `/api/quiz-submissions/quiz/${quizId}/student/${studentId}/latest`
    );
    return mapQuizSubmissionFromBackend(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return handleApiError(error);
  }
}

/**
 * Get detailed quiz submission
 */
export async function getQuizSubmissionDetail(
  submissionId: string
): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay();

    const submission = MOCK_QUIZ_SUBMISSIONS.find(
      (sub) => sub.id === submissionId
    );
    if (!submission) {
      throw new Error(`Quiz submission not found: ${submissionId}`);
    }

    console.log(`MOCK: Getting quiz submission detail for ${submissionId}`);
    return submission;
  }

  try {
    const response = await apiClient.get<QuizSubmissionDetailDTO>(
      `/api/quiz-submissions/${submissionId}/detail`
    );
    return mapQuizSubmissionDetailFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Submit task with explicit type (useful when you already know the assignment type)
 */



/**
 * Maps individual submission parameters to backend command
 */
function mapIndividualSubmissionToBackendCommand(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
}): FormData {
  const formData = new FormData();
  
  formData.append('assignmentId', params.assignmentId);
  formData.append('studentId', params.studentId);
  formData.append('content', params.content);
  
  // Append attachments if any
  params.attachments.forEach((file, index) => {
    formData.append('attachments', file);
  });
  
  return formData;
}

/**
 * Maps team submission parameters to backend command
 */
function mapTeamSubmissionToBackendCommand(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
  groupId: string;
}): FormData {
  const formData = new FormData();
  
  formData.append('assignmentId', params.assignmentId);
  formData.append('groupId', params.groupId);
  formData.append('studentSenderId', params.studentId);
  formData.append('content', params.content);
  
  // Append attachments if any
  params.attachments.forEach((file, index) => {
    formData.append('attachments', file);
  });
  
  return formData;
}


export async function submitTask(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
  submissionType: 'INDIVIDUAL' | 'TEAM';
  groupId?: string;
}): Promise<Submission> {
  // Validate parameters
  if (params.submissionType === 'TEAM' && !params.groupId) {
    throw new Error("Group ID is required for team submissions");
  }

  if (isMockEnabled) {
    await simulateDelay(800);

    const newSubmission: Submission = {
      id: `sub-task-${Date.now()}`,
      type: params.submissionType,
      assignmentId: params.assignmentId,
      courseID: "crs-101",
      studentId: params.studentId,
      content: params.content,
      attachments: params.attachments.map((file, index) => ({
        name: file.name,
        storagePath: `/assignments/${params.assignmentId}/${file.name}`,
        createdAt: new Date().toISOString(),
      })),
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      grade: null,
      teacherFeedback: null,
    };

    MOCK_TASK_SUBMISSIONS.push(newSubmission);
    console.log("MOCK: Task submitted successfully with explicit type", newSubmission);
    return newSubmission;
  }

  try {
    let response;
    
    if (params.submissionType === 'TEAM') {
      const formData = mapTeamSubmissionToBackendCommand({
        ...params,
        groupId: params.groupId!
      });
      response = await apiClient.post<SuccessResponseDTO>(
        `/api/submissions/team`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    } else {
      const formData = mapIndividualSubmissionToBackendCommand(params);
      response = await apiClient.post<SuccessResponseDTO>(
        `/api/submissions/individual`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    }

    const submissionId = response.data.data;
    const submissionResponse = await apiClient.get<SubmissionDTO>(
      `/api/submissions/${submissionId}`
    );
    return mapSubmissionFromBackend(submissionResponse.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Submit a quiz
 */
export async function submitQuiz(params: {
  quizId: string;
  studentId: string;
  answers: QuizAnswers;
  timeSpent?: number;
}): Promise<SubmissionQuiz> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const totalScore = Object.values(params.answers).reduce((sum, answer) => {
      return sum + (Math.random() > 0.5 ? 10 : 0); // Mock scoring
    }, 0);

    const newSubmission: SubmissionQuiz = {
      id: `sub-quiz-${Date.now()}`,
      quizId: params.quizId,
      studentId: params.studentId,
      courseId: "crs-101",
      studentName: "Student Name",
      content: JSON.stringify(params.answers),
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      grade: { value: totalScore, maxScore: 100 },
      teacherFeedback: null,
      quizData: {
        answers: [],
        timeSpent: params.timeSpent || 0,
        totalScore,
        maxScore: 100,
      },
    };

    const existingIndex = MOCK_QUIZ_SUBMISSIONS.findIndex(
      (sub) =>
        sub.quizId === params.quizId && sub.studentId === params.studentId
    );

    if (existingIndex >= 0) {
      MOCK_QUIZ_SUBMISSIONS[existingIndex] = newSubmission;
    } else {
      MOCK_QUIZ_SUBMISSIONS.push(newSubmission);
    }

    console.log("MOCK: Quiz submitted successfully", newSubmission);
    return newSubmission;
  }

  try {
    const backendCommand: SubmitQuizWithAnswersCommand =
      mapQuizAnswersToBackendCommand(
        params.quizId,
        params.studentId,
        params.answers,
        params.timeSpent
      );

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/quiz-submissions/submit-with-answers`,
      backendCommand
    );

    // Assuming the response contains the submission ID, we need to fetch the full submission
    const submissionId = response.data.data;
    const submissionResponse = await apiClient.get<QuizSubmissionDetailDTO>(
      `/api/quiz-submissions/${submissionId}/detail`
    );
    return mapQuizSubmissionDetailFromBackend(submissionResponse.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Grade a task submission
 */
export async function gradeSubmission(
  submissionId: string,
  gradeValue: string,
  maxScore: string,
  feedback: string
): Promise<Submission> {
  if (isMockEnabled) {
    await simulateDelay(600);

    const index = MOCK_TASK_SUBMISSIONS.findIndex(
      (sub) => sub.id === submissionId
    );
    if (index !== -1) {
      MOCK_TASK_SUBMISSIONS[index].grade = {
        value: parseFloat(gradeValue),
        maxScore: parseFloat(maxScore),
      };
      MOCK_TASK_SUBMISSIONS[index].teacherFeedback = feedback;
      MOCK_TASK_SUBMISSIONS[index].status = "GRADED";

      console.log("MOCK: Graded submission", MOCK_TASK_SUBMISSIONS[index]);
      return MOCK_TASK_SUBMISSIONS[index];
    }
    throw new Error(`Submission not found: ${submissionId}`);
  }

  try {
    const gradingCommand: GradeSubmissionCommand = mapGradingToBackendCommand(
      submissionId,
      gradeValue,
      maxScore,
      feedback
    );

    await apiClient.put(
      `/api/submissions/${submissionId}/grade`,
      gradingCommand
    );

    // Fetch the updated submission
    const response = await apiClient.get<SubmissionDTO>(
      `/api/submissions/${submissionId}`
    );
    return mapSubmissionFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch submissions by course (basic info)
 */
export async function fetchSubmissionsByCourseBasic(
  courseId: CourseId
): Promise<SubmissionBasicDTO[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching basic submissions for course ${courseId}`);

    return MOCK_TASK_SUBMISSIONS.map((sub) => ({
      id: sub.id,
      assignmentId: sub.assignmentId,
      assignmentTitle: "Assignment Title",
      studentId: sub.studentId,
      studentName: "Student Name",
      status: sub.status,
      submittedAt: sub.submittedAt,
      gradeValue: sub.grade?.value?.toString() || "",
      gradeMaxScore: sub.grade?.maxScore?.toString() || "",
      isTeamSubmission: false,
      teamId: "",
    }));
  }

  try {
    const response = await apiClient.get<SubmissionBasicDTO[]>(
      `/api/submissions/course/${courseId}/basic`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch quiz submissions by course (basic info)
 */
export async function fetchQuizSubmissionsByCourseBasic(
  courseId: CourseId
): Promise<QuizSubmissionBasicDTO[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching basic quiz submissions for course ${courseId}`);

    return MOCK_QUIZ_SUBMISSIONS.map((sub) => ({
      id: sub.id,
      quizId: sub.quizId,
      quizTitle: "Quiz Title",
      studentId: sub.studentId,
      studentName: sub.studentName,
      status: sub.status,
      submittedAt: sub.submittedAt,
      attemptNumber: 1,
    }));
  }

  try {
    const response = await apiClient.get<QuizSubmissionBasicDTO[]>(
      `/api/quiz-submissions/course/${courseId}/basic`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete submission
 */
export async function deleteSubmission(
  submissionId: SubmissionId
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);

    const taskIndex = MOCK_TASK_SUBMISSIONS.findIndex(
      (sub) => sub.id === submissionId
    );
    if (taskIndex !== -1) {
      MOCK_TASK_SUBMISSIONS.splice(taskIndex, 1);
      console.log(`MOCK: Deleted task submission ${submissionId}`);
      return;
    }

    const quizIndex = MOCK_QUIZ_SUBMISSIONS.findIndex(
      (sub) => sub.id === submissionId
    );
    if (quizIndex !== -1) {
      MOCK_QUIZ_SUBMISSIONS.splice(quizIndex, 1);
      console.log(`MOCK: Deleted quiz submission ${submissionId}`);
      return;
    }

    throw new Error(`Submission not found: ${submissionId}`);
  }

  try {
    await apiClient.delete(`/api/submissions/${submissionId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete quiz submission
 */
export async function deleteQuizSubmission(
  submissionId: SubmissionId
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);

    const quizIndex = MOCK_QUIZ_SUBMISSIONS.findIndex(
      (sub) => sub.id === submissionId
    );
    if (quizIndex !== -1) {
      MOCK_QUIZ_SUBMISSIONS.splice(quizIndex, 1);
      console.log(`MOCK: Deleted quiz submission ${submissionId}`);
      return;
    }

    throw new Error(`Quiz submission not found: ${submissionId}`);
  }

  try {
    await apiClient.delete(`/api/quiz-submissions/${submissionId}`);
  } catch (error) {
    return handleApiError(error);
  }
}
