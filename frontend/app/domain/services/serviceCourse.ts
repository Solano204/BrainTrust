

import { CourseListItem } from "../Dtos/Course";
import { Course, ResourceItem, SubmissionDetailData, TaskInventoryItem, TaskType } from "../entities/CourseEntities";


export async function fetchCourseListMock(): Promise<Course[]> {

    await new Promise(resolve => setTimeout(resolve, 600)); 


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


const MOCK_RESOURCE_DATA: ResourceItem[] = [
    {
        id: "task",
        name: "Task (Assignment)",
        description: "Create assignments with file submissions and grading.",
        type: 'ASSIGNMENT',
        icon: ClipboardList,
    },
    {
        id: "quiz",
        name: "Quiz (Exam)",
        description: "Add questions and grade automatically.",
        type: 'QUIZ',
        icon: HelpCircle,
    },
    {
        id: "page",
        name: "Page (Lesson)",
        description: "Enable debates and participation grading.",
        type: 'PAGE',
        icon: MessageSquare,
    },
   
];

/**
 * Simulates fetching the list of available activity/resource types.
 * @returns A Promise resolving to an array of ResourceItem.
 */
export async function fetchResourceTypesMock(): Promise<ResourceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_RESOURCE_DATA;
}


import { MonitorCheck, Paperclip, Download } from 'lucide-react';
import { CourseCode, CourseId } from "../valueObjects/CourseValues";

export type SubmissionId = string;
export type AssignmentId = string;
export type UserId = string;
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED' | 'RETURNED' | 'REJECTED';
export type Document = { name: string; storagePath: string; createdAt: string };
export type Grade = { value: string; maxScore: string };


export function generateTaskInventoryMock(): TaskInventoryItem[] {
    return [
    ];
}
export async function fetchSubmissionDetailMock(submissionId: SubmissionId): Promise<SubmissionDetailData> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {} as SubmissionDetailData;
}

export async function fetchCourseOverviewMock(courseId: CourseId): Promise<Course> {
    return {} as Course;
}