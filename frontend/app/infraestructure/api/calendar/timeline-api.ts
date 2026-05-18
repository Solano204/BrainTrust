 "use server";

import axios from "axios";
import { cookies } from "next/headers";
    import {  deliveryMode, Submission } from "@/app/domain/entities/CourseEntities";
import { AssignmentId, CourseId, Document, Score, UserId } from "@/app/domain/valueObjects";
import {  Question } from "@/app/domain/entities/CourseEntities";
import { QuizId, UnitId } from "@/app/domain/valueObjects/CourseValues";

const isMockEnabled = true;

export interface Quiz {
  id: QuizId;
  description: string;
  courseUnitId: UnitId;
  courseId: CourseId; 

  idUser: UserId;
  title: string;
  maxGrade: number;
  timeLimit: number;
  passingScore: number;

  dueDate: string | null;
  questions: Question[];
  acceptLateSubmissions: boolean;
}

export interface Assignment {
  id: AssignmentId;
  title: string;
  courseId: CourseId; 
  unitId: CourseId;
  description: string;
  createdAt: string;
  urls: string[];
  attachments: Document[];
  links: string[];
  deliveryMode: deliveryMode;
  dueDate: string | null;
  maxScore: Score;
  instructions: string;
  submissions: Submission[];
  allowLateSubmissions: boolean;
  idUser: UserId;
}


const MOCK_TIMELINE_RESOURCES: (Assignment | Quiz)[] = [
  {
    id: "sub-task-1",
    title: "Wireframe Design Projects",
    courseId: "COURSE-DES-401s",
    unitId: "UNIT-3",
    description: "Create detailed wireframes for a mobile banking application focusing on user experience and accessibility",
    createdAt: "2025-11-26T10:00:00Z",
    urls: [
      "https://figma.com/design/banking-wireframes",
      "https://material.io/design"
    ],
    attachments: [
      {
        name: "design-guidelines.pdf",
        storagePath: "/attachments/design-guidelines.pdf",
        createdAt: "2025-11-29T10:00:00Z"
      }
    ],
    links: [
      "https://www.nngroup.com/articles/wireframing/"
    ],
    deliveryMode: "INDIVIDUAL",
    // Original: 2024-03-15 -> Updated: 2025-11-14 (Upcoming)
    dueDate: "2025-11-26T23:59:00Z", 
    maxScore: { value: 100, maxPoints: 100 },
    instructions: "Design wireframes for 5 key screens: login, dashboard, account overview, money transfer, and settings.",
    submissions: [],
    allowLateSubmissions: true,
    idUser: "user-001"

  },
  {
    id: "task-201",
    title: "Linear Algebra Problem Set",
    courseId: "crs-202",
    unitId: "UNIT-2-1",
    description: "Solve vector space and linear transformation problems",
    createdAt: "2025-11-03T11:00:00Z",
    urls: [
      "https://khanacademy.org/math/linear-algebra"
    ],
    attachments: [
      {
        name: "problem-set-3.pdf",
        storagePath: "/attachments/problem-set-3.pdf",
        createdAt: "2025-11-03T11:00:00Z"
      }
    ],
    links: [
      "https://math.mit.edu/linearalgebra/"
    ],
    deliveryMode: "INDIVIDUAL",
    // Original: 2024-03-18 -> Updated: 2025-11-17 (Upcoming)
    dueDate: "2025-11-27T23:59:00Z",
    maxScore: { value: 100, maxPoints: 100 },
    instructions: "Complete all 10 problems from the attached PDF. Show all your work and reasoning.",
    submissions: [],
    allowLateSubmissions: false,
    idUser: "user-001"
  },

  {
    id: "sub-quiz-1",
    title: "UX Design Fundamentals Quizss",
    description: "Test your knowledge of basic UX design principles and methodologies",
    courseUnitId: "UNIT-1",
    courseId: "COURSE-DES-401",
    maxGrade: 100,
    timeLimit: 30,
    passingScore: 70,
    dueDate: "2025-11-15T23:59:00Z",
    acceptLateSubmissions: true,
    idUser: "user-001",
    questions: [
      {
        id: "q-101-1",
        type: "multiple-choice",
        text: "What does UCD stand for in design?",
        maxPoints: 10,
        question: "What does UCD stand for in design?",
        options: [
          "User-Centered Design",
          "User-Created Development",
          "Universal Component Design"
        ],
        correctAnswer: 0,
        points: 10,
        expectedAnswer: ""
      }
      
    ]
  },
  {
    id: "quiz-201",
    title: "Linear Algebra Basics",
    description: "Fundamental concepts of linear algebra including vectors and matrices",
    courseUnitId: "UNIT-2-1",
    courseId: "crs-202",
    maxGrade: 100,
    timeLimit: 60,
    passingScore: 65,
    dueDate: "2025-11-29T23:59:00Z",
    acceptLateSubmissions: true,
    idUser: "user-001",
    questions: [
      {
        id: "q-201-1",
        type: "multiple-choice",
        text: "What is the determinant of a 2x2 identity matrix?",
        maxPoints: 10,
  
        question: "What is the determinant of a 2x2 identity matrix?",
        options: ["0", "1", "2", "-1"],
        correctAnswer: 1,
        points: 10,
        expectedAnswer: ""
      }
    ]
  },


  {
    id: "quiz-102",
    title: "User Research Methods Assessment",
    description: "Evaluate your understanding of various user research techniques",
    courseUnitId: "UNIT-2",
    courseId: "COURSE-DES-401",
    maxGrade: 100,
    timeLimit: 45,
    passingScore: 75,
    dueDate: "**2025-11-10T23:59:00Z**",
    acceptLateSubmissions: false,
    idUser: "user-001",
    questions: [
      {
        id: "q-102-1",
        type: "multiple-choice",
        text: "Which research method is best for understanding user behaviors?",
        maxPoints: 15,
        question: "Which research method is best for understanding user behaviors?",
        options: [
          "Contextual Inquiry",
          "Online Survey",
          "A/B Testing"
        ],
        correctAnswer: 0,
        points: 15,
        expectedAnswer: ""
      }
    ]
  }
];

const DISMISSED_ITEMS = new Set<string>();

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

export async function fetchTimelineResources(
  userId: string,
  weekStart: string,
  userType: 'teacher' | 'student'
): Promise<(Assignment | Quiz)[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    const filteredResources = MOCK_TIMELINE_RESOURCES.filter(resource => {
      if (!resource.dueDate) return false;
      
      const resourceDate = new Date(resource.dueDate);
      const isInWeek = resourceDate >= weekStartDate && resourceDate < weekEndDate;
      
      if (DISMISSED_ITEMS.has(resource.id)) {
        return false;
      }
      
      if (userType === 'student') {
        const now = new Date();
        return isInWeek && resourceDate >= now;
      }
      
      return isInWeek;
    });

    filteredResources.sort((a, b) => {
      const dateA = new Date(a.dueDate || '').getTime();
      const dateB = new Date(b.dueDate || '').getTime();
      return dateA - dateB;
    });

    console.log(`MOCK: Returning ${filteredResources.length} timeline resources for ${userType} ${userId} in week starting ${weekStart}`);
    console.log("TIMELINE RESOURCES DATA:", filteredResources);
    console.log("RESOURCE IDs:", filteredResources.map(r => r.id));
    console.log("RESOURCE TITLES:", filteredResources.map(r => r.title));
    console.log("RESOURCE TYPES:", filteredResources.map(r => 'questions' in r ? 'QUIZ' : 'ASSIGNMENT'));
    console.log("DUE DATES:", filteredResources.map(r => r.dueDate));
    console.log("DISMISSED ITEMS COUNT:", DISMISSED_ITEMS.size);
    console.log("WEEK RANGE:", {
      start: weekStartDate.toISOString(),
      end: weekEndDate.toISOString()
    });
    
    return filteredResources;
  }

  try {
    const response = await apiClient.get(`/${userType}s/${userId}/timeline/resources`, {
      params: { 
        weekStart,
        view: 'timeline'
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}


export async function dismissTimelineItem(itemId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(300);
    
    const itemExists = MOCK_TIMELINE_RESOURCES.some(resource => resource.id === itemId);
    
    if (!itemExists) {
      console.error(`MOCK: Timeline item with ID ${itemId} not found for dismissal`);
      throw new Error(`Timeline item not found: ${itemId}`);
    }
    
    DISMISSED_ITEMS.add(itemId);
    
    console.log(`MOCK: Dismissed timeline item ${itemId}`);
    console.log("DISMISSED ITEM ID:", itemId);
    console.log("TOTAL DISMISSED ITEMS:", DISMISSED_ITEMS.size);
    console.log("DISMISSED ITEM IDs:", Array.from(DISMISSED_ITEMS));
    
    return;
  }

  try {
    await apiClient.delete(`/timeline/items/${itemId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function restoreTimelineItem(itemId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(300);
    
    if (!DISMISSED_ITEMS.has(itemId)) {
      console.warn(`MOCK: Timeline item ${itemId} was not dismissed`);
      return;
    }
    
    DISMISSED_ITEMS.delete(itemId);
    
    console.log(`MOCK: Restored timeline item ${itemId}`);
    console.log("RESTORED ITEM ID:", itemId);
    console.log("REMAINING DISMISSED ITEMS:", DISMISSED_ITEMS.size);
    
    return;
  }

  try {
    await apiClient.post(`/timeline/items/${itemId}/restore`);
  } catch (error) {
    return handleApiError(error);
  }
}


export async function clearDismissedTimelineItems(): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(300);
    
    const dismissedCount = DISMISSED_ITEMS.size;
    DISMISSED_ITEMS.clear();
    
    console.log(`MOCK: Cleared all ${dismissedCount} dismissed timeline items`);
    console.log("CLEARED DISMISSED ITEMS COUNT:", dismissedCount);
    console.log("REMAINING DISMISSED ITEMS:", DISMISSED_ITEMS.size);
    
    return;
  }

  try {
    await apiClient.delete('/timeline/items/dismissed');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getTimelineStats(
  userId: string,
  userType: 'teacher' | 'student'
): Promise<{
  totalUpcoming: number;
  overdue: number;
  completed: number;
  upcomingThisWeek: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(400);
    
    const now = new Date();
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const allResources = MOCK_TIMELINE_RESOURCES.filter(resource => 
      !DISMISSED_ITEMS.has(resource.id)
    );
    
    const stats = {
      totalUpcoming: allResources.filter(resource => {
        if (!resource.dueDate) return false;
        return new Date(resource.dueDate) >= now;
      }).length,
      overdue: allResources.filter(resource => {
        if (!resource.dueDate) return false;
        return new Date(resource.dueDate) < now;
      }).length,
      completed: DISMISSED_ITEMS.size,
      upcomingThisWeek: allResources.filter(resource => {
        if (!resource.dueDate) return false;
        const dueDate = new Date(resource.dueDate);
        return dueDate >= weekStart && dueDate < weekEnd && dueDate >= now;
      }).length
    };
    
    console.log(`MOCK: Returning timeline stats for ${userType} ${userId}`);
    console.log("TIMELINE STATS DATA:", stats);
    console.log("CALCULATION DETAILS:", {
      now: now.toISOString(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      totalResources: allResources.length,
      dismissedCount: DISMISSED_ITEMS.size
    });
    
    return stats;
  }

  try {
    const response = await apiClient.get(`/${userType}s/${userId}/timeline/stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function addCustomTimelineItem(
  itemData: Omit<Assignment, "id" | "createdAt" | "submissions"> | Omit<Quiz, "id">
): Promise<Assignment | Quiz> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    let newItem: Assignment | Quiz;
    
    if ('deliveryMode' in itemData) {
      newItem = {
        ...itemData,
        id: `timeline-task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        submissions: []
      } as Assignment;
    } else {
      newItem = {
        ...itemData,
        id: `timeline-quiz-${Date.now()}`
      } as Quiz;
    }
    
    MOCK_TIMELINE_RESOURCES.push(newItem);
    
    console.log("MOCK: Added custom timeline item");
    console.log("ITEM DATA PROVIDED:", itemData);
    console.log("CREATED TIMELINE ITEM:", newItem);
    console.log("NEW ITEM ID:", newItem.id);
    console.log("ITEM TYPE:", 'deliveryMode' in newItem ? 'ASSIGNMENT' : 'QUIZ');
    
    return newItem;
  }

  try {
    const response = await apiClient.post("/timeline/items/custom", itemData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}