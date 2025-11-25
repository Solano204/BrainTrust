// // ============================================
// // ASSIGNMENT API FUNCTIONS
// // ============================================

// import { Assignment } from "@/app/domain/entities";
// import { CourseId } from "@/app/domain/valueObjects";


// /**
//  * Get all assignment IDs for a course unit
//  * Backend: GET /api/assignments/course/{courseId}/unit/{unitId}/ids
//  */
// export async function fetchAssignmentIdsByUnit(courseId: CourseId, unitId: string): Promise<string[]> {
//   if (isMockEnabled) {
//     await simulateDelay();
//     const assignmentIds = MOCK_ASSIGNMENTS
//       .filter(assign => assign.courseId === courseId && assign.unitId === unitId)
//       .map(assign => assign.id);
    
//     console.log(`MOCK: Returning ${assignmentIds.length} assignment IDs for course ${courseId}, unit ${unitId}`);
//     return assignmentIds;
//   }

//   try {
//     const response = await apiClient.get<string[]>(`/api/assignments/course/${courseId}/unit/${unitId}/ids`);
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Fetch assignments with pagination and filtering
//  * Backend: GET /api/assignments/course/{courseId}/unit/{unitId}/filtered
//  */
// export async function fetchAssignmentsByUnitWithFilter(
//   courseId: CourseId, 
//   unitId: string,
//   options: {
//     page?: number;
//     size?: number;
//     status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
//     deliveryMode?: 'INDIVIDUAL' | 'GROUP' | 'ALL';
//   } = {}
// ): Promise<{
//   assignments: Assignment[];
//   totalCount: number;
//   page: number;
//   totalPages: number;
// }> {
//   if (isMockEnabled) {
//     await simulateDelay();
    
//     let filteredAssignments = MOCK_ASSIGNMENTS.filter(assign => 
//       assign.courseId === courseId && assign.unitId === unitId
//     );

//     // Apply filters
//     if (options.status && options.status !== 'ALL') {
//       const isActive = options.status === 'ACTIVE';
//       filteredAssignments = filteredAssignments.filter(assign => 
//         assign.active === isActive
//       );
//     }

//     if (options.deliveryMode && options.deliveryMode !== 'ALL') {
//       filteredAssignments = filteredAssignments.filter(assign => 
//         assign.deliveryMode === options.deliveryMode
//       );
//     }

//     // Apply pagination
//     const page = options.page || 0;
//     const size = options.size || 10;
//     const startIndex = page * size;
//     const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + size);

//     console.log(`MOCK: Returning ${paginatedAssignments.length} assignments for course ${courseId}, unit ${unitId} with filters`, options);
    
//     return {
//       assignments: paginatedAssignments,
//       totalCount: filteredAssignments.length,
//       page,
//       totalPages: Math.ceil(filteredAssignments.length / size)
//     };
//   }

//   try {
//     const params = new URLSearchParams();
//     if (options.page) params.append('page', options.page.toString());
//     if (options.size) params.append('size', options.size.toString());
//     if (options.status && options.status !== 'ALL') params.append('status', options.status);
//     if (options.deliveryMode && options.deliveryMode !== 'ALL') params.append('deliveryMode', options.deliveryMode);

//     const response = await apiClient.get<{
//       content: AssignmentDTO[];
//       totalElements: number;
//       number: number;
//       totalPages: number;
//     }>(`/api/assignments/course/${courseId}/unit/${unitId}/filtered?${params}`);

//     return {
//       assignments: response.data.content.map(mapAssignmentFromBackend),
//       totalCount: response.data.totalElements,
//       page: response.data.number,
//       totalPages: response.data.totalPages
//     };
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// /**
//  * Fetch assignments by unit with student submission status
//  * Backend: GET /api/assignments/course/{courseId}/unit/{unitId}/student/{studentId}
//  */
// export async function fetchAssignmentsByUnitWithSubmissionStatus(
//   courseId: CourseId,
//   unitId: string,
//   studentId: string
// ): Promise<Array<Assignment & { submissionStatus: 'SUBMITTED' | 'PENDING' | 'OVERDUE' | 'GRADED' }>> {
//   if (isMockEnabled) {
//     await simulateDelay();
    
//     const assignments = MOCK_ASSIGNMENTS.filter(assign => 
//       assign.courseId === courseId && assign.unitId === unitId
//     );

//     const assignmentsWithStatus = assignments.map(assign => {
//       const submission = MOCK_TASK_SUBMISSIONS.find(
//         sub => sub.assignmentId === assign.id && sub.studentId === studentId
//       );
      
//       let submissionStatus: 'SUBMITTED' | 'PENDING' | 'OVERDUE' | 'GRADED' = 'PENDING';
      
//       if (submission) {
//         submissionStatus = submission.status === 'GRADED' ? 'GRADED' : 'SUBMITTED';
//       } else if (assign.dueDate && new Date(assign.dueDate) < new Date()) {
//         submissionStatus = 'OVERDUE';
//       }

//       return {
//         ...assign,
//         submissionStatus
//       };
//     });

//     console.log(`MOCK: Returning ${assignmentsWithStatus.length} assignments with submission status for student ${studentId}`);
//     return assignmentsWithStatus;
//   }

//   try {
//     const response = await apiClient.get<Array<AssignmentDTO & { submissionStatus: string }>>(
//       `/api/assignments/course/${courseId}/unit/${unitId}/student/${studentId}`
//     );

//     return response.data.map(item => ({
//       ...mapAssignmentFromBackend(item),
//       submissionStatus: item.submissionStatus as 'SUBMITTED' | 'PENDING' | 'OVERDUE' | 'GRADED'
//     }));
//   } catch (error) {
//     return handleApiError(error);
//   }
// }