/**
 * CURP Mexican standard: 18 chars
 * Format: AAAA YYMMDD H/M EEEAAA X N
 *   positions 0-3:  consonants from name
 *   positions 4-5:  YY (birth year)
 *   positions 6-7:  MM (birth month)
 *   positions 8-9:  DD (birth day)
 *   position  10:   H or M (sex)
 *   ...rest
 */

export interface CurpBirthInfo {
  birthDate: string;   // ISO "YYYY-MM-DD"
  age: number;
  gender: "MALE" | "FEMALE";
  valid: boolean;
  error?: string;
}

const CURP_REGEX = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/;

export function extractInfoFromCurp(curp: string): CurpBirthInfo | null {
  if (!curp || curp.length !== 18) return null;
  const upper = curp.toUpperCase().trim();
  if (!CURP_REGEX.test(upper)) return null;

  const yy = parseInt(upper.substring(4, 6), 10);
  const mm = parseInt(upper.substring(6, 8), 10);
  const dd = parseInt(upper.substring(8, 10), 10);
  const sexChar = upper[10]; // H = Male, M = Female

  // Determine century
  const currentYearShort = new Date().getFullYear() % 100;
  const fullYear = yy <= currentYearShort ? 2000 + yy : 1900 + yy;

  // Validate month/day
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return { birthDate: "", age: 0, gender: "MALE", valid: false, error: "Fecha inválida en CURP" };
  }

  const birthDateObj = new Date(fullYear, mm - 1, dd);
  if (
    birthDateObj.getFullYear() !== fullYear ||
    birthDateObj.getMonth() !== mm - 1 ||
    birthDateObj.getDate() !== dd
  ) {
    return { birthDate: "", age: 0, gender: "MALE", valid: false, error: "Fecha inválida en CURP" };
  }

  const today = new Date();
  let age = today.getFullYear() - fullYear;
  if (
    today.getMonth() < mm - 1 ||
    (today.getMonth() === mm - 1 && today.getDate() < dd)
  ) {
    age--;
  }

  // Validate age range 10–90
  if (age < 10 || age > 90) {
    return {
      birthDate: "",
      age,
      gender: sexChar === "H" ? "MALE" : "FEMALE",
      valid: false,
      error: `Edad fuera del rango permitido (10-90 años). Edad calculada: ${age}`,
    };
  }

  const birthDateStr = `${fullYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;

  return {
    birthDate: birthDateStr,
    age,
    gender: sexChar === "H" ? "MALE" : "FEMALE",
    valid: true,
  };
}

export function formatBirthDateDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function validateCurpFormat(curp: string): boolean {
  if (!curp) return true; // optional field
  return CURP_REGEX.test(curp.toUpperCase().trim());
}

export function validateRfcFormat(rfc: string): boolean {
  if (!rfc) return true;
  return rfc.length >= 12 && rfc.length <= 13;
}