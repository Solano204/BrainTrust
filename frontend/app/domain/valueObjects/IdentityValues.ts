// ----------------------------------------------------
// IDs (Value Objects - serialized as strings)
// ----------------------------------------------------
/** Represents com.braintrust.identity.domain.valueobjects.PersonId */
export type PersonId = string;
/** Represents com.braintrust.identity.domain.valueobjects.UserId */
export type UserId = string; // Re-defined or imported from education types

// ----------------------------------------------------
// Complex Value Objects
// ----------------------------------------------------
/** Represents com.braintrust.identity.domain.valueobjects.Address */
export interface Address {
  street: string;
  colony: string | null;
  municipality: string | null;
  state: string | null;
  postalCode: string; // Enforced to be 5 digits
}

/** Represents com.braintrust.identity.domain.valueobjects.Email */
export type Email = string; // Stored as a string, validation logic remains on the backend.

// NOTE: Password Value Object is strictly for backend use (hash storage/comparison)
// It will not be exposed to the frontend in its object form.