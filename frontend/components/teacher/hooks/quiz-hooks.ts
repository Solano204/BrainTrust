// File: src/app/features/courses/hooks/quiz-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizKeys } from "@/app/infraestructure/api/submission/quiz-keys";


import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuestionId, QuizId } from "@/app/domain/valueObjects/CourseValues";
import React from "react";
import { SubmissionQuiz, QuizData, QuizAnswer, QuizInventoryItem,  Submission } from "../../../app/presentation/hooks/submission/types";
import { Question } from "@/app/domain/entities/CourseEntities";
import {  
  fetchTeacherSubmissionsItem, 
  fetchTeacherSubmissionsQuizzesItem, 
  StudentSubmissionQuiz,
} from "@/components/student/api/student-submission";
import { createQuiz, deleteQuiz, fetchQuizSubmissions, fetchQuizzesByCourse, getQuizStats,  submitQuizAnswers, updateQuiz } from "../api/quiz";
import { Quiz } from "@/app/domain/entities/CourseEntities";
import { fetchQuizSubmissionDetail, gradeQuizSubmission } from "@/components/teacher-student/api/quiz-teacher";

/**
 * Custom hook for fetching all quiz submissions for a course
 */
export function useQuizSubmissionsByCourse(courseId: CourseId | null, unitId : string | null) {
  return useQuery<StudentSubmissionQuiz[]>({
    queryKey: ['quiz-submissions', courseId],
    queryFn: () => fetchTeacherSubmissionsQuizzesItem(courseId!, unitId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single detailed quiz submission
 */
// CURRENTLY WORKS

export function useQuizSubmissionDetail(submissionId: string | null) {
  return useQuery({
    queryKey: quizKeys.submissionDetail(submissionId || ''),
    queryFn: () => fetchQuizSubmissionDetail(submissionId!),
    enabled: !!submissionId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching SubmissionQuiz entries
 */
// export function useSubmissionQuizzes(quizId: QuizId | null) {
//   return useQuery<SubmissionQuiz[]>({
//     queryKey: quizKeys.submissionQuizzes(quizId || ""),
//     queryFn: () => fetchSubmissionQuizzes(quizId!),
//     enabled: !!quizId,
//     staleTime: 300000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// }

/**
 * Custom hook for fetching a single SubmissionQuiz by ID
 */
// export function useSubmissionQuiz(submissionId: string | null) {
//   return useQuery<SubmissionQuiz>({
//     queryKey: quizKeys.submissionQuizDetail(submissionId || ""),
//     queryFn: () => fetchSubmissionQuizById(submissionId!),
//     enabled: !!submissionId,
//     staleTime: 300000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// }

/**
 * Custom hook for SubmissionQuiz mutations
 */

// CURRENTLY WORK

export function useSubmissionQuizMutations() {
  const queryClient = useQueryClient();

// CURRENTLY WORK

  const submitQuizMutation = useMutation({
    mutationFn: ({
      quizId,
      studentId,
      answers,
      timeSpent,
    }: {
      quizId: QuizId;
      studentId: UserId;
      answers: Array<{ questionId: QuestionId; answer: string | number }>;
      timeSpent?: number;
    }) => submitQuizAnswers(quizId, studentId, answers, timeSpent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.submissionQuizzes(data.quizId),
      });
    },
    onError: (error: Error) => {
      console.error("Error submitting quiz:", error.message);
    },
  });

  const gradeSubmissionQuizMutation = useMutation({
    mutationFn: ({
      submissionId,
      grades,
    }: {
      submissionId: string;
      grades: { questionId: QuestionId; score: number; feedback?: string }[];
    }) => gradeQuizSubmission(submissionId, grades),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.submissionQuizzes(data.quizId),
      });
      queryClient.invalidateQueries({
        queryKey: quizKeys.submissionQuizDetail(data.id),
      });
      // Also invalidate the detailed submission query
      queryClient.invalidateQueries({
        queryKey: ['quiz-submission-detail', data.id],
      });
    },
    onError: (error: Error) => {
      console.error("Error grading submission quiz:", error.message);
    },
  });

  // const autoGradeSubmissionQuizMutation = useMutation({
  //   mutationFn: autoGradeSubmissionQuiz, // expects SubmissionQuiz
  //   onSuccess: (data) => {
  //     queryClient.invalidateQueries({
  //       queryKey: quizKeys.submissionQuizzes(data.quizId),
  //     });
  //     queryClient.invalidateQueries({
  //       queryKey: quizKeys.submissionQuizDetail(data.id),
  //     });
  //     // Also invalidate the detailed submission query
  //     queryClient.invalidateQueries({
  //       queryKey: ['quiz-submission-detail', data.id],
  //     });
  //   },
  //   onError: (error: Error) => {
  //     console.error("Error auto-grading submission quiz:", error.message);
  //   },
  // });

  return {
    submitQuiz: submitQuizMutation,
    gradeSubmissionQuiz: gradeSubmissionQuizMutation,
    // autoGradeSubmissionQuiz: autoGradeSubmissionQuizMutation,
  };
}

/**
 * Custom hook for fetching quizzes by course
 */
// THIS CURRENTLY WORKS


export function useQuizzesByCourseWithoutDetails(courseId: CourseId | null, unitId : string | null) {
  return useQuery<StudentSubmissionQuiz[]>({
    queryKey: quizKeys.listUnit(courseId || "", unitId || ""),
    queryFn: () => fetchTeacherSubmissionsQuizzesItem(courseId!, unitId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useQuizzesByCourse(courseId: CourseId | null) {
  return useQuery<Quiz[]>({
    queryKey: quizKeys.list((courseId || "") + "completed"),
    queryFn: () => fetchQuizzesByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}




/**
 * Custom hook for fetching a single quiz by ID
 */
// export function useQuiz(quizId: QuizId | null) {
//   return useQuery<Quiz>({
//     queryKey: quizKeys.detail(quizId || ""),
//     queryFn: () => fetchQuizById(quizId!),
//     enabled: !!quizId,
//     staleTime: 300000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// }

/**
 * Custom hook for fetching quiz submissions
 */



// CURRENTLY WORKS

export function useQuizSubmissions(quizId: QuizId | null) {
  return useQuery<Submission[]>({
    queryKey: quizKeys.quizSubmissions(quizId || ""),
    queryFn: async () => {
      const apiSubmissions = await fetchQuizSubmissions(quizId!);
      return apiSubmissions.map((submission: any) => ({
        ...submission,
        attachments: (submission.attachments || []).map((att: any) => {
          if (typeof att === "string") {
            return { id: att, name: att, url: att };
          }
          return att;
        }),
      }));
    },
    enabled: !!quizId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching quiz statistics
 */

// export function useQuizStats(quizId: QuizId | null) {
//   return useQuery({
//     queryKey: quizKeys.statsByQuiz(quizId || ""),
//     queryFn: () => getQuizStats(quizId!),
//     enabled: !!quizId,
//     staleTime: 300000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// }

/**
 * Custom hook for quiz mutations
 */
// CURRENTLY WORKS

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(data.courseId),
      });
    },
    onError: (error: Error) => {
      console.error("Error creating quiz:", error.message);
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: ({
      quizId,
      quizData,
    }: {
      quizId: QuizId;
      quizData: Partial<Omit<Quiz, "id">>;
    }) => updateQuiz(quizId, quizData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.list(data.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: quizKeys.detail(variables.quizId),
      });
    },
    onError: (error: Error) => {
      console.error("Error updating quiz:", error.message);
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: quizKeys.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting quiz:", error.message);
    },
  });

 

  
    
  
    const gradeSubmissionMutation = useMutation({
      mutationFn: ({
        submissionId,
        grades,
        overallGrade,
      }: {
        submissionId: string;
        grades: { questionId: string; score: number; feedback?: string }[];
        overallGrade?: string;
      }) => gradeQuizSubmission(submissionId, grades, overallGrade),
      onSuccess: (data) => {
        // Invalidate the submission detail query
        queryClient.invalidateQueries({
          queryKey: quizKeys.submissionDetail(data.id),
        });
        // Invalidate all submissions queries
        queryClient.invalidateQueries({
          queryKey: quizKeys.submissions(),
        });
      },
      onError: (error: Error) => {
        console.error("Error grading submission:", error.message);
      },
    });
  


  
  return {
    createQuiz: createQuizMutation,
    updateQuiz: updateQuizMutation,
    deleteQuiz: deleteQuizMutation,
    gradeSubmission: gradeSubmissionMutation,
  };
}

/**
 * Custom hook for managing quiz form state
 */
export function useQuizForm(initialData?: Quiz) {
  const [formData, setFormData] = React.useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    maxGrade: initialData?.maxGrade || 100,
    timeLimit: initialData?.timeLimit || 60,
    passingScore: initialData?.passingScore || 70,
    dueDate: initialData?.dueDate || "",
    questions: initialData?.questions || [],
    acceptLateSubmissions: initialData?.acceptLateSubmissions || false,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        maxGrade: initialData.maxGrade,
        timeLimit: initialData.timeLimit,
        passingScore: initialData.passingScore,
        dueDate: initialData.dueDate || "",
        questions: initialData.questions,
        acceptLateSubmissions: initialData.acceptLateSubmissions,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        maxGrade: 100,
        timeLimit: 60,
        passingScore: 70,
        dueDate: "",
        questions: [],
        acceptLateSubmissions: false,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const addQuestion = (question: Question) => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  };

  const updateQuestion = (index: number, question: Question) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      maxGrade: 100,
      timeLimit: 60,
      passingScore: 70,
      dueDate: "",
      questions: [],
      acceptLateSubmissions: false,
    });
  };

  return {
    formData,
    handleChange,
    addQuestion,
    updateQuestion,
    removeQuestion,
    resetForm,
    setFormData,
  };
}