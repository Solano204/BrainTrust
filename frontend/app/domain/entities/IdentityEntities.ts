

import { PersonId, UserId, Email, Address } from "../valueObjects";

export type Role = 'TEACHER' | 'STUDENT' | 'ADMIN';

export interface Person {
  id: PersonId;
  firstName: string;
  lastName: string;
  gender: string | null;
  phone: string | null;
  registrationDate: string;
  imagePath: string | null;
  address: Address | null;
}

export interface User {
  id: UserId;
  personId: PersonId;
  person: Person;
  email: Email;
  
  role: Role;
  active: boolean;
}