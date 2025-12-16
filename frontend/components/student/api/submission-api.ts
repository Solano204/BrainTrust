// // File: src/app/features/submissions/api/submission-api.ts
// "use server";

// import { Submission, SubmissionQuiz, QuizAnswers } from "@/app/domain/entities/CourseEntities";
// import { AssignmentId, CourseId, UserId, SubmissionId } from "@/app/domain/valueObjects";
// import axios from "axios";
// import { cookies } from "next/headers";

// // ============================================
// // CONFIGURATION
// // ============================================
// const isMockEnabled = true; // ⚙️ TOGGLE SWITCH

// // ============================================
// // MOCK DATA
// // ============================================


// // File: src/app/infraestructure/api/types/submission-types.ts
// "use server";

// // ============================================
// // BACKEND DTO TYPES
// // ============================================

// export interface SubmissionDTO {
//   id: string;
//   assignmentId: string;
//   assignmentTitle: string;
//   studentId: string;
//   studentName: string;
//   content: string;
//   status: string; // DRAFT, SUBMITTED, GRADED, RETURNED
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

// export interface QuizSubmissionDTO {
//   id: string;
//   quizId: string;
//   quizTitle: string;
//   studentId: string;
//   studentName: string;
//   attemptNumber: number;
//   startedAt: string;
//   submittedAt: string;
//   status: string;
//   grade: GradeDTO;
//   autoGraded: boolean;
//   answers: QuizAnswerDTO[];
//   timeExpired: boolean;
// }

// export interface QuizSubmissionDetailDTO {
//   id: string;
//   quizId: string;
//   quizTitle: string;
//   studentId: string;
//   studentName: string;
//   attemptNumber: number;
//   startedAt: string;
//   submittedAt: string;
//   status: string;
//   grade: GradeDTO;
//   autoGraded: boolean;
//   questionResponses: QuestionResponseDTO[];
//   timeExpired: boolean;
// }

// export interface QuizSubmissionBasicDTO {
//   id: string;
//   quizId: string;
//   quizTitle: string;
//   studentId: string;
//   studentName: string;
//   status: string;
//   submittedAt: string;
//   attemptNumber: number;
// }

// export interface SubmissionBasicDTO {
//   id: string;
//   assignmentId: string;
//   assignmentTitle: string;
//   studentId: string;
//   studentName: string;
//   status: string;
//   submittedAt: string;
//   gradeValue: string;
//   gradeMaxScore: string;
//   isTeamSubmission: boolean;
//   teamId: string;
// }

// export interface GradeDTO {
//   value: string;
//   maxScore: string;
//   percentage: string;
// }

// export interface DocumentDTO {
//   name: string;
//   storagePath: string;
// }

// export interface AIDetectionResultDTO {
//   analysisId: string;
//   probability: string;
//   percentage: string;
//   isLikelyAI: boolean;
//   confidenceLevel: string;
//   modelUsed: string;
//   analyzedAt: string;
// }

// export interface QuizAnswerDTO {
//   questionId: string;
//   questionText: string;
//   selectedOptions: number[];
//   textAnswer: string;
//   correct: boolean;
//   pointsEarned: number;
// }

// export interface QuestionResponseDTO {
//   questionId: string;
//   questionText: string;
//   questionType: string;
//   points: number;
//   options: QuestionOptionDTO[];
//   selectedOptions: number[];
//   textAnswer: string;
//   correctAnswer: string;
//   isCorrect: boolean;
// }

// export interface QuestionOptionDTO {
//   text: string;
//   correct: boolean;
// }

// // ============================================
// // BACKEND COMMAND TYPES
// // ============================================

// export interface SubmitAssignmentCommand {
//   assignmentId: string;
//   studentId: string;
//   content: string;
//   attachments: File[];
// }

// export interface SubmitTeamAssignmentCommand {
//   assignmentId: string;
//   groupId: string;
//   studentSenderId: string;
//   content: string;
//   attachments: File[];
// }

// export interface GradeSubmissionCommand {
//   submissionId: string;
//   gradeValue: string;
//   maxScore: string;
//   feedback: string;
// }

// export interface SubmitQuizWithAnswersCommand {
//   quizId: string;
//   studentId: string;
//   answers: { [questionId: string]: QuizAnswerData };
// }

// export interface QuizAnswerData {
//   selectedOptions: number[];
//   textAnswer: string;
//   timeSpentSeconds: number;
// }

// export interface GradeQuizSubmissionCommand {
//   quizSubmissionId: string;
//   earnedPoints: number;
//   totalPoints: number;
// }

// // ============================================
// // RESPONSE TYPES
// // ============================================

// export interface SuccessResponseDTO {
//   success: boolean;
//   message: string;
//   data: any;
// }

// export interface SubmissionAnalyticsDTO {
//   totalSubmissions: number;
//   gradedSubmissions: number;
//   averageGrade: number;
//   lateSubmissions: number;
//   submissionRate: number;
// }


// const MOCK_TASK_SUBMISSIONS: Submission[] = [
//   {
//     id: "sub-task-1",
//     assignmentId: "task-1",
//     courseID: "crs-101",
//     studentId: "student-001",
//     content: "This is my completed assignment submission with detailed explanations.",
//     type: "INDIVIDUAL",
//     attachments: [
//       {
//         name: "assignment.pdf",
//         storagePath: "/assignments/sub-task-1/assignment.pdf",
//         createdAt: "2024-01-15T10:30:00Z",
//       },
//     ],
//     submittedAt: "2024-01-15T10:30:00Z",
//     status: "SUBMITTED",
//     grade: { value: 85, maxScore: 100 },
//     teacherFeedback: "Good work! Well structured and detailed.",
//   },
// ];

// const MOCK_QUIZ_SUBMISSIONS: SubmissionQuiz[] = [
//   {
//     id: "sub-quiz-1",
//     courseId: "crs-101",
//     quizId: "quiz-1",
//     studentId: "student-001",
//     studentName: "Emma Johnson",
//     content: "Quiz submission for UX Design Fundamentals",
//     status: "GRADED",
//     submittedAt: "2024-01-16T14:20:00Z",
//     grade: { value: 70, maxScore: 100 },
//     teacherFeedback: "Check question 2 - the correct answer was Complex Navigation.",
//     quizData: {
//       answers: [
//         {
//           questionId: "q-101-1",
//           questionText: "What does UCD stand for in design?",
//           questionType: "multiple-choice",
//           studentAnswer: 0,
//           correctAnswer: 0,
//           points: 10,
//           maxPoints: 10,
//           isCorrect: true,
//           feedback: "Correct!",
//         },
//       ],
//       timeSpent: 28,
//       totalScore: 70,
//       maxScore: 100,
//     },
//   },
// ];

// // ============================================
// // API CLIENT SETUP
// // ============================================
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// apiClient.interceptors.request.use(
//   async (config) => {
//     const token = (await cookies()).get("session")?.value;
//     if (token) config.headers["Authorization"] = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ============================================
// // MAPPERS
// // ============================================

// /**
//  * Maps backend SubmissionDTO to frontend Submission entity
//  */
// function mapSubmissionFromBackend(dto: any): Submission {
//   return {
//     id: dto.id,
//     assignmentId: dto.assignmentId,
//     courseID: dto.courseId || "unknown",
//     studentId: dto.studentId,
//     type: dto.type,
//     content: dto.content,
//     attachments: dto.attachments || [],
//     submittedAt: dto.submittedAt,
//     status: dto.status,
//     grade: dto.grade ? {
//       value: parseFloat(dto.grade.value),
//       maxScore: parseFloat(dto.grade.maxScore)
//     } : null,
//     teacherFeedback: dto.teacherFeedback,
//   };
// }

// /**
//  * Maps backend QuizSubmissionDTO to frontend SubmissionQuiz entity
//  */
// function mapQuizSubmissionFromBackend(dto: any): SubmissionQuiz {
//   return {
//     id: dto.id,
//     courseId: dto.courseId || "unknown",
//     quizId: dto.quizId,
//     studentId: dto.studentId,
//     studentName: dto.studentName,
//     content: dto.content,
//     status: dto.status,
//     submittedAt: dto.submittedAt,
//     grade: dto.grade ? {
//       value: dto.grade.value,
//       maxScore: dto.grade.maxScore
//     } : null,
//     teacherFeedback: dto.teacherFeedback,
//     quizData: dto.quizData ? {
//       answers: dto.quizData.answers || [],
//       timeSpent: dto.quizData.timeSpent || 0,
//       totalScore: dto.quizData.totalScore || 0,
//       maxScore: dto.quizData.maxScore || 0
//     } : undefined
//   };
// }

// /**
//  * Maps frontend submission data to backend SubmitAssignmentCommand
//  */
// function mapSubmissionToBackend(data: {
//   assignmentId: string;
//   studentId: string;
//   content: string;
//   attachments: File[];
// }): FormData {
//   const formData = new FormData();
//   formData.append("assignmentId", data.assignmentId);
//   formData.append("studentId", data.studentId);
//   formData.append("content", data.content);
  
//   data.attachments.forEach(file => {
//     formData.append("attachments", file);
//   });
  
//   return formData;
// }

// /**
//  * Maps quiz answers to backend SubmitQuizWithAnswersCommand
//  */
// function mapQuizAnswersToBackend(
//   quizId: string,
//   studentId: string,
//   answers: QuizAnswers,
//   timeSpent?: number
// ): any {
//   const backendAnswers: { [key: string]: any } = {};
  
//   Object.entries(answers).forEach(([questionId, answerData]) => {
//     backendAnswers[questionId] = {
//       selectedOptions: answerData.type === "multiple-choice" 
//         ? [answerData.answer as number]
//         : [],
//       textAnswer: answerData.type === "open-ended" 
//         ? answerData.answer as string
//         : null,
//       timeSpentSeconds: answerData.timeSpent || 0
//     };
//   });

//   return {
//     quizId,
//     studentId,
//     answers: backendAnswers
//   };
// }

// // ============================================
// // UTILITY FUNCTIONS
// // ============================================

// const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// const handleApiError = (error: unknown) => {
//   if (axios.isAxiosError(error)) {
//     const errorMessage = error.response?.data?.message || error.message;
//     throw new Error(errorMessage);
//   }
//   throw error;
// };

// // ============================================
// // API FUNCTIONS
// // ============================================

// /**
//  * Get student's existing task submission
//  */
// export async function getStudentTaskSubmission(
//   assignmentId: string,
//   studentId: string
// ): Promise<Submission | null> {
//   if (isMockEnabled) {
//     await simulateDelay();
    
//     const submission = MOCK_TASK_SUBMISSIONS.find(
//       sub => sub.assignmentId === assignmentId && sub.studentId === studentId
//     );
    
//     console.log(`MOCK: Getting task submission for assignment ${assignmentId}, student ${studentId}`);
//     return submission || null;
//   }

//   try {
//     // Backend doesn't have this specific endpoint
//     // Would need to fetch from submissions list and filter
//     const response = await apiClient.get(`/api/submissions/student/${studentId}`);
//     const submissions = response.data.map(mapSubmissionFromBackend);
//     return submissions.find((s: Submission) => s.assignmentId === assignmentId) || null;
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response?.status === 404) {
//       return null;
//     }
//     return handleApiError(error);
//   }
// }

// /**
//  * Get student's existing quiz submission  
//  */
// export async function getStudentQuizSubmission(
//   quizId: string,
//   studentId: string
// ): Promise<SubmissionQuiz | null> {
//   if (isMockEnabled) {
//     await simulateDelay();
    
//     const submission = MOCK_QUIZ_SUBMISSIONS.find(
//       sub => sub.quizId === quizId && sub.studentId === studentId
//     );
    
//     console.log(`MOCK: Getting quiz submission for quiz ${quizId}, student ${studentId}`);
//     return submission || null;
//   }

//   try {
//     const response = await apiClient.get(`/api/quiz-submissions/${quizId}/student/${studentId}`);
//     return mapQuizSubmissionFromBackend(response.data);
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response?.status === 404) {
//       return null;
//     }
//     return handleApiError(error);
//   }
// }

// /**
//  * Submit a task (individual)
//  */
// export async function submitTask(params: {
//   assignmentId: string;
//   studentId: string;
//   content: string;
//   attachments: File[];
// }): Promise<Submission> {
//   if (isMockEnabled) {
//     await simulateDelay(800);
    
//     const newSubmission: Submission = {
//       type: "INDIVIDUAL",
//       id: `sub-task-${Date.now()}`,
//       assignmentId: params.assignmentId,
//       courseID: "crs-101",
//       studentId: params.studentId,
//       content: params.content,
//       attachments: params.attachments.map((file, index) => ({
//         name: file.name,
//         storagePath: `/assignments/${params.assignmentId}/${file.name}`,
//         createdAt: new Date().toISOString()
//       })),
//       submittedAt: new Date().toISOString(),
//       status: "SUBMITTED",
//       grade: null,
//       teacherFeedback: null
//     };
    
//     const existingIndex = MOCK_TASK_SUBMISSIONS.findIndex(
//       sub => sub.assignmentId === params.assignmentId && sub.studentId === params.studentId
//     );
    
//     if (existingIndex >= 0) {
//       MOCK_TASK_SUBMISSIONS[existingIndex] = newSubmission;
//     } else {
//       MOCK_TASK_SUBMISSIONS.push(newSubmission);
//     }
    
//     console.log("MOCK: Task submitted successfully", newSubmission);
//     return newSubmission;
//   }

//   try {
//     const formData = mapSubmissionToBackend(params);
//     const response = await apiClient.post(`/api/submissions/individual`, formData, {
//       headers: { "Content-Type": "multipart/form-data" }
//     });
//     return mapSubmissionFromBackend(response.data);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Submit a quiz
//  */
// export async function submitQuiz(params: {
//   quizId: string;
//   studentId: string;
//   answers: QuizAnswers;
//   timeSpent?: number;
// }): Promise<SubmissionQuiz> {
//   if (isMockEnabled) {
//     await simulateDelay(800);
    
//     const totalScore = Object.values(params.answers).reduce((sum, answer) => {
//       return sum + (Math.random() > 0.5 ? 10 : 0); // Mock scoring
//     }, 0);
    
//     const newSubmission: SubmissionQuiz = {
//       id: `sub-quiz-${Date.now()}`,
//       quizId: params.quizId,
//       studentId: params.studentId,
//       courseId: "crs-101",
//       studentName: "Student Name",
//       content: JSON.stringify(params.answers),
//       submittedAt: new Date().toISOString(),
//       status: "SUBMITTED",
//       grade: { value: totalScore, maxScore: 100 },
//       teacherFeedback: null,
//       quizData: {
//         answers: [],
//         timeSpent: params.timeSpent || 0,
//         totalScore,
//         maxScore: 100
//       }
//     };
    
//     const existingIndex = MOCK_QUIZ_SUBMISSIONS.findIndex(
//       sub => sub.quizId === params.quizId && sub.studentId === params.studentId
//     );
    
//     if (existingIndex >= 0) {
//       MOCK_QUIZ_SUBMISSIONS[existingIndex] = newSubmission;
//     } else {
//       MOCK_QUIZ_SUBMISSIONS.push(newSubmission);
//     }
    
//     console.log("MOCK: Quiz submitted successfully", newSubmission);
//     return newSubmission;
//   }

//   try {
//     const backendCommand = mapQuizAnswersToBackend(
//       params.quizId,
//       params.studentId,
//       params.answers,
//       params.timeSpent
//     );
//     const response = await apiClient.post(`/api/quiz-submissions/submit-with-answers`, backendCommand);
//     return mapQuizSubmissionFromBackend(response.data);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Grade a task submission
//  */
// export async function gradeSubmission(
//   submissionId: string,
//   gradeValue: string,
//   maxScore: string,
//   feedback: string
// ): Promise<Submission> {
//   if (isMockEnabled) {
//     await simulateDelay(600);
    
//     const index = MOCK_TASK_SUBMISSIONS.findIndex(sub => sub.id === submissionId);
//     if (index !== -1) {
//       MOCK_TASK_SUBMISSIONS[index].grade = {
//         value: parseFloat(gradeValue),
//         maxScore: parseFloat(maxScore)
//       };
//       MOCK_TASK_SUBMISSIONS[index].teacherFeedback = feedback;
//       MOCK_TASK_SUBMISSIONS[index].status = "GRADED";
      
//       console.log("MOCK: Graded submission", MOCK_TASK_SUBMISSIONS[index]);
//       return MOCK_TASK_SUBMISSIONS[index];
//     }
//     throw new Error(`Submission not found: ${submissionId}`);
//   }

//   try {
//     const response = await apiClient.put(`/api/submissions/${submissionId}/grade`, {
//       submissionId,
//       gradeValue,
//       maxScore,
//       feedback
//     });
//     return mapSubmissionFromBackend(response.data);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Fetch submissions by course (basic info)
//  */
// export async function fetchSubmissionsByCourseBasic(courseId: CourseId): Promise<any[]> {
//   if (isMockEnabled) {
//     await simulateDelay();
//     console.log(`MOCK: Fetching basic submissions for course ${courseId}`);
//     return MOCK_TASK_SUBMISSIONS.map(sub => ({
//       id: sub.id,
//       assignmentId: sub.assignmentId,
//       assignmentTitle: "Assignment Title",
//       studentId: sub.studentId,
//       studentName: "Student Name",
//       status: sub.status,
//       submittedAt: sub.submittedAt,
//       gradeValue: sub.grade?.value?.toString() || null,
//       gradeMaxScore: sub.grade?.maxScore?.toString() || null
//     }));
//   }

//   try {
//     const response = await apiClient.get(`/api/submissions/course/${courseId}/basic`);
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Delete submission
//  */
// export async function deleteSubmission(submissionId: SubmissionId): Promise<void> {
//   if (isMockEnabled) {
//     await simulateDelay(400);
    
//     const taskIndex = MOCK_TASK_SUBMISSIONS.findIndex(sub => sub.id === submissionId);
//     if (taskIndex !== -1) {
//       MOCK_TASK_SUBMISSIONS.splice(taskIndex, 1);
//       console.log(`MOCK: Deleted task submission ${submissionId}`);
//       return;
//     }
    
//     const quizIndex = MOCK_QUIZ_SUBMISSIONS.findIndex(sub => sub.id === submissionId);
//     if (quizIndex !== -1) {
//       MOCK_QUIZ_SUBMISSIONS.splice(quizIndex, 1);
//       console.log(`MOCK: Deleted quiz submission ${submissionId}`);
//       return;
//     }
    
//     throw new Error(`Submission not found: ${submissionId}`);
//   }

//   try {
//     await apiClient.delete(`/api/submissions/${submissionId}`);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }