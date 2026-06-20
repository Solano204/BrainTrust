import { ZodError } from "zod"

export function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0].toString()] = err.message
    }
  })
  return errors
}

export function clearFieldError(
  errors: Record<string, string>,
  fieldName: string
): Record<string, string> {
  const newErrors = { ...errors }
  delete newErrors[fieldName]
  return newErrors
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/
  return phoneRegex.test(phone)
}

export function isValidPostalCode(postalCode: string): boolean {
  const postalRegex = /^[0-9]{4,10}$/
  return postalRegex.test(postalCode)
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, GIF, and WebP images are allowed'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    }
  }

  return { valid: true }
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number
} {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++

  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[@$!%*?&]/.test(password)) score++

  if ((password.match(/[0-9]/g) || []).length >= 2) score++
  if ((password.match(/[@$!%*?&]/g) || []).length >= 2) score++

  if (score <= 3) return { strength: 'weak', score }
  if (score <= 5) return { strength: 'medium', score }
  return { strength: 'strong', score }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
  return nameRegex.test(name) && name.length >= 2 && name.length <= 50
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
