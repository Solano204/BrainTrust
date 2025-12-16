// // File: src/app/infraestructure/api/gradebook/student-gradebook-api.ts
// "use server";

// import { calificationStudent } from "@/app/domain/entities/CourseEntities";
// import axios from "axios";
// import { cookies } from "next/headers";

// const MOCK_GRADEBOOK_DATA: calificationStudent[] = [
//   {
//     id: "grade-101-1",
//     student: {
//       studentId: "student-1",
//       nameStudent: "Alice Johnson",
//       taskId: "sub-task-101-1",
//       calification: 85
//     },
//     task: {
//       id: "task-101",
//       nameTask: "Wireframe Design Project",
//       maxPoints: 100,
//       unitId: "UNIT-3",
//       unitName: "Prototyping & Testing",
//       CourseId: "crs-101"
//     },
//     total: 85
//   },
//   {
//     id: "grade-101-2",
//     student: {
//       studentId: "student-2",
//       nameStudent: "Bob Smith",
//       taskId: "sub-task-101-2",
//       calification: 92
//     },
//     task: {
//       id: "task-101",
//       nameTask: "Wireframe Design Project",
//       maxPoints: 100,
//       unitId: "UNIT-3",
//       unitName: "Prototyping & Testing",
//       CourseId: "crs-101"
//     },
//     total: 92
//   },
//   {
//     id: "grade-101-3",
//     student: {
//       studentId: "student-3",
//       nameStudent: "Carol Davis",
//       taskId: "sub-task-101-3",
//       calification: 78
//     },
//     task: {
//       id: "task-101",
//       nameTask: "Wireframe Design Project",
//       maxPoints: 100,
//       unitId: "UNIT-3",
//       unitName: "Prototyping & Testing",
//       CourseId: "crs-101"
//     },
//     total: 78
//   },
//   {
//     id: "grade-102-1",
//     student: {
//       studentId: "student-1",
//       nameStudent: "Alice Johnson",
//       taskId: "sub-task-102-1",
//       calification: 88
//     },
//     task: {
//       id: "task-102",
//       nameTask: "User Research Report",
//       maxPoints: 85,
//       unitId: "UNIT-2",
//       unitName: "User Research",
//       CourseId: "crs-101"
//     },
//     total: 88
//   },
//   {
//     id: "grade-102-2",
//     student: {
//       studentId: "student-2",
//       nameStudent: "Bob Smith",
//       taskId: "sub-task-102-2",
//       calification: 0
//     },
//     task: {
//       id: "task-102",
//       nameTask: "User Research Report",
//       maxPoints: 85,
//       unitId: "UNIT-2",
//       unitName: "User Research",
//       CourseId: "crs-101"
//     },
//     total: 0
//   },
//   {
//     id: "grade-201-1",
//     student: {
//       studentId: "student-4",
//       nameStudent: "David Wilson",
//       taskId: "sub-task-201-1",
//       calification: 95
//     },
//     task: {
//       id: "task-201",
//       nameTask: "Linear Algebra Problem Set",
//       maxPoints: 75,
//       unitId: "UNIT-2-1",
//       unitName: "Vector Spaces",
//       CourseId: "crs-202"
//     },
//     total: 95
//   },
//   {
//     id: "grade-201-2",
//     student: {
//       studentId: "student-5",
//       nameStudent: "Eva Brown",
//       taskId: "sub-task-201-2",
//       calification: 82
//     },
//     task: {
//       id: "task-201",
//       nameTask: "Linear Algebra Problem Set",
//       maxPoints: 75,
//       unitId: "UNIT-2-1",
//       unitName: "Vector Spaces",
//       CourseId: "crs-202"
//     },
//     total: 82
//   },
//   {
//     id: "grade-103-1",
//     student: {
//       studentId: "student-1",
//       nameStudent: "Alice Johnson",
//       taskId: "sub-task-103-1",
//       calification: 91
//     },
//     task: {
//       id: "task-103",
//       nameTask: "Design System Documentation",
//       maxPoints: 95,
//       unitId: "UNIT-4",
//       unitName: "Design Systems",
//       CourseId: "crs-101"
//     },
//     total: 91
//   }
// ];

// // Mock student data for additional context
// const MOCK_STUDENTS = [
//   { id: "student-1", name: "Alice Johnson", email: "alice@university.edu" },
//   { id: "student-2", name: "Bob Smith", email: "bob@university.edu" },
//   { id: "student-3", name: "Carol Davis", email: "carol@university.edu" },
//   { id: "student-4", name: "David Wilson", email: "david@university.edu" },
//   { id: "student-5", name: "Eva Brown", email: "eva@university.edu" },
//   { id: "student-6", name: "Frank Miller", email: "frank@university.edu" }
// ];

// // Utility to simulate network delay
// const simulateDelay = (ms: number = 500) =>
//   new Promise((resolve) => setTimeout(resolve, ms));

// // Flag to enable/disable mocking
// const isMockEnabled = true;

// // API client configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
// });

// apiClient.interceptors.request.use(
//   async (config) => {
//     const token = (await cookies()).get("session")?.value;
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// const handleApiError = (error: unknown) => {
//   if (axios.isAxiosError(error)) {
//     const errorMessage = error.response?.data?.message || error.message;
//     throw new Error(errorMessage);
//   }
//   throw error;
// };

// /**
//  * Fetch gradebook data for a specific student in a course
//  */
// export async function fetchStudentGradebook(courseId: string, studentId: string): Promise<any> {
//   if (isMockEnabled) {
//     await simulateDelay();
    
//     // Filter grades for this specific student and course
//     const studentGrades = MOCK_GRADEBOOK_DATA.filter(grade => 
//       grade.task.CourseId === courseId && grade.student.studentId === studentId
//     );

//     // Get all tasks for the course to show even ungraded ones
//     const allCourseTasks = MOCK_GRADEBOOK_DATA
//       .filter(grade => grade.task.CourseId === courseId)
//       .reduce((tasks, grade) => {
//         if (!tasks.find(t => t.id === grade.task.id)) {
//           tasks.push({
//             id: grade.task.id,
//             name: grade.task.nameTask,
//             unitName: grade.task.unitName,
//             maxPoints: grade.task.maxPoints
//           });
//         }
//         return tasks;
//       }, [] as any[]);

//     // Create student gradebook with all tasks, including ungraded ones
//     const studentTasks = allCourseTasks.map(task => {
//       const grade = studentGrades.find(g => g.task.id === task.id);
//       return {
//         id: task.id,
//         name: task.name,
//         unitName: task.unitName,
//         maxPoints: task.maxPoints,
//         score: grade ? grade.student.calification : null
//       };
//     });

//     const student = MOCK_STUDENTS.find(s => s.id === studentId);

//     const studentGradebook = {
//       studentId,
//       studentName: student?.name || "Student",
//       courseId,
//       tasks: studentTasks
//     };

//     console.log(`MOCK: Returning student gradebook for student ${studentId} in course ${courseId}`);
//     console.log("STUDENT GRADEBOOK DATA:", studentGradebook);
//     console.log("TASKS COUNT:", studentTasks.length);
//     console.log("GRADED TASKS:", studentTasks.filter(t => t.score !== null).length);
    
//     return studentGradebook;
//   }

//   try {
//     const response = await apiClient.get(`/courses/${courseId}/gradebook/students/${studentId}`);
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Export student's grades to CSV
//  */
// export async function exportStudentGrades(courseId: string, studentId: string): Promise<Blob> {
//   if (isMockEnabled) {
//     await simulateDelay(800);
    
//     const studentGradebook = await fetchStudentGradebook(courseId, studentId);
    
//     // Create CSV content for student's grades
//     const headers = "Assignment Name,Unit,Your Score,Max Points,Percentage,Status\n";
//     const rows = studentGradebook.tasks.map((task: any) => {
//       const percentage = task.score !== null ? (task.score / task.maxPoints) * 100 : null;
//       const status = task.score !== null ? "Graded" : "Pending";
      
//       return `"${task.name}","${task.unitName}",${task.score || "N/A"},${task.maxPoints},${
//         percentage ? percentage.toFixed(1) + "%" : "N/A"
//       },${status}`;
//     }).join("\n");
    
//     const csvContent = headers + rows;
//     const blob = new Blob([csvContent], { type: 'text/csv' });
    
//     console.log(`MOCK: Generated CSV export for student ${studentId} in course ${courseId}`);
//     console.log("STUDENT CSV CONTENT LENGTH:", csvContent.length);
    
//     return blob;
//   }

//   try {
//     const response = await apiClient.get(`/courses/${courseId}/gradebook/students/${studentId}/export`, {
//       responseType: 'blob'
//     });
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }