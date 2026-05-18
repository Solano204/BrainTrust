import { CourseId, UnitId } from "../valueObjects";
import { Assignment, Page, CourseUnit, Question, Quiz, Submission, UnitResource, calificationStudent} from "../entities/CourseEntities";
import { AssignmentId, Document, Score, UserId} from "../valueObjects/CourseValues";
import { DeliveryMode } from "@/app/shared/models/assignment.model";


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

        ]
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
  ];
};