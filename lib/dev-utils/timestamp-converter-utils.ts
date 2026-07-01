/**
 * Unix Timestamp Utilities
 * Handles conversion, formatting, and manipulation of Unix timestamps
 */

// ── types ──────────────────────────────────────────────────────────────────

export interface TimestampFormats {
  unix: {
    seconds: number;
    milliseconds: number;
  };
  iso: string;
  rfc2822: string;
  utc: string;
  locale: string;
  short: string;
  long: string;
}

export interface DateInfo {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
  quarter: number;
  isLeapYear: boolean;
  isWeekend: boolean;
  timezone: string;
  offset: string;
}

export interface RelativeTime {
  value: number;
  unit: "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
  direction: "past" | "future";
  text: string;
}

// ── Validation ──────────────────────────────────────────────────────────────

/**
 * Detect if input is Unix timestamp (seconds or milliseconds) or ISO date
 */
export function detectInputType(input: string): "seconds" | "milliseconds" | "iso" | "invalid" {
  const trimmed = input.trim();

  // Check if ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return "iso";
  }

  // Check if number
  if (!/^\d+$/.test(trimmed)) {
    return "invalid";
  }

  const num = parseInt(trimmed, 10);

  // Milliseconds: typically 13 digits (1000000000000 to 9999999999999)
  if (trimmed.length === 13 && num >= 1000000000000 && num <= 9999999999999) {
    return "milliseconds";
  }

  // Seconds: typically 10 digits (1000000000 to 999999999999)
  if (trimmed.length === 10 && num >= 1000000000 && num <= 999999999999) {
    return "seconds";
  }

  // Could be seconds if < 10 digits but valid timestamp
  if (num > 0 && num < 1000000000000) {
    return "seconds";
  }

  return "invalid";
}

/**
 * Validate Unix timestamp (accepts both seconds and milliseconds)
 */
export function isValidTimestamp(value: number): boolean {
  return (
    typeof value === "number" && isFinite(value) && value >= 0 && value <= 999999999999999 // Max safe JS number for timestamps
  );
}

/**
 * Validate date string (YYYY-MM-DD or ISO 8601)
 */
export function isValidDateString(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Parse flexible timestamp input (auto-detects format)
 */
export function parseTimestampInput(input: string): number | null {
  const type = detectInputType(input);

  if (type === "invalid") return null;

  const num = parseInt(input.trim(), 10);

  if (!isValidTimestamp(num)) return null;

  // Convert milliseconds to seconds if needed
  if (type === "milliseconds") {
    return num / 1000;
  }

  return num;
}

// ── Conversion ──────────────────────────────────────────────────────────────

/**
 * Convert Unix timestamp (seconds) to Date object
 */
export function timestampToDate(unixSeconds: number): Date {
  return new Date(unixSeconds * 1000);
}

/**
 * Convert Date object to Unix timestamp (seconds)
 */
export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get Unix timestamp in both seconds and milliseconds
 */
export function getCurrentTimestamp() {
  const now = new Date();
  return {
    seconds: Math.floor(now.getTime() / 1000),
    milliseconds: now.getTime(),
  };
}

// ── Formatting ──────────────────────────────────────────────────────────────

/**
 * Format timestamp to ISO 8601
 */
export function toISO8601(unixSeconds: number): string {
  const date = timestampToDate(unixSeconds);
  return date.toISOString();
}

/**
 * Format timestamp to RFC 2822
 */
export function toRFC2822(unixSeconds: number): string {
  const date = timestampToDate(unixSeconds);
  return date.toUTCString();
}

/**
 * Format timestamp to locale date and time
 */
export function toLocaleString(unixSeconds: number, timezone?: string): string {
  const date = timestampToDate(unixSeconds);

  try {
    return date.toLocaleString("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Format timestamp to short date (MM/DD/YYYY)
 */
export function toShortDate(unixSeconds: number, timezone?: string): string {
  const date = timestampToDate(unixSeconds);

  try {
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Format timestamp to long date (Monday, June 3, 2025)
 */
export function toLongDate(unixSeconds: number, timezone?: string): string {
  const date = timestampToDate(unixSeconds);

  try {
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
}

/**
 * Format timestamp to UTC format (Mon, 03 Jun 2025 12:00:00 GMT)
 */
export function toUTCFormat(unixSeconds: number): string {
  const date = timestampToDate(unixSeconds);
  return date.toUTCString();
}

/**
 * Get all timestamp formats at once
 */
export function getAllFormats(unixSeconds: number, timezone?: string): TimestampFormats {
  return {
    unix: {
      seconds: unixSeconds,
      milliseconds: unixSeconds * 1000,
    },
    iso: toISO8601(unixSeconds),
    rfc2822: toRFC2822(unixSeconds),
    utc: toUTCFormat(unixSeconds),
    locale: toLocaleString(unixSeconds, timezone),
    short: toShortDate(unixSeconds, timezone),
    long: toLongDate(unixSeconds, timezone),
  };
}

// ── Date Information ────────────────────────────────────────────────────────

/**
 * Get detailed date information
 */
export function getDateInfo(unixSeconds: number, timezone?: string): DateInfo {
  const date = timestampToDate(unixSeconds);

  // Get local values
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const dateNum = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  // Day of week
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    date.getUTCDay()
  ];

  // Day of year
  const start = new Date(Date.UTC(year, 0, 0));
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);

  // Week number (ISO 8601)
  const tempDate = new Date(Date.UTC(year, month - 1, dateNum));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  // Quarter
  const quarter = Math.ceil(month / 3);

  // Leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  // Weekend
  const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;

  return {
    year,
    month,
    date: dateNum,
    hours,
    minutes,
    seconds,
    milliseconds,
    dayOfWeek,
    dayOfYear,
    weekNumber,
    quarter,
    isLeapYear,
    isWeekend,
    timezone: timezone || "UTC",
    offset: getTimezoneOffset(timezone),
  };
}

/**
 * Get timezone offset
 */
export function getTimezoneOffset(timezone?: string): string {
  if (!timezone || timezone === "UTC") return "+00:00";

  try {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
    const diff = Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours >= 0 ? "+" : ""}${String(hours).padStart(2, "0")}:${String(
      Math.abs(minutes),
    ).padStart(2, "0")}`;
  } catch {
    return "+00:00";
  }
}

// ── Relative Time ──────────────────────────────────────────────────────────

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(unixSeconds: number): RelativeTime {
  const now = getCurrentTimestamp().seconds;
  const diff = now - unixSeconds;
  const isPast = diff > 0;

  const seconds = Math.abs(diff);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let value: number;
  let unit: RelativeTime["unit"];

  if (years > 0) {
    value = years;
    unit = "year";
  } else if (months > 0) {
    value = months;
    unit = "month";
  } else if (weeks > 0) {
    value = weeks;
    unit = "week";
  } else if (days > 0) {
    value = days;
    unit = "day";
  } else if (hours > 0) {
    value = hours;
    unit = "hour";
  } else if (minutes > 0) {
    value = minutes;
    unit = "minute";
  } else {
    value = seconds;
    unit = "second";
  }

  const unitText = value === 1 ? unit : unit + "s";
  const text = isPast ? `${value} ${unitText} ago` : `in ${value} ${unitText}`;

  return {
    value,
    unit,
    direction: isPast ? "past" : "future",
    text,
  };
}

// ── Time Calculations ──────────────────────────────────────────────────────

/**
 * Calculate difference between two timestamps (in seconds)
 */
export function calculateTimeDifference(
  timestamp1: number,
  timestamp2: number,
): {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  total: {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
  };
  text: string;
} {
  const diff = Math.abs(timestamp1 - timestamp2);

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  const text = [
    days > 0 ? `${days} day${days !== 1 ? "s" : ""}` : null,
    hours > 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : null,
    minutes > 0 ? `${minutes} minute${minutes !== 1 ? "s" : ""}` : null,
    seconds > 0 ? `${seconds} second${seconds !== 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    seconds,
    minutes,
    hours,
    days,
    total: {
      seconds: diff,
      minutes: Math.floor(diff / 60),
      hours: Math.floor(diff / 3600),
      days: Math.floor(diff / 86400),
    },
    text: text || "0 seconds",
  };
}

// ── Special Timestamps ──────────────────────────────────────────────────────

/**
 * Get Unix timestamp for start of day
 */
export function getStartOfDay(date: Date = new Date()): number {
  const newDate = new Date(date);
  newDate.setUTCHours(0, 0, 0, 0);
  return dateToTimestamp(newDate);
}

/**
 * Get Unix timestamp for end of day
 */
export function getEndOfDay(date: Date = new Date()): number {
  const newDate = new Date(date);
  newDate.setUTCHours(23, 59, 59, 999);
  return dateToTimestamp(newDate);
}

/**
 * Get Unix timestamp for start of month
 */
export function getStartOfMonth(date: Date = new Date()): number {
  const newDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return dateToTimestamp(newDate);
}

/**
 * Get Unix timestamp for end of month
 */
export function getEndOfMonth(date: Date = new Date()): number {
  const newDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
  return dateToTimestamp(newDate);
}

/**
 * Get Unix timestamp for start of year
 */
export function getStartOfYear(date: Date = new Date()): number {
  const newDate = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return dateToTimestamp(newDate);
}

/**
 * Get Unix timestamp for end of year
 */
export function getEndOfYear(date: Date = new Date()): number {
  const newDate = new Date(Date.UTC(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
  return dateToTimestamp(newDate);
}

/**
 * Get Unix timestamp for tomorrow
 */
export function getTomorrowTimestamp(): number {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return getStartOfDay(tomorrow);
}

/**
 * Get Unix timestamp for yesterday
 */
export function getYesterdayTimestamp(): number {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return getStartOfDay(yesterday);
}

// ── Timezone Support ────────────────────────────────────────────────────────

export const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Argentina/Buenos_Aires",
  "America/Sao_Paulo",
] as const;

export type Timezone = (typeof TIMEZONES)[number];

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbr(timezone: string): string {
  const abbrs: Record<string, string> = {
    UTC: "UTC",
    "Asia/Kolkata": "IST",
    "Asia/Shanghai": "CST",
    "Asia/Tokyo": "JST",
    "Asia/Bangkok": "ICT",
    "Asia/Singapore": "SGT",
    "Asia/Hong_Kong": "HKT",
    "Australia/Sydney": "AEDT",
    "Australia/Melbourne": "AEDT",
    "Europe/London": "GMT",
    "Europe/Paris": "CET",
    "Europe/Berlin": "CET",
    "Europe/Moscow": "MSK",
    "America/New_York": "EST",
    "America/Chicago": "CST",
    "America/Denver": "MDT",
    "America/Los_Angeles": "PST",
    "America/Toronto": "EST",
    "America/Mexico_City": "CST",
    "America/Argentina/Buenos_Aires": "ART",
    "America/Sao_Paulo": "BRT",
  };

  return abbrs[timezone] || timezone;
}

// ── Export Formats ────────────────────────────────────────────────────────

/**
 * Export timestamps to JSON
 */
export function exportToJSON(timestamp: number, format: TimestampFormats): string {
  return JSON.stringify(
    {
      timestamp: {
        seconds: format.unix.seconds,
        milliseconds: format.unix.milliseconds,
      },
      formats: {
        iso: format.iso,
        rfc2822: format.rfc2822,
        utc: format.utc,
        locale: format.locale,
      },
      generated: new Date().toISOString(),
    },
    null,
    2,
  );
}

/**
 * Export timestamps to CSV
 */
export function exportToCSV(timestamp: number, format: TimestampFormats): string {
  return `Format,Value
Unix Seconds,${format.unix.seconds}
Unix Milliseconds,${format.unix.milliseconds}
ISO 8601,${format.iso}
RFC 2822,${format.rfc2822}
UTC,${format.utc}
Locale,${format.locale}`;
}

/**
 * Export timestamps to Text
 */
export function exportToText(timestamp: number, format: TimestampFormats): string {
  return `Unix Timestamp Converter Export
Generated: ${new Date().toISOString()}

Unix Timestamp (Seconds): ${format.unix.seconds}
Unix Timestamp (Milliseconds): ${format.unix.milliseconds}

ISO 8601: ${format.iso}
RFC 2822: ${format.rfc2822}
UTC: ${format.utc}
Locale: ${format.locale}`;
}
