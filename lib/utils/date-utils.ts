import { format as formatDate } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

// Dubai timezone (UTC+4, no DST)
export const DUBAI_TIMEZONE = "Asia/Dubai";

/**
 * Format a date in Dubai timezone
 * @param date - Date to format (can be Date object or ISO string)
 * @param formatStr - date-fns format string (e.g., "MMM d, HH:mm", "yyyy-MM-dd")
 * @returns Formatted date string in Dubai timezone
 */
export function formatDubaiTime(
  date: Date | string,
  formatStr: string = "MMM d, HH:mm"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, DUBAI_TIMEZONE, formatStr);
}

/**
 * Convert a date to Dubai timezone
 * @param date - Date to convert
 * @returns Date object adjusted to Dubai timezone
 */
export function toDubaiTime(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return toZonedTime(dateObj, DUBAI_TIMEZONE);
}

/**
 * Format a date with time in 12-hour format (e.g., "Feb 26, 8:30 PM")
 */
export function formatDubaiTime12h(date: Date | string): string {
  return formatDubaiTime(date, "MMM d, h:mm a");
}

/**
 * Format just the time in 12-hour format (e.g., "8:30 PM")
 */
export function formatDubaiTimeOnly(date: Date | string): string {
  return formatDubaiTime(date, "h:mm a");
}
