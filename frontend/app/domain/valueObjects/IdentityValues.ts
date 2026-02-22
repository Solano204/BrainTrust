
export type PersonId = string;
export type UserId = string;


export interface Address {
  street: string;
  colony: string | null;
  municipality: string | null;
  state: string | null;
  postalCode: string;
}


export type Email = string;
