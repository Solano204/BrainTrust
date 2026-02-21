import { CourseId, UnitId } from "../valueObjects";
import { Assignment, Page, CourseUnit, Question, Quiz, Submission, UnitResource, calificationStudent} from "../entities/CourseEntities";
import { AssignmentId, Document, Score, UserId} from "../valueObjects/CourseValues";
import { DeliveryMode } from "@/components/teacher/task-view-information-teacher";


const MOCK_COURSE_ID = "COURSE-DES-401";
const MOCK_UNIT_ID = "UNIT-1";

export const mockUnitsDatabase: CourseUnit[] = [
    {
        id: MOCK_UNIT_ID,
        courseId: MOCK_COURSE_ID,
        name: "Module 1: Foundations of Design Thinking",
        description: "Explore the first two phases of the design thinking framework and necessary tools.",
        numUnity: 1,
        urlImage: null,
        resources: [

            {
                id: "PAGE-101V",
                courseId: MOCK_COURSE_ID, // Mapped new required field
                unitId: MOCK_UNIT_ID, // Mapped new required field
                title: "Video: Empathy Mapping & User Interviews",
                welcomeTitle: "Welcome to Lesson 1.1", // Mapped new required field
                welcomeSubtitle: "Start your journey with empathy.", // Mapped new required field
                sectionTitle: "1. Watch Video & Take Notes", // Mapped new required field
                sectionContent: "The goal of this video is to understand effective questioning techniques.", // Mapped new required field
                createdAt: "2025-10-01T10:00:00Z", // Mapped new required field
                attachments: [], // Mapped new required field
                urlsSupport: ["https://example.com/embed/empathy-vid"], // Mapped new required field (using old video url)
            } as Page,

            {
                id: "PAGE-102D",
                courseId: MOCK_COURSE_ID, // Mapped new required field
                unitId: MOCK_UNIT_ID, // Mapped new required field
                title: "Reading: The Definitive Guide to Persona Creation",
                welcomeTitle: "Key Resource Library", // Mapped new required field
                welcomeSubtitle: "Essential documents for Module 1.", // Mapped new required field
                sectionTitle: "2. Download and Read Materials", // Mapped new required field
                sectionContent: "This section contains all PDF guides necessary for the unit assignment.", // Mapped new required field
                createdAt: "2025-10-01T10:00:00Z", // Mapped new required field
                attachments: [
                    { name: "PersonaTemplate.pdf", storagePath: "/docs/P-T", createdAt: "2025-01-10T08:00:00Z" },
                    { name: "InterviewScript.txt", storagePath: "/docs/I-S", createdAt: "2025-01-10T08:00:00Z" },
                ] as Document[], // Mapped new required field (using old documents)
                urlsSupport: ["https://example.com/external-reading"], // Mapped new required field
            } as Page,

            {
                id: "ASSIGN-I1",
                title: "Individual: Persona Creation",
                courseId: MOCK_COURSE_ID,
                unitId: MOCK_UNIT_ID,
                description: "Create one detailed user persona based on research data provided in the supplementary document.",
                createdAt: "2025-10-01T10:00:00Z",
                attachments: [] as Document[],
                urls: ["https://miro.com/template/persona-board"],
                deliveryMode: "INDIVIDUAL" as DeliveryMode,
                dueDate: "2025-11-15T23:59:00Z",
                maxScore: { value: 100, maxPoints: 100 } as Score,
                instructions: "Your final submission must include the persona artifact (PDF/PNG) and a brief justification (max 200 words).",
                submissions: [] as Submission[],
                allowLateSubmissions: true,
            } as Assignment,

            {
                id: "ASSIGN-G2",
                title: "Group: Problem Statement Definition",
                courseId: MOCK_COURSE_ID,
                unitId: MOCK_UNIT_ID,
                description: "Collaboratively define a clear and actionable problem statement for your chosen project area.",
                createdAt: "2025-10-10T10:00:00Z",
                attachments: [] as Document[],
                urls: [],
                deliveryMode: "GROUP" as DeliveryMode,
                dueDate: "2025-11-25T23:59:00Z",
                maxScore: { value: 50, maxPoints: 50 } as Score,
                instructions: "One team member submits the final 'How Might We' statement and supporting arguments.",
                submissions: [] as Submission[],
                allowLateSubmissions: false,
                links: ["https://example.com/problem-statement-guidelines", "https://example.com/problem-statement-template"],
            } as Assignment,

            {
                id: "QUIZ-C1",
                description: "Quick quiz covering the core concepts of Empathy and Define phases.",
                courseUnitId: MOCK_UNIT_ID,
                title: "Concept Check 1",
                maxGrade: 10,
                timeLimit: 20, // 20 minutes
                passingScore: 70,
                dueDate: "2025-11-16T23:59:00Z",
                acceptLateSubmissions: false,
                questions: [
                    { id: 'Q1', type: 'multiple-choice', text: 'Which phase comes after Empathy in Design Thinking?', maxPoints: 2, question: 'Q1 text', points: 2, options: ['Define', 'Ideate', 'Test'], correctAnswer: 0 }
                ] as Question[],
            } as Quiz,

            {
                id: "QUIZ-A2",
                description: "Application-based quiz where you analyze a short scenario.",
                courseUnitId: MOCK_UNIT_ID,
                title: "Application Scenario Test",
                maxGrade: 25,
                timeLimit: 45, // 45 minutes
                passingScore: 60,
                dueDate: "2025-11-30T23:59:00Z",
                acceptLateSubmissions: true,
                questions: [
                    { id: 'Q2', type: 'open-ended', text: 'Explain the difference between a user goal and a user need in 50 words.', maxPoints: 15, question: 'Q2 text', points: 15, expectedAnswer: 'A good answer should mention goals are what the user wants to achieve, needs are the required actions to achieve the goal.' }
                ] as Question[],
            } as Quiz,
        ],
    },
];

/**
 * Simulates fetching CourseUnit data from an API based on CourseId and UnitId.
 * @param courseId The ID of the parent course.
 * @param unitId The ID of the specific unit.
 * @returns A Promise resolving to the CourseUnit data, or null if not found.
 */
export async function fetchUnitDataMock(
  courseId: CourseId,
  unitId: UnitId
): Promise<CourseUnit | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.info(`Fetching data for Course ID: ${courseId}, Unit ID: ${unitId}`);
  const unit = mockUnitsDatabase.find(
    (u) => u.id === unitId && u.courseId === courseId
  );

  return unit || null;
}







interface StudentScore {
    score: number | null;
    max: number;
}

interface StudentRow {
    studentId: UserId;
    name: string;
    totalPercentage: number | null;
    scores: { [taskId: AssignmentId]: StudentScore };
}

interface TaskColumn {
    id: AssignmentId;
    name: string;
    maxPoints: number;
    unitName: string;
}

export interface GradebookData {
    professor: string;
    tasks: TaskColumn[];
    students: StudentRow[];
}


const MOCK_RAW_CALIFICATIONS: calificationStudent[] = [
    // Alice Smith (USER-101)
    { id: "S1-A1", student: { studentId: "USER-101", nameStudent: "Alice Smith", taskId: "SUB-001", calification: 45 }, task: { id: "UX-P1", nameTask: "Research Plan", maxPoints: 50, unitId: "U-1", unitName: "Research", CourseId: "C-UX" }, total: null },
    { id: "S1-Q1", student: { studentId: "USER-101", nameStudent: "Alice Smith", taskId: "SUB-002", calification: 18 }, task: { id: "UX-Q1", nameTask: "Midterm Quiz", maxPoints: 20, unitId: "U-3", unitName: "Testing", CourseId: "C-UX" }, total: null },
    { id: "S1-F1", student: { studentId: "USER-101", nameStudent: "Alice Smith", taskId: "SUB-003", calification: 2 }, task: { id: "UX-F", nameTask: "Final Project", maxPoints: 30, unitId: "U-5", unitName: "Final", CourseId: "C-UX" }, total: null },
    
    // Bob Johnson (USER-102)
    { id: "S2-A1", student: { studentId: "USER-102", nameStudent: "Bob Johnson", taskId: "SUB-004", calification: 48 }, task: { id: "UX-P1", nameTask: "Research Plan", maxPoints: 50, unitId: "U-1", unitName: "Research", CourseId: "C-UX",  }, total: null },
    { id: "S2-Q1", student: { studentId: "USER-102", nameStudent: "Bob Johnson", taskId: "SUB-005", calification: 15 }, task: { id: "UX-Q1", nameTask: "Midterm Quiz", maxPoints: 20, unitId: "U-3", unitName: "Testing", CourseId: "C-UX",  }, total: null },
    { id: "S2-F1", student: { studentId: "USER-102", nameStudent: "Bob Johnson", taskId: "SUB-006", calification: 28 }, task: { id: "UX-F", nameTask: "Final Project", maxPoints: 30, unitId: "U-5", unitName: "Final", CourseId: "C-UX",  }, total: null },

    // Carlos Diaz (USER-103)
    { id: "S3-A1", student: { studentId: "USER-103", nameStudent: "Carlos Diaz", taskId: "SUB-007", calification: 40 }, task: { id: "UX-P1", nameTask: "Research Plan", maxPoints: 50, unitId: "U-1", unitName: "Research", CourseId: "C-UX",  }, total: null },
    { id: "S3-Q1", student: { studentId: "USER-103", nameStudent: "Carlos Diaz", taskId: "SUB-008", calification: 22 }, task: { id: "UX-Q1", nameTask: "Midterm Quiz", maxPoints: 20, unitId: "U-3", unitName: "Testing", CourseId: "C-UX",  }, total: null },
    { id: "S3-F1", student: { studentId: "USER-103", nameStudent: "Carlos Diaz", taskId: "SUB-009", calification: 25 }, task: { id: "UX-F", nameTask: "Final Project", maxPoints: 30, unitId: "U-5", unitName: "Final", CourseId: "C-UX",  }, total: null },
];


export const transformCalifications = (rawCalifications: calificationStudent[]): GradebookData => {
    if (rawCalifications.length === 0) {
        return {  professor: "Professor Smith", tasks: [], students: [] };
    }

    const studentMap = new Map<UserId, StudentRow>();
    const taskMap = new Map<AssignmentId, TaskColumn>();

    for (const record of rawCalifications) {
        const studentId = record.student.studentId;
        const taskId = record.task.id;

        if (!taskMap.has(taskId)) {
            taskMap.set(taskId, {
                id: taskId,
                name: record.task.nameTask,
                maxPoints: record.task.maxPoints || 0,
                unitName: record.task.unitName,
            });
        }

        if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
                studentId: studentId,
                name: record.student.nameStudent,
                totalPercentage: null,
                scores: {},
            });
        }

        studentMap.get(studentId)!.scores[taskId] = {
            score: record.student.calification,
            max: record.task.maxPoints || 0,
        };
    }

    const tasks = Array.from(taskMap.values());
    const students = Array.from(studentMap.values());

    students.forEach(student => {
        let pointsEarned = 0;
        let pointsPossibleGraded = 0;
        let pointsPossibleTotal = 0;
        let fullyGraded = true;

        for (const task of tasks) {
            pointsPossibleTotal += task.maxPoints;
            const scoreData = student.scores[task.id];
            
            if (scoreData) {
                pointsPossibleGraded += scoreData.max;
                if (scoreData.score === null) {
                    fullyGraded = false;
                } else {
                    pointsEarned += scoreData.score;
                }
            } else {
                 fullyGraded = false;
            }
        }

        if (pointsPossibleGraded > 0) {
            const percentage = (pointsEarned / pointsPossibleGraded) * 100;
            student.totalPercentage = fullyGraded ? Math.round(percentage) : null;
        }
    });

    return { professor: "Professor Smith", tasks, students };
};



export const generateMockCalifications = (): calificationStudent[] => {
  return [
    { 
      id: "S1-A1", 
      student: { 
        studentId: "USER-101", 
        nameStudent: "Alice Smith", 
        taskId: "SUB-001", 
        calification: 45 
      }, 
      task: { 
        id: "UX-P1", 
        nameTask: "Research Plan", 
        maxPoints: 50, 
        unitId: "U-1", 
        unitName: "Research", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    { 
      id: "S1-Q1", 
      student: { 
        studentId: "USER-101", 
        nameStudent: "Alice Smith", 
        taskId: "SUB-002", 
        calification: 18 
      }, 
      task: { 
        id: "UX-Q1", 
        nameTask: "Midterm Quiz", 
        maxPoints: 20, 
        unitId: "U-3", 
        unitName: "Testing", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    { 
      id: "S1-F1", 
      student: { 
        studentId: "USER-101", 
        nameStudent: "Alice Smith", 
        taskId: "SUB-003", 
        calification: 2 
      }, 
      task: { 
        id: "UX-F", 
        nameTask: "Final Project", 
        maxPoints: 30, 
        unitId: "U-5", 
        unitName: "Final", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    

    { 
      id: "S2-A1", 
      student: { 
        studentId: "USER-102", 
        nameStudent: "Bob Johnson", 
        taskId: "SUB-004", 
        calification: 48 
      }, 
      task: { 
        id: "UX-P1", 
        nameTask: "Research Plan", 
        maxPoints: 50, 
        unitId: "U-1", 
        unitName: "Research", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    { 
      id: "S2-Q1", 
      student: { 
        studentId: "USER-102", 
        nameStudent: "Bob Johnson", 
        taskId: "SUB-005", 
        calification: 15 
      }, 
      task: { 
        id: "UX-Q1", 
        nameTask: "Midterm Quiz", 
        maxPoints: 20, 
        unitId: "U-3", 
        unitName: "Testing", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    { 
      id: "S2-F1", 
      student: { 
        studentId: "USER-102", 
        nameStudent: "Bob Johnson", 
        taskId: "SUB-006", 
        calification: 28 
      }, 
      task: { 
        id: "UX-F", 
        nameTask: "Final Project", 
        maxPoints: 30, 
        unitId: "U-5", 
        unitName: "Final", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },

    // Carlos Diaz (USER-103)
    { 
      id: "S3-A1", 
      student: { 
        studentId: "USER-103", 
        nameStudent: "Carlos Diaz", 
        taskId: "SUB-007", 
        calification: 40 
      }, 
      task: { 
        id: "UX-P1", 
        nameTask: "Research Plan", 
        maxPoints: 50, 
        unitId: "U-1", 
        unitName: "Research", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    { 
      id: "S3-Q1", 
      student: { 
        studentId: "USER-103", 
        nameStudent: "Carlos Diaz", 
        taskId: "SUB-008", 
        calification: 22 
      }, 
      task: { 
        id: "UX-Q1", 
        nameTask: "Midterm Quiz", 
        maxPoints: 20, 
        unitId: "U-3", 
        unitName: "Testing", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
    { 
      id: "S3-F1", 
      student: { 
        studentId: "USER-103", 
        nameStudent: "Carlos Diaz", 
        taskId: "SUB-009", 
        calification: 25 
      }, 
      task: { 
        id: "UX-F", 
        nameTask: "Final Project", 
        maxPoints: 30, 
        unitId: "U-5", 
        unitName: "Final", 
        CourseId: "C-UX" 
      }, 
      total: null 
    },
  ];
};