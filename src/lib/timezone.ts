// All "today / yesterday / this week" logic runs in the club's own timezone,
// not the visitor's — otherwise agents in different countries would see
// different Daily Booking lists for the same physical day.
const OPERATIONAL_TIMEZONE = "Asia/Bangkok";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: OPERATIONAL_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// "YYYY-MM-DD" — sortable and comparable as plain strings.
export function toBangkokDateString(date: Date): string {
  return dateFormatter.format(date);
}

export function bangkokToday(): string {
  return toBangkokDateString(new Date());
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return toBangkokDateString(date);
}

// Human-readable display for date-only values (bookings, invoices). Using
// the server's local timezone here would shift the date back a day for
// any server not already in Bangkok — the exact bug this file exists to
// prevent, just moved to the display layer instead of the query layer.
export function formatBangkokDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: OPERATIONAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
