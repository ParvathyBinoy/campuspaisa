import { BillRecurrence } from '../types';

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month string in YYYY-MM format
 */
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Safely parse YYYY-MM-DD into a local Date object without UTC drift
 */
export function parseLocalYMD(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Format date as DD MMM YYYY (e.g., 18 Oct 2026)
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalYMD(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format month 'YYYY-MM' as 'October 2026'
 */
export function formatMonthYear(monthStr: string): string {
  if (!monthStr || monthStr === 'all') return 'All Time';
  const parts = monthStr.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES_FULL[monthIdx]} ${year}`;
    }
  }
  return monthStr;
}

/**
 * Generate a dropdown list of recent and upcoming months for selection
 */
export function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  
  // 6 months in the future down to 18 months in the past
  for (let i = -3; i <= 15; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const label = `${MONTH_NAMES_FULL[d.getMonth()]} ${year}`;
    options.push({ value, label });
  }

  return options;
}

/**
 * Checks if a date is strictly in the past compared to today (local)
 */
export function isOverdue(dueDateStr: string): boolean {
  if (!dueDateStr) return false;
  const today = getTodayDateString();
  return dueDateStr < today;
}

/**
 * Checks if a due date is within upcoming `daysAhead` days (default 7 days)
 */
export function isUpcoming(dueDateStr: string, daysAhead: number = 7): boolean {
  if (!dueDateStr) return false;
  const today = getTodayDateString();
  if (dueDateStr < today) return false; // Already overdue

  const targetDate = parseLocalYMD(dueDateStr);
  const now = parseLocalYMD(today);
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysAhead;
}

/**
 * Calculates next recurrence due date based on recurrence pattern
 */
export function getNextDueDate(currentDueDateStr: string, recurrence: BillRecurrence): string {
  const current = parseLocalYMD(currentDueDateStr);
  const next = new Date(current.getTime());

  switch (recurrence) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'one-time':
    default:
      return currentDueDateStr;
  }

  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  const d = String(next.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
