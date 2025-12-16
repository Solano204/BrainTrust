// File: src/app/infraestructure/api/types/backend-types.ts
"use server";

import { Submission } from "@/app/domain/entities";
import {
  deliveryMode,
  QuestionType,
  QuizAnswer,
  QuizAnswers,
  SubmissionDetailData,
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
import { getPdfContent, uploadDocumentFile } from "@/app/utils/cloudinary/cloudinary-pdf";
import { requestAIAnalysis } from "@/components/teacher/api/teacher-submission";
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
  studentName: string;
  courseID: CourseId;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  submittedAt: string;
  status: String;
  deliveryMode: deliveryMode;
  type : deliveryMode
  grade: Grade | null;
  teacherFeedback: string | null;
  iaResult: AIDetectionResultDTO | null;
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

// export interface SubmissionDTO {
//   id: string;
//   assignmentId: string;
//   assignmentTitle: string;
//   studentId: string;
//   studentName: string;
//   content: string;
//   status: string;
//   grade: GradeDTO;
//   teacherFeedback: string;
//   submittedAt: string;
//   isLate: boolean;
//   attachments: DocumentDTO[];
//   aiAnalysis: AIDetectionResultDTO;
//   teamId: string;
//   teamName: string;
//   isTeamSubmission: boolean;
// }

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
  id: string; // Assignment ID
  name: string; // Assignment Title
  unit: string; // Unit Name
  instructions: string; // Assignment Instructions
  maxPoints: number; // Assignment Max Points
  deadline: string; // Assignment Deadline
  deliveryMode: deliveryMode;
  studentName: string;
  isOverdue: boolean;
  submission?: SubmissionData;
}

export interface SubmissionData {
  id: string; // Submission ID
  content: string;
  submittedAt: string;
  status: string;
  grade?: {
    value: string;
    maxScore: number;
  };
  teacherFeedback?: string;
  attachments: AttachmentData[];
  aiAnalysis?: AIAnalysisData;
  isTeamSubmission?: boolean;
  teamName?: string;
}

export interface AttachmentData {
  name: string;
  storagePath: string;
}

export interface AIAnalysisData {
  analysisId: string;
  probability: string;
  percentage: string;
  isLikelyAI: boolean;
  confidenceLevel: string;
  modelUsed: string;
  analyzedAt: string;
  segments?: AISegmentAnalysis[];
}

export interface StudentSubmissionQuiz {
  id: string;
  title: string;
  maxGrade: number;
  isOverdue: boolean;
  studentId: string;
  unitId: string;
  studentName: string;
  submission?: {
    id: string;
    status: string;
    submittedAt: string;
    grade?: { value: number; maxScore: number };
    // teacherFeedback?: string
  };
}

export interface StudenSubmissiontQuiz {
  id: string;
  title: string;
  maxGrade: number;
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

// ============================================
// BACKEND DTO TYPES
// ============================================

export interface SubmissionDTO {
  id: string;
  assignmentId: string;
  type?: deliveryMode; // Optional
  deliveryMode?: deliveryMode; // Add this based on the logs
  assignmentTitle: string;
  assignmentInstructions: string;
  assignmentMaxPoints: number;
  assignmentDeadline: string;
  unitId: string;
  unitName: string;
  studentId: string;
  studentName: string;
  content?: string; // Make optional
  status: string;
  grade: GradeDTO | null;
  teacherFeedback: string | null;
  submittedAt: string;
  isLate: boolean;
  attachments: DocumentDTO[];
  aiAnalysis: AIDetectionResultDTO | null;
  aiSegments?: AISegmentAnalysis[]; // Add this based on logs
  teamId: string | null;
  teamName: string | null;
  isTeamSubmission: boolean;
}

export interface AIDetectionResultDTO {
  analysisId: string;
  submissionId: string;
  aiProbability: string; // Note: different from interface
  aiPercentage: string; // Note: different from interface
  modelUsed: string;
  confidenceLevel: string;
  likelyAI: boolean; // Note: different from interface
  uncertain: boolean;
  likelyHuman: boolean;
  status: string;
  analyzedAt: string;
  errorMessage: string | null;
  detectedSegments: AISegmentAnalysis[]; // Note: different from interface
  metadata: Record<string, any>;
}


export interface QuizSubmissionDTO {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  teacherFeedback: string;
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
  probability: string; // e.g., "0.85" or "85%"
  percentage: string; // e.g., "85" or "85%"
  isLikelyAI: boolean;
  confidenceLevel: string;
  modelUsed: string; // e.g., "GPT-Detector-v2"
  analyzedAt: string; // ISO date string
  // Optional: Add segments for detailed analysis
  segments?: AISegmentAnalysis[];
}

export interface AISegmentAnalysis {
  segmentId?: string;
  text: string;
  startIndex: number;
  endIndex: number;
  aiProbability?: string;  // From your data
  probability?: string;    // Alternative name
  percentage?: string;
  isLikelyAI: boolean;
  reasoning?: string;
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



// Types matching your backend DTOs
interface FrontendDocumentDTO {
  originalFilename: string;
  fileSize?: number;
  mimeType?: string;
  fileHash?: string;
  uploadedUrl?: string; // Cloudinary URL
  extractedText?: string; // For PDFs
}

interface SubmitAssignmentFrontendDTO {
  assignmentId: string;
  studentId: string;
  content: string;
  frontendDocuments?: FrontendDocumentDTO[];
}

interface SubmitTeamAssignmentFrontendDTO {
  assignmentId: string;
  groupId: string;
  studentSenderId: string;
  content: string;
  frontendDocuments?: FrontendDocumentDTO[];
}



/**
 * Process a single file: extract text (if PDF) and upload to Cloudinary
 */
async function processFile(
  file: File,
  folder: string = "assignments"
): Promise<FrontendDocumentDTO> {
  const isPdf = file.type === 'application/pdf';
  
  let extractedText: string | undefined;
  
  // Extract text from PDF if applicable
  if (isPdf) {
    try {
      extractedText = await getPdfContent(file);
      console.log(`Extracted ${extractedText} characters from ${file.name}`);
    } catch (error) {
      console.error(`Failed to extract text from ${file.name}:`, error);
      // Continue without text extraction
    }
  }

  // Upload file to Cloudinary
  const uploadResult = await uploadDocumentFile(file, folder);

  // Create document DTO
  const document: FrontendDocumentDTO = {
    originalFilename: file.name,
    // fileSize: file.size,
    // mimeType: file.type,
    uploadedUrl: uploadResult.url,
    extractedText: extractedText,
  };

  return document;
}

/**
 * Process all attachments in parallel
 */
async function processAttachments(
  attachments: File[],
  assignmentId: string
): Promise<FrontendDocumentDTO[]> {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  const folder = `assignments/${assignmentId}`;
  
  // Process all files in parallel for better performance
  const processedDocuments = await Promise.all(
    attachments.map(file => processFile(file, folder))
  );

  return processedDocuments;
}

/**
 * Maps individual submission to new frontend DTO format
 */
async function mapIndividualSubmissionToFrontendDTO(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
}): Promise<SubmitAssignmentFrontendDTO> {
  
  // Process attachments: extract text and upload
  const frontendDocuments = await processAttachments(
    params.attachments,
    params.assignmentId
  );

  return {
    assignmentId: params.assignmentId,
    studentId: params.studentId,
    content: params.content,
    frontendDocuments: frontendDocuments.length > 0 ? frontendDocuments : undefined,
  };
}

/**
 * Maps team submission to new frontend DTO format
 */
async function mapTeamSubmissionToFrontendDTO(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
  groupId: string;
}): Promise<SubmitTeamAssignmentFrontendDTO> {
  
  // Process attachments: extract text and upload
  const frontendDocuments = await processAttachments(
    params.attachments,
    params.assignmentId
  );

  return {
    assignmentId: params.assignmentId,
    groupId: params.groupId,
    studentSenderId: params.studentId,
    content: params.content,
    frontendDocuments: frontendDocuments.length > 0 ? frontendDocuments : undefined,
  };
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
];

// Mock data for student quizzes
const MOCK_STUDENT_QUIZZES: StudentSubmissionQuiz[] = [
  {
    id: "quiz-2",
    title: "UX Design Fundamentals Quiz",
    maxGrade: 100,
    unitId: "unit-1-1",
    isOverdue: false,
    studentId: "student-001",
    studentName: "Emma Johnson",
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
  id: "quiz-2",
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
const simulateDelay = async (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Flag to enable/disable mocking
const isMockEnabled = false ;

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

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};

// Mappers for backend to frontend types

const mapBackendQuizSubmissionDetailToFrontend = async (
  backendDetail: QuizSubmissionDetailDTO
): Promise<QuizSubmissionDetail> => {
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


// THIS CURRENTLY WORKS

/**
 * Fetch student assignments with submissions only (optimized)
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
    // Only get submissions - they contain all assignment information
    const submissionsResponse = await apiClient.get<SubmissionDTO[]>(
      `/api/submissions/student/${studentId}/course/${courseId}/unit/${unitId}`
    );
    const submissions = submissionsResponse.data;

    console.log(
      "data",
      submissionsResponse.data
    )
    // Convert submissions to SubmissionTask format
    const submissionTasks: SubmissionTask[] = await Promise.all(
      submissions.map((submission) => mapSubmissionToTask(submission))
    );

    return submissionTasks;
  } catch (error) {
    return await handleApiError(error);
  }
}


// THIS CURRENTLY WORKS

/**
 * Fetch student quizzes with submissions only (optimized)
 */
export async function fetchStudentSubmissionsQuizzesItem(
  courseId: CourseId,
  studentId: UserId,
  unitId: string
): Promise<StudenSubmissiontQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(
      `MOCK: Returning student quizzes for course ${courseId}, student ${studentId}, unit ${unitId}`
    );
    return MOCK_STUDENT_QUIZZES.filter((quiz) =>
      quiz.unitId.toLowerCase().includes(unitId.toLowerCase())
    );
  }
  try {
    // Only get quiz submissions - they contain all quiz information
    const submissionsResponse = await apiClient.get<QuizSubmissionDTO[]>(
      `/api/quiz-submissions/student/${studentId}/course/${courseId}/unit/${unitId}/basic`
    );
    const submissions = submissionsResponse.data;

    // Convert submissions to StudentQuiz format
    const studentQuizzes: StudenSubmissiontQuiz[] = submissions.map(
      (submission) => {
        return mapQuizSubmissionToQuiz(submission);
      }
    );

    return studentQuizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}
/**
 * Map SubmissionDTO to SubmissionTask (using only submission data)
 */
export const mapSubmissionToTask = async (submission: SubmissionDTO): Promise<SubmissionTask> => {
  // Parse deadline from submission or use a default
  const deadline = submission.assignmentDeadline || new Date().toISOString();
  const isOverdue = new Date(deadline) < new Date() && 
                    submission.status !== 'GRADED' && 
                    submission.status !== 'RETURNED';

  // Parse max points - use assignmentMaxPoints if available, otherwise default to 100
  const maxPoints = submission.assignmentMaxPoints || 100;

  // Get delivery mode from the correct field
  // The data shows 'deliveryMode' in the log, but interface says 'type'
  // Let's check both
  const deliveryMode = submission.type || submission.deliveryMode || 'INDIVIDUAL';

  // Fix AI analysis mapping - the incoming data uses different field names
  const aiAnalysis = submission.aiAnalysis ? {
    analysisId: submission.aiAnalysis.analysisId,
    probability: submission.aiAnalysis.aiProbability || submission.aiAnalysis.probability,
    percentage: submission.aiAnalysis.aiPercentage || submission.aiAnalysis.percentage,
    isLikelyAI: submission.aiAnalysis.likelyAI || submission.aiAnalysis.isLikelyAI,
    confidenceLevel: submission.aiAnalysis.confidenceLevel,
    modelUsed: submission.aiAnalysis.modelUsed,
    analyzedAt: submission.aiAnalysis.analyzedAt,
    segments: submission.aiSegments || submission.aiAnalysis.segments || submission.aiAnalysis.detectedSegments,
  } : undefined;

  return {
    id: submission.assignmentId,
    name: submission.assignmentTitle,
    studentName: submission.studentName,
    unit: submission.unitName,
    instructions: submission.assignmentInstructions || 'No instructions provided',
    maxPoints: maxPoints,
    deadline: deadline,
    isOverdue: isOverdue,
    deliveryMode: deliveryMode as deliveryMode, // Cast to the enum type
    submission: {
      id: submission.id,
      content: submission.content || '',
      submittedAt: submission.submittedAt,
      status: submission.status,
      grade: submission.grade ? {
        value: submission.grade.value,
        maxScore: parseInt(submission.grade.maxScore) || maxPoints,
      } : undefined,
      teacherFeedback: submission.teacherFeedback || undefined,
      attachments: submission.attachments?.map((att) => ({
        name: att.name,
        storagePath: att.storagePath,
      })) || [],
      aiAnalysis: aiAnalysis,
      isTeamSubmission: submission.isTeamSubmission,
      teamName: submission.teamName || undefined,
    },
  };
};


/**
 * Map QuizSubmissionDTO to StudentQuiz (using only submission data)
 */
const mapQuizSubmissionToQuiz = (
  submission: QuizSubmissionDTO
): StudentSubmissionQuiz => {
  const isOverdue = submission.status !== "GRADED";

  return {
    id: submission.quizId, // Use quizId as quiz ID
    title: submission.quizTitle,
    maxGrade: submission.grade ? parseInt(submission.grade.maxScore) : 100,
    isOverdue,
    studentId: submission.studentId,
  unitId: "",
    studentName: submission.studentName,
    submission: {
      id: submission.id,
      status: submission.status,
      submittedAt: submission.submittedAt,
      grade: submission.grade
        ? {
            value: parseInt(submission.grade.value),
            maxScore: parseInt(submission.grade.maxScore),
          }
        : undefined,
      // teacherFeedback: submission.teacherFeedback, // Quiz submissions might not have direct teacher feedback
    },
  };
};

// /**
//  * Fetch student quizzes with submissions only (optimized)
//  */
// export async function fetchStudentSubmissionsQuizzesItem(
//   courseId: CourseId,
//   studentId: UserId,
//   unitId: string
// ): Promise<StudentQuiz[]> {
//   if (isMockEnabled) {
//     await simulateDelay();
//     console.log(`MOCK: Returning student quizzes for course ${courseId}, student ${studentId}, unit ${unitId}`);
//     return MOCK_STUDENT_QUIZZES.filter(quiz =>
//       quiz.title.toLowerCase().includes(unitId.toLowerCase())
//     );
//   }
//   try {
//     // Only get quiz submissions - they contain all quiz information
//     const submissionsResponse = await apiClient.get<QuizSubmissionDTO[]>(
//       `/api/quiz-submissions/student/${studentId}/course/${courseId}/unit/${unitId}`
//     );
//     const submissions = submissionsResponse.data;

//     // Convert submissions to StudentQuiz format
//     const studentQuizzes: StudentQuiz[] = submissions.map(submission => {
//       return mapQuizSubmissionToQuiz(submission);
//     });

//     return studentQuizzes;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

/**
 * Fetch detailed quiz submission
 */

// CURRENTLY WORK

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
    const detail = await mapBackendQuizSubmissionDetailToFrontend(response.data);
    return detail;
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================

// TEACHER
// THIS CURRENTLY WORKS

export async function fetchTeacherSubmissionsItem(
  courseId: CourseId,
  unitId: UnitId
): Promise<SubmissionTask[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning student assignments for course ${courseId} `);
    return MOCK_STUDENT_ASSIGNMENTS;
  }
  try {
    // Only get submissions - they contain all assignment information
    const submissionsResponse = await apiClient.get<SubmissionDTO[]>(
      `/api/submissions/course/${courseId}/unit/${unitId}`
    );

    console.log("data", submissionsResponse.data)
    const submissions = submissionsResponse.data;

    // Convert submissions to SubmissionTask format
    const submissionTasks: SubmissionTask[] = await Promise.all(
      submissions.map((submission) => mapSubmissionToTask(submission))
    );

    console.log("data", submissionTasks);

    return submissionTasks;
  } catch (error) {
    return await handleApiError(error);
  }
}



// export async function updateSubmissionGrade(
//   submissionId: string,
//   gradeData: { 
//     grade: number; 
//     feedback: string;
//     maxScore?: number;
//   }
// ): Promise<SubmissionDetailData> {
//   try {
//     // Create the command matching backend DTO
//     const command: GradeSubmissionCommand = {
//       submissionId: submissionId,
//       gradeValue: gradeData.grade.toString(),
//       maxScore: gradeData.maxScore?.toString() || "100", // Default to 100 if not provided
//       feedback: gradeData.feedback || ""
//     };

//     // Call backend grading endpoint
//     const gradeResponse = await apiClient.put<SuccessResponseDTO>(
//       `/api/submissions/${submissionId}/grade`,
//       command
//     );

//     console.log("Grading response:", gradeResponse.data);

//     // Fetch updated submission details
//     return await fetchSubmissionDetail(submissionId);
//   } catch (error) {
//     return await handleApiError(error);
//   }
// }



// /**
//  * Fetch student assignments with basic information
//  */
// export async function fetchTeacherSubmissionsItem(
//   courseId: CourseId,
//   unitId: UnitId
// ): Promise<SubmissionTask[]> {
//   if (isMockEnabled) {
//     await simulateDelay();
//     console.log(`MOCK: Returning student assignments for course ${courseId}`);
//     return MOCK_STUDENT_ASSIGNMENTS;
//   }

//   try {
//     // Get assignments for the specific unit
//     const assignmentsResponse = await apiClient.get<AssignmentDTO[]>(
//       `/api/assignments/course/${courseId}/unit/${unitId}`
//     );
//     const assignments = assignmentsResponse.data;

//     // Get submissions for the student in this course and unit
//     const submissionsResponse = await apiClient.get<SubmissionDTO[]>(
//       `/api/submissions/course/${courseId}/unit/${unitId}`
//     );
//     const submissions = submissionsResponse.data;

//     // Combine assignments with submissions
//     const SubmissionTasks: SubmissionTask[] = assignments.map((assignment) => {
//       const submission = submissions.find(
//         (sub) => sub.assignmentId === assignment.id
//       );
//       return mapBackendAssignmentToFrontend(assignment, submission);
//     });

//     return SubmissionTasks;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

/**
 * Fetch student quizzes with basic information
 */
// THIS CURRENTLY WORKS

export async function fetchTeacherSubmissionsQuizzesItem(
  courseId: CourseId,
  unitId: string
): Promise<StudentSubmissionQuiz[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(
      `MOCK: Returning  quizzes for course ${courseId},  unit ${unitId}`
    );
    // Filter mock data by unit (in real scenario, backend would filter)
    return MOCK_STUDENT_QUIZZES.filter((quiz) =>
      quiz.unitId === unitId
    );
  }

  try {
    // // Get quizzes for the course (you might need a unit-specific endpoint)
    // const quizzesResponse = await apiClient.get<QuizDTO[]>(
    //   `/api/quizzes/course/${courseId}/basic`
    // );
    // const quizzes = quizzesResponse.data;

    // // Filter quizzes by unit (assuming quiz has unitId property)
    // const unitQuizzes = quizzes.filter(
    //   (quiz) => (quiz as any).unitId === unitId // Adjust based on your actual quiz DTO structure
    // );
  

    // Get quiz submissions for the student in this course and unit
    const submissionsResponse = await apiClient.get<QuizSubmissionDTO[]>(
      `/api/quiz-submissions/course/${courseId}/unit/${unitId}/basic`
    );
    const submissions = submissionsResponse.data;

    // Combine quizzes with submissions
    const studentQuizzes: StudentSubmissionQuiz[] = submissions.map(
      (submission) => {
        return mapQuizSubmissionToQuiz(submission);
      }
    );
    return studentQuizzes;
  } catch (error) {
    return await handleApiError(error);
  }
}

// ============================================

const MOCK_TASK_SUBMISSIONS: SubmissionCompleteIa[] = [
  {
    id: "sub-task-1",
    assignmentId: "task-1",
    courseID: "crs-101",
    studentId: "student-001",
    iaResult: null,
    type:  "TEAM",
    deliveryMode: "TEAM",
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
    grade: { value: "90", maxScore: "100" },
    teacherFeedback: "Good work! Well structured and detailed.",
  },
];


const MOCK_TASK_SUBMISSIONS_2: SubmissionBasicDTO[] = [
  {
    id: "sub-task-1",
    assignmentId: "task-1",
    studentId: "student-001",
    assignmentTitle: "Assignment Title",
    gradeMaxScore: "100",
    gradeValue: "90",
    isTeamSubmission: false,
    studentName: "Emma Johnson",
    teamId: "",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "SUBMITTED",
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
async function mapSubmissionFromBackend(dto: SubmissionDTO): Promise<SubmissionCompleteIa> {
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
    content: dto.content || "",
    type: dto.type as deliveryMode,
    attachments: dto.attachments.map((att) => ({
      name: att.name,
      storagePath: att.storagePath,
      createdAt: dto.submittedAt,
    })),
    deliveryMode: dto.type as deliveryMode,
    iaResult: null,
    studentName: dto.studentName,
    submittedAt: dto.submittedAt,
    status: dto.status,
    grade: mappedGrade,
    teacherFeedback: dto.teacherFeedback,
  };
}

// /**
//  * Maps backend QuizSubmissionDTO to frontend SubmissionQuiz entity
//  */
// async function mapQuizSubmissionFromBackend(dto: QuizSubmissionDTO): Promise<SubmissionQuiz> {
//   return {
//     id: dto.id,
//     courseId: dto.quizId, // Using quizId as fallback
//     quizId: dto.quizId,
//     studentId: dto.studentId,
//     studentName: dto.studentName,
//     content: JSON.stringify(dto.answers),
//     status: dto.status as  SubmissionStatus,
//     submittedAt: dto.submittedAt,
//     grade: dto.grade
//       ? {
//           value: parseFloat(dto.grade.value),
//           maxScore: parseFloat(dto.grade.maxScore),
//         }
//       : null,
//     teacherFeedback: "", // Quiz submissions might not have direct feedback
//     quizData: {
//       answers: dto.answers.map((answer) => ({
//         questionId: answer.questionId,
//         questionText: answer.questionText,
//         questionType: "multiple-choice", // Default type
//         studentAnswer:
//           answer.selectedOptions.length > 0
//             ? answer.selectedOptions[0]
//             : answer.textAnswer,
//         correctAnswer: answer.correct ? "Correct" : "Incorrect",
//         points: answer.pointsEarned,
//         maxPoints: answer.pointsEarned, // Assuming 1:1 ratio
//         isCorrect: answer.correct,
//         feedback: "",
//       })),
//       timeSpent: 0, // Calculate from startedAt/submittedAt if needed
//       totalScore: dto.grade ? parseFloat(dto.grade.value) : 0,
//       maxScore: dto.grade ? parseFloat(dto.grade.maxScore) : 0,
//     },
//   };
// }


// /**
//  * Maps backend QuizSubmissionDTO to frontend SubmissionQuiz entity
//  */
// async function mapQuizSubmissionFromBackendSubmission(dto: any): Promise<SubmissionQuiz> {
//   console.log("Mapping quiz submission from backend DTO:", JSON.stringify(dto, null, 2));
  
//   // Extract answers from questionResponses
//   const answers = dto.questionResponses?.map((response: any) => {
//     console.log("Processing response:", JSON.stringify(response, null, 2));
    
//     // Determine student answer based on question type
//     let studentAnswer: string | number;
//     if (response.questionType === 'MULTIPLE_CHOICE') {
//       // For multiple choice, selectedOptions is an array, take first item
//       studentAnswer = response.selectedOptions?.[0] ?? -1;
//     } else {
//       // For open-ended, use textAnswer
//       studentAnswer = response.textAnswer || '';
//     }
    
//     // Determine correct answer based on question type
//     let correctAnswer: string | number | undefined;
//     if (response.questionType === 'MULTIPLE_CHOICE') {
//       // For multiple choice, find which option matches correctAnswer string
//       const correctOptionIndex = response.options?.findIndex((opt: any) => 
//         opt.text === response.correctAnswer || 
//         opt.text?.trim() === response.correctAnswer?.trim()
//       );
//       correctAnswer = correctOptionIndex !== undefined && correctOptionIndex >= 0 
//         ? correctOptionIndex 
//         : undefined;
//     } else {
//       // For open-ended, use correctAnswer string
//       correctAnswer = response.correctAnswer;
//     }
    
//     return {
//       questionId: response.questionId,
//       questionText: response.questionText,
//       questionType: response.questionType.toLowerCase() as 'multiple-choice' | 'open-ended',
//       studentAnswer: studentAnswer,
//       correctAnswer: correctAnswer,
//       points: response.isCorrect ? response.points : 0,
//       maxPoints: response.points,
//       isCorrect: response.isCorrect,
//       feedback: "",
//     };
//   }) || [];

//   // Calculate total score
//   const totalScore = answers.reduce((sum: number, ans: any) => sum + ans.points, 0);
//   const maxScore = answers.reduce((sum: number, ans: any) => sum + ans.maxPoints, 0);

//   // Calculate time spent if we have startedAt and submittedAt
//   let timeSpent = 0;
//   if (dto.startedAt && dto.submittedAt) {
//     const started = new Date(dto.startedAt).getTime();
//     const submitted = new Date(dto.submittedAt).getTime();
//     timeSpent = Math.max(0, submitted - started) / 1000; // Convert to seconds
//   }

//   const submission: SubmissionQuiz = {
//     id: dto.id,
//     courseId: dto.unitId || dto.quizId, // Use unitId if available
//     quizId: dto.quizId,
//     studentId: dto.studentId,
//     studentName: dto.studentName || 'Student',
//     content: JSON.stringify(answers),
//     submittedAt: dto.submittedAt,
//     status: dto.status as SubmissionStatus || 'SUBMITTED',
//     grade: dto.grade ? {
//       value: parseFloat(dto.grade.value?.toString() || '0'),
//       maxScore: parseFloat(dto.grade.maxScore?.toString() || maxScore.toString()),
//     } : {
//       value: totalScore,
//       maxScore: maxScore,
//     },
//     teacherFeedback: dto.feedback || '',
//     quizData: {
//       answers: answers,
//       timeSpent: Math.round(timeSpent),
//       totalScore: totalScore,
//       maxScore: maxScore,
//     },
//   };

//   console.log("Mapped submission:", JSON.stringify(submission, null, 2));
//   return submission;
// }

/**
 * Maps backend QuizSubmissionDetailDTO to frontend SubmissionQuiz entity
 */
async function mapQuizSubmissionDetailFromBackend(
  dto: QuizSubmissionDetailDTO
): Promise<SubmissionQuiz> {
  return {
    id: dto.id,
    courseId: dto.quizId,
    quizId: dto.quizId,
    studentId: dto.studentId,
    studentName: dto.studentName,
    content: JSON.stringify(dto.questionResponses),
    status: dto.status as  SubmissionStatus,
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
        questionType: response.questionType .toLowerCase() as QuestionType,
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

/**
 * Maps quiz answers to backend SubmitQuizWithAnswersCommand
 */
async function mapQuizAnswersToBackendCommand(
  quizId: string,
  studentId: string,
  answers: Record<string, any>, // Change from QuizAnswers to more flexible type
  timeSpent?: number
): Promise<SubmitQuizWithAnswersCommand> {
  const backendAnswers: { [questionId: string]: QuizAnswerData } = {};

  Object.entries(answers).forEach(([questionId, answerData]) => {
    // Handle different possible structures
    let selectedOptions: number[] = [];
    let textAnswer = '';
    const questionType = answerData.questionType || answerData.type;
    
    if (questionType === "multiple-choice") {
      // Handle either answer or studentAnswer field
      const answer = answerData.studentAnswer !== undefined ? answerData.studentAnswer : answerData.answer;
      selectedOptions = [Number(answer)];
    } else if (questionType === "open-ended") {
      // Handle either answer or studentAnswer field
      const answer = answerData.studentAnswer !== undefined ? answerData.studentAnswer : answerData.answer;
      textAnswer = String(answer || '');
    }

    backendAnswers[questionId] = {
      selectedOptions,
      textAnswer,
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
async function mapGradingToBackendCommand(
  submissionId: string,
  gradeValue: string,
  maxScore: string,
  feedback: string
): Promise<GradeSubmissionCommand> {
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
async function mapQuizGradingToBackendCommand(
  quizSubmissionId: string,
  earnedPoints: number,
  totalPoints: number
): Promise<GradeQuizSubmissionCommand> {
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
// THIS CURRENTLY WORKS

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
    const submissions = await Promise.all(response.data.map(dto => mapSubmissionFromBackend(dto)));
    return (
      submissions.find(
        (s: SubmissionCompleteIa) => s.assignmentId === assignmentId
      ) || null
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return await handleApiError(error);
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
    const submission = await mapQuizSubmissionDetailFromBackend(response.data);
    return submission;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Submit task with explicit type (useful when you already know the assignment type)
 */

/**
 * Maps individual submission parameters to backend command
 */
async function mapIndividualSubmissionToBackendCommand(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
}): Promise<FormData> {
  const formData = new FormData();

  formData.append("assignmentId", params.assignmentId);
  formData.append("studentId", params.studentId);
  formData.append("content", params.content);

  // Append attachments if any
  params.attachments.forEach((file, index) => {
    formData.append("attachments", file);
  });

  return formData;
}

/**
 * Maps team submission parameters to backend command
 */
async function mapTeamSubmissionToBackendCommand(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
  groupId: string;
}): Promise<FormData> {
  const formData = new FormData();

  formData.append("assignmentId", params.assignmentId);
  formData.append("groupId", params.groupId);
  formData.append("studentSenderId", params.studentId);
  formData.append("content", params.content);

  // Append attachments if any
  params.attachments.forEach((file, index) => {
    formData.append("attachments", file);
  });

  return formData;
}


// CURRENTLY WORKS
/**
 * Submit task with new frontend processing flow
 */
export async function submitTask(params: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: File[];
  submissionType: "INDIVIDUAL" | "TEAM";
  groupId?: string;
}): Promise<SubmissionCompleteIa> {
  // Validate parameters
  if (params.submissionType === "TEAM" && !params.groupId) {
    throw new Error("Group ID is required for team submissions");
  }

  try {
    console.log("Processing submission with frontend extraction", params);
    let response;

    if (params.submissionType === "TEAM") {
      // Map to team frontend DTO
      const frontendDTO = await mapTeamSubmissionToFrontendDTO({
        ...params,
        groupId: params.groupId!,
      });

      // Call new team frontend endpoint
      response = await apiClient.post<SubmissionDTO>(
        `/api/submissions/team/frontend`,
        frontendDTO,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Map to individual frontend DTO
      const frontendDTO = await mapIndividualSubmissionToFrontendDTO(params);

      // Call new individual frontend endpoint
      response = await apiClient.post<SubmissionDTO>(
        `/api/submissions/individual/frontend`,
        frontendDTO,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const submission = await mapSubmissionFromBackend(response.data);
    return submission;
   
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Submit a quiz
 */

// CURRENTLY WORKS

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

    console.log("Submitting answers to backend..." , params.answers);
    const backendCommand: SubmitQuizWithAnswersCommand =
      await mapQuizAnswersToBackendCommand(
        params.quizId,
        params.studentId,
        params.answers,
        params.timeSpent
      );

      console.log("backendCommand", backendCommand);

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/quiz-submissions/submit-with-answers`,
      backendCommand
    );

    console.log("Quiz submission response:", response.data);

    // Assuming the response contains the submission ID, we need to fetch the full submission
   
      const mockSubmission: SubmissionQuiz = {
      id: `sub-quiz-${Date.now()}`,
      quizId: params.quizId,
      studentId: params.studentId,
      courseId: "course_001", // You might need to get this from context
      studentName: "Current Student",
      content: JSON.stringify(params.answers),
      submittedAt: new Date().toISOString(),
      status: "SUBMITTED",
      grade: { value: 85, maxScore: 100 }, // Example score
      teacherFeedback: null,
      quizData: {
        answers: [], // You could map the answers here if needed
        timeSpent: params.timeSpent || 0,
        totalScore: 85,
        maxScore: 100,
      },
    };

    console.log("Returning mock submission (API call skipped):", mockSubmission);
    return mockSubmission;
  } catch (error) {
    return await handleApiError(error);
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
): Promise<SubmissionCompleteIa> {
  if (isMockEnabled) {
    await simulateDelay(600);

    const index = MOCK_TASK_SUBMISSIONS.findIndex(
      (sub) => sub.id === submissionId
    );
    if (index !== -1) {
      MOCK_TASK_SUBMISSIONS[index].grade = {
        value: gradeValue ,
        maxScore: maxScore,
      };
      MOCK_TASK_SUBMISSIONS[index].teacherFeedback = feedback;
      MOCK_TASK_SUBMISSIONS[index].status = "GRADED";

      console.log("MOCK: Graded submission", MOCK_TASK_SUBMISSIONS[index]);
      return MOCK_TASK_SUBMISSIONS[index];
    }
    throw new Error(`Submission not found: ${submissionId}`);
  }

  try {
    const gradingCommand: GradeSubmissionCommand = await mapGradingToBackendCommand(
      submissionId,
      gradeValue,
      maxScore,
      feedback
    );

    const response = await apiClient.put<SubmissionDTO>(
      `/api/submissions/${submissionId}/grade`,
      gradingCommand
    );

    // Fetch the updated submission
    const submission = await mapSubmissionFromBackend(response.data);
    return submission;
  } catch (error) {
    return await handleApiError(error);
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

    return MOCK_TASK_SUBMISSIONS_2.map((sub) => ({
      id: sub.id,
      assignmentId: sub.assignmentId,
      assignmentTitle: "Assignment Title",
      studentId: sub.studentId,
      studentName: "Student Name",
      status: sub.status,
      submittedAt: sub.submittedAt,
      gradeMaxScore: sub.gradeMaxScore,
      gradeValue: sub.gradeValue,
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
    return await handleApiError(error);
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
    return await handleApiError(error);
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
    return await handleApiError(error);
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
    return await handleApiError(error);
  }
}






// ============================================
// UPDATED BACKEND DTO TYPES FOR STUDENT VIEW
// ============================================

export interface GradedQuestionResponseDTO {
  questionId: string;
  questionText: string;
  questionType: string;
  maxPoints: number;
  earnedPoints: number; // Points earned for this specific question
  teacherFeedback: string; // Teacher's feedback (optional)
  isAutoGraded: boolean; // Whether this was auto-graded
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizSubmissionDetailForStudentDTO {
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
  questionResponses: GradedQuestionResponseDTO[];
  timeExpired: boolean;
  unitId: string;
  unitName: string;
}

// ============================================
// FRONTEND TYPES FOR STUDENT VIEW
// ============================================

export interface StudentQuizSubmissionDetail {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string;
  status: string;
  grade: {
    value: string;
    maxScore: string;
    percentage: string;
  } | null;
  autoGraded: boolean;
  questionResponses: StudentGradedQuestionResponse[];
  timeExpired: boolean;
  unitId: string;
  unitName: string;
}

export interface StudentGradedQuestionResponse {
  questionId: string;
  questionText: string;
  questionType: string;
  maxPoints: number;
  earnedPoints: number;
  teacherFeedback: string;
  isAutoGraded: boolean;
  options: QuestionOptionDTO[];
  selectedOptions: number[];
  textAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

// ============================================
// MAPPER - BACKEND TO FRONTEND (STUDENT VIEW)
// ============================================

async function mapBackendQuizSubmissionDetailToStudentFrontend(
  dto: QuizSubmissionDetailForStudentDTO
): Promise<SubmissionQuiz> {
  // Calculate time spent
  let timeSpent = 0;
  if (dto.startedAt && dto.submittedAt) {
    const started = new Date(dto.startedAt).getTime();
    const submitted = new Date(dto.submittedAt).getTime();
    timeSpent = Math.max(0, submitted - started) / 1000; // Convert to seconds
  }

  // Map question responses to quiz answers
  const answers: QuizAnswer[] = dto.questionResponses.map(qr => ({
    questionId: qr.questionId,
    questionText: qr.questionText,
    questionType: qr.questionType.toLowerCase() as 'multiple-choice' | 'open-ended',
    studentAnswer: qr.questionType === 'MULTIPLE_CHOICE' 
      ? (qr.selectedOptions?.[0] ?? -1)
      : qr.textAnswer || '',
    correctAnswer: qr.questionType === 'MULTIPLE_CHOICE'
      ? qr.correctAnswer
      : qr.correctAnswer,
    points: qr.earnedPoints,
    maxPoints: qr.maxPoints,
    isCorrect: qr.isCorrect,
    feedback: qr.teacherFeedback || '',
  }));

  // Calculate total score
  const totalScore = answers.reduce((sum, ans) => sum + ans.points, 0);
  const maxScore = answers.reduce((sum, ans) => sum + ans.maxPoints, 0);

  return {
    id: dto.id,
    quizId: dto.quizId,
    studentId: dto.studentId,
    courseId: dto.unitId || dto.quizId,
    studentName: dto.studentName,
    content: JSON.stringify(answers),
    submittedAt: dto.submittedAt,
    status: dto.status as SubmissionStatus,
    grade: dto.grade ? {
      value: parseFloat(dto.grade.value),
      maxScore: parseFloat(dto.grade.maxScore),
    } : {
      value: totalScore,
      maxScore: maxScore,
    },
    teacherFeedback: '', // Overall feedback if available
    quizData: {
      answers: answers,
      timeSpent: Math.round(timeSpent),
      totalScore: totalScore,
      maxScore: maxScore,
    },
  };
}

// ============================================
// UPDATED API FUNCTION FOR STUDENT QUIZ SUBMISSION
// ============================================

/**
 * Get student's existing quiz submission with graded details
 */


// THIS CURRENTLY WORKS
export async function getStudentQuizSubmission(
  quizId: string,
  studentId: string
): Promise<SubmissionQuiz | null> {
  // if (isMockEnabled) {
  //   await simulateDelay();

  //   const mockSubmission: SubmissionQuiz = {
  //     id: 'sub-quiz-mock',
  //     quizId: quizId,
  //     studentId: studentId,
  //     courseId: 'course-001',
  //     studentName: 'Student Name',
  //     content: JSON.stringify([]),
  //     submittedAt: new Date().toISOString(),
  //     status: 'GRADED',
  //     grade: {
  //       value: 85,
  //       maxScore: 100,
  //     },
  //     teacherFeedback: 'Good work overall!',
  //     quizData: {
  //       answers: [
  //         {
  //           questionId: 'q1',
  //           questionText: 'What is the capital of France?',
  //           questionType: 'multiple-choice',
  //           studentAnswer: 0,
  //           correctAnswer: '0',
  //           points: 10,
  //           maxPoints: 10,
  //           isCorrect: true,
  //           feedback: 'Correct!',
  //         },
  //         {
  //           questionId: 'q2',
  //           questionText: 'Explain the concept of gravity.',
  //           questionType: 'open-ended',
  //           studentAnswer: 'Gravity is a force that attracts objects.',
  //           correctAnswer: 'Gravity is a fundamental force of nature.',
  //           points: 7,
  //           maxPoints: 10,
  //           isCorrect: false,
  //           feedback: 'Good answer, but could be more detailed.',
  //         },
  //       ],
  //       timeSpent: 900, // 15 minutes
  //       totalScore: 17,
  //       maxScore: 20,
  //     },
  //   };

  //   return mockSubmission;
  // }


  try {

      console.log(
    `Getting quiz submission for quiz ${quizId}, student ${studentId}`
  )
    const response = await apiClient.get<QuizSubmissionDetailForStudentDTO>(
      `/api/quiz-submissions/quiz/${quizId}/student/${studentId}/detail`
    );
    console.log("Quiz submission response:", response.data);
    const submission = await mapBackendQuizSubmissionDetailToStudentFrontend(response.data);
    console.log("Mapped quiz submission:", submission);
    return submission;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    return await handleApiError(error);
  }
}

// ============================================
// MOCK DATA FOR TESTING
// ============================================

const MOCK_STUDENT_QUIZ_SUBMISSION: SubmissionQuiz = {
  id: 'sub-quiz-2-emma',
  quizId: 'quiz-2',
  studentId: 'student-001',
  courseId: 'crs-101',
  studentName: 'Emma Johnson',
  content: JSON.stringify([]),
  submittedAt: '2024-03-21T10:15:00Z',
  status: 'GRADED',
  grade: {
    value: 85,
    maxScore: 100,
  },
  teacherFeedback: 'Excellent understanding of the concepts.',
  quizData: {
    answers: [
      {
        questionId: 'q-101-1',
        questionText: 'What does UCD stand for in design?',
        questionType: 'multiple-choice',
        studentAnswer: 0,
        correctAnswer: '0',
        points: 10,
        maxPoints: 10,
        isCorrect: true,
        feedback: 'Correct!',
      },
      {
        questionId: 'q-101-2',
        questionText: 'Which of the following is NOT a key principle of UX design?',
        questionType: 'multiple-choice',
        studentAnswer: 1,
        correctAnswer: '2',
        points: 0,
        maxPoints: 10,
        isCorrect: false,
        feedback: 'Incorrect. The correct answer is Complex Navigation.',
      },
      {
        questionId: 'q-101-3',
        questionText: 'Explain the importance of user research in the design process.',
        questionType: 'open-ended',
        studentAnswer: 'User research helps understand what users need and want.',
        correctAnswer: 'User research helps designers understand user needs, behaviors, and pain points, ensuring the final product meets real user requirements rather than assumptions.',
        points: 15,
        maxPoints: 20,
        isCorrect: false,
        feedback: 'Good answer, but could provide more specific examples about how user research informs design decisions.',
      },
    ],
    timeSpent: 900, // 15 minutes
    totalScore: 25,
    maxScore: 40,
  },
};