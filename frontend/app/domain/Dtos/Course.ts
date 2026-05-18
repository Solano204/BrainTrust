
import type { CourseId, CourseCode } from "@/app/domain/valueObjects/CourseValues";

export interface CourseListItem {
  id: CourseId;
  code: CourseCode;
  name: string;
  students: number;
  lastAccess: string;
  color: string; 
}