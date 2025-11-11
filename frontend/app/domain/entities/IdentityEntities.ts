// ----------------------------------------------------
// Enums
// ----------------------------------------------------

import { PersonId, UserId, Email, Address } from "../valueObjects";

/** Represents com.braintrust.identity.domain.model.Role */
export type Role = 'TEACHER' | 'STUDENT' | 'ADMIN';

// ----------------------------------------------------
// ENTITY
// ----------------------------------------------------
/** Represents com.braintrust.identity.domain.model.Person (Entity) */
export interface Person {
  id: PersonId;
  firstName: string;
  lastName: string;
  gender: string | null;
  phone: string | null;
  /** Java: LocalDate, serialized to ISO 8601 date string (YYYY-MM-DD) */
  registrationDate: string;
  imagePath: string | null; // Maps to Java's imagePath
  address: Address | null; // Nullable if the address is optional
}

/** * Represents the full User Account, which typically aggregates the Person details 
 * and login details (like Email and Role). 
 * NOTE: The Java code for User was not provided, but this is a common inferred structure.
 */
export interface User {
  id: UserId;
  personId: PersonId;
  person: Person;
  email: Email;
  
  role: Role;
  active: boolean;
}