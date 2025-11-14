// 💡 MOCK DATA: Simulating the full domain data for a list of courses

import { CourseListItem } from "../Dtos/Course";
import { Course, ResourceItem, SubmissionDetailData, TaskInventoryItem, TaskType } from "../entities/CourseEntities";


export async function fetchCourseListMock(): Promise<Course[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600)); 
    
    // 🔥 MOCK_DATA now strictly conforms to the Course interface.
    // Placeholders are used for the required domain fields.
    const MOCK_DATA: Course[] = [
      { 
          id: "COURSE-DES-401", 
          code: "DES-401", 
          name: "Advanced UX Design", 
          description: "Focuses on user research and prototyping.",
          urlImage: null,
          grade: "Advanced",
          group: "Section A",
          teacherId: "USER-T-UX",
          active: true,
          enrollments: [],
          units: [],    
      },
      { 
          id: "COURSE-203", 
          code: "PSI-203", 
          name: "Educational Psychology", 
          description: "Study of how students learn in educational settings.",
          urlImage: null,
          grade: "Intermediate",
          group: "Section B",
          teacherId: "USER-T-PSI",
          active: true,
            enrollments: [],
            units: [],
      },
      { 
          id: "COURSE-101", 
          code: "UI-101", 
          name: "UI Design Fundamentals", 
          description: "Introduction to user interface design principles.",
          urlImage: null,
          grade: "Beginner",
          group: "Section A",
          teacherId: "USER-T-UI",
          active: true,
            enrollments: [],
            units: [],
      },
      { 
          id: "COURSE-305", 
          code: "WEB-305", 
          name: "Web Development Advanced", 
          description: "Building complex, scalable web applications.",
          urlImage: null,
          grade: "Advanced",
          group: "Section C",
          teacherId: "USER-T-WEB",
          active: true,
            enrollments: [],
            units: [],
      },
      { 
          id: "COURSE-202", 
          code: "MOB-202", 
          name: "Mobile App Design", 
          description: "Designing native experiences for iOS and Android.",
          urlImage: null,
          grade: "Intermediate",
          group: "Section B",
          teacherId: "USER-T-MOB",
          active: true,
            enrollments: [],
            units: [],
      },
    ];

    return MOCK_DATA;
}
import { HelpCircle, MessageSquare, ClipboardList, FileText } from "lucide-react";
// Import the types defined above (ResourceItem, CourseResourceType)

const MOCK_RESOURCE_DATA: ResourceItem[] = [
    {
        id: "task",
        name: "Task (Assignment)",
        description: "Create assignments with file submissions and grading.",
        type: 'ASSIGNMENT',
        icon: ClipboardList, // 💡 Assigned specific icon
    },
    {
        id: "quiz",
        name: "Quiz (Exam)",
        description: "Add questions and grade automatically.",
        type: 'QUIZ',
        icon: HelpCircle, // 💡 Assigned specific icon
    },
    {
        id: "page",
        name: "Page (Lesson)",
        description: "Enable debates and participation grading.",
        type: 'PAGE',
        icon: MessageSquare, // 💡 Assigned specific icon
    },
   
];

/**
 * Simulates fetching the list of available activity/resource types.
 * @returns A Promise resolving to an array of ResourceItem.
 */
export async function fetchResourceTypesMock(): Promise<ResourceItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_RESOURCE_DATA;
}


import { MonitorCheck, Paperclip, Download } from 'lucide-react';
import { CourseCode, CourseId } from "../valueObjects/CourseValues";

// --- Placeholder/Simplified Domain Types (Based on your context) ---
export type SubmissionId = string;
export type AssignmentId = string;
export type UserId = string;
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED' | 'RETURNED' | 'REJECTED';
export type Document = { name: string; storagePath: string; createdAt: string };
export type Grade = { value: string; maxScore: string };


// --- 1. Interface for the Table Rows ---


// --- Mock Data ---
const MOCK_STUDENTS = [
    { id: 'USER-001', name: 'Alice Johnson', avatarUrl: 'https://placehold.co/100x100/A3E635/000?text=AJ' },
    { id: 'USER-002', name: 'Bob Smith', avatarUrl: 'https://placehold.co/100x100/FDBA74/000?text=BS' },
    { id: 'USER-003', name: 'Charlie Davis', avatarUrl: 'https://placehold.co/100x100/34D399/000?text=CD' },
];

const MOCK_ASSIGNMENTS = [
    { id: 'TASK-101', name: "Assignment 2: Wireframe Final", unit: "Unit 3", maxPoints: 100, type: 'ASSIGNMENT' as TaskType },
    { id: 'TASK-102', name: "Critical Thinking Essay", unit: "Unit 4", maxPoints: 50, type: 'ASSIGNMENT' as TaskType },
    { id: 'TASK-103', name: "Forum: Week 5 Discussion", unit: "Unit 2", maxPoints: 20, type: 'FORUM' as TaskType },
];

// 🚀 MOCK FUNCTION 1: Generate Task Inventory List
export function generateTaskInventoryMock(): TaskInventoryItem[] {
    const today = new Date();
    return MOCK_ASSIGNMENTS.map((task, index) => {
        const deadlineDate = new Date(today);
        deadlineDate.setDate(today.getDate() + (index % 3 === 0 ? -1 : 5 - index)); 
        
        const totalStudents = 30;
        const pendingSubmissions = Math.floor(Math.random() * 15);
        
        return {
            id: `SUB-${task.id}-001`, // Use a mock submission ID for 'View' button
            taskId: task.id,
            name: task.name,
            unit: task.unit,
            type: task.type,
            deadline: deadlineDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            isOverdue: deadlineDate < today,
        };
    });
}

// 🚀 MOCK FUNCTION 2: Fetch Single Submission Detail
export async function fetchSubmissionDetailMock(submissionId: SubmissionId): Promise<SubmissionDetailData> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const student = MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)];
    const task = MOCK_ASSIGNMENTS[Math.floor(Math.random() * MOCK_ASSIGNMENTS.length)];

    const status: SubmissionStatus = Math.random() > 0.6 ? 'SUBMITTED' : 'LATE_SUBMITTED';

    return {
        submission: {
            id: submissionId,
            content: "The student provided a thoughtful analysis of the primary sources, but the citation format needs refinement according to APA guidelines. The conclusion effectively summarizes the main arguments.\n\n[Full submission content would be here, potentially a very long text block...]",
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            status: status,
            attachments: [
                { name: `Submission-${submissionId}.docx`, storagePath: '/sub/123', createdAt: new Date().toISOString() },
                { name: `Sources-Map.pdf`, storagePath: '/sub/456', createdAt: new Date().toISOString() },
            ],
            grade: { value: "85", maxScore: "100" },
            teacherFeedback: null,
        },
        task: {
            id: task.id,
            title: task.name,
            maxPoints: task.maxPoints,
            instructions: "Evaluate the student's ability to synthesize critical literature and formulate a strong, defensible thesis.",
        },
        student: student,
        aiAnalysis: {
            status: 'COMPLETED',
            result: {
                aiProbability: { value: '0.15', maxScore: '1.0' },
                detectedSegments: [
                    { start: 20, end: 50, probability: '0.85' },
                    { start: 100, end: 120, probability: '0.70' },
                ],
            } as any
        }
    };
}




const MOCK_COURSE_DATA: Course = {
  // --- Course Root Data ---
  id: "COURSE-DES-401",
  code: "DES-401" as CourseCode,
  name: "Advanced UX Design",
  description: "Master the principles of user-centered design and create exceptional digital experiences",
  urlImage: "https://placehold.co/800x300/4F46E5/FFFFFF?text=Advanced+UX+Design", 
  grade: "Advanced",
  group: "Section A",
  teacherId: "USER-TEACHER-123",
  active: true,
  enrollments: Array.from({ length: 85 }, (_, i) => ({ // Mock 85 students
    id: `ENR-${i}`, courseId: "COURSE-DES-401", studentId: `USER-S${i}`, enrollmentDate: "2024-01-01", status: "ACTIVE", grade: null,
  })),
  
  // --- Units Data ---
  units: [
    {
        id: "UNIT-1", courseId: "COURSE-DES-401", name: "Introduction to UCD", numUnity: 1, description: "Learn the fundamentals of User-Centered Design", urlImage: null,
        resources: []
    }
    ,
    {
        id: "UNIT-2", courseId: "COURSE-DES-401", name: "User Research", numUnity: 2, description: "Discover techniques for understanding your users", urlImage: null,
        resources: []
    },
    {
        id: "UNIT-3", courseId: "COURSE-DES-401", name: "Prototyping & Testing", numUnity: 3, description: "Create and validate design solutions", urlImage: null,
        resources: []
    },
    {
        id: "UNIT-4", courseId: "COURSE-DES-401", name: "Design Systems", numUnity: 4, description: "Build scalable and consistent design frameworks", urlImage: null,
        resources: []
    },
    {
        id: "UNIT-5", courseId: "COURSE-DES-401", name: "Accessibility", numUnity: 5, description: "Design inclusive experiences for all users", urlImage: null,
        resources: []
    },
    {
        id: "UNIT-6", courseId: "COURSE-DES-401", name: "Final Project", numUnity: 6, description: "Apply everything you've learned in a capstone project", urlImage: null,
        resources: []
    },
  ],
};


/**
 * Mocks an API call to fetch all data required for a Course Overview page.
 * @param courseId The ID of the course to fetch.
 * @returns A promise resolving to the Course entity.
 */
export async function fetchCourseOverviewMock(courseId: CourseId): Promise<Course> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    if (courseId !== MOCK_COURSE_DATA.id) {
        throw new Error("Course not found");
    }

    return MOCK_COURSE_DATA;
}