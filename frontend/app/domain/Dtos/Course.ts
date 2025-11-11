// 💡 IMPORTANT: These types should be imported from your domain file
import type { CourseId, CourseCode } from "@/app/domain/valueObjects/CourseValues";

/** * Interface for the list/card view of a Course. 
 * This is a subset of the full domain 'Course' entity.
 */
export interface CourseListItem {
  id: CourseId;
  code: CourseCode;
  name: string;
  students: number;
  lastAccess: string; // Time since last user access (UI friendly string)
  color: string; // Tailwind CSS class for visual accent
}