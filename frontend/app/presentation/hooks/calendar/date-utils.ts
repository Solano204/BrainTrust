
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}


export function formatForAPI(date: Date): string {
  return date.toISOString().split('.')[0]; // Remove milliseconds
}

export function isInCurrentWeek(date: Date): boolean {
  const start = getStartOfWeek();
  const end = getEndOfWeek();
  return date >= start && date <= end;
}

export function getDaysUntilDue(dueDate: string | null): number {
  if (!dueDate) return Infinity;
  
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getTimelineUrgency(dueDate: string | null): "urgent" | "warning" | "normal" {
  if (!dueDate) return "normal";
  
  const daysUntilDue = getDaysUntilDue(dueDate);
  
  if (daysUntilDue < 0) return "urgent";
  if (daysUntilDue <= 2) return "warning";
  return "normal";
}