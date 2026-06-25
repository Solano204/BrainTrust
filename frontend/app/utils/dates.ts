import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const date = parseISO(isoString)
  if (!isValid(date)) return ''
  return format(date, "dd/MM/yyyy, HH:mm:ss", { locale: es })
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const date = parseISO(isoString)
  if (!isValid(date)) return ''
  return format(date, "dd/MM/yyyy", { locale: es })
}

export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const date = parseISO(isoString)
  if (!isValid(date)) return ''
  return format(date, "HH:mm", { locale: es })
}

/**
 * Call this in the browser before sending a datetime-local value to a server action.
 * Converts the local time string to a UTC ISO string so Vercel (UTC) handles it correctly.
 */
export function localInputToUTC(datetimeLocalValue: string | null | undefined): string | null {
  if (!datetimeLocalValue) return null
  const date = parseISO(datetimeLocalValue)
  if (!isValid(date)) return null
  return date.toISOString()
}
