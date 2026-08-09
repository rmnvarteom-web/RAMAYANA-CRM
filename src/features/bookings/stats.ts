import { db } from "@/lib/db";
import { bangkokToday, addDaysToDateString, bangkokDayStartUtc } from "@/lib/timezone";

export interface BookingStats {
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
}

// Counts bookings by when they were created (agent activity), not by visit
// date — this answers "how many bookings did I make", not "who's arriving".
export async function getBookingStats(agencyId: string): Promise<BookingStats> {
  const today = bangkokToday();
  const todayStart = bangkokDayStartUtc(today);
  const tomorrowStart = bangkokDayStartUtc(addDaysToDateString(today, 1));
  const yesterdayStart = bangkokDayStartUtc(addDaysToDateString(today, -1));
  const sevenDaysStart = bangkokDayStartUtc(addDaysToDateString(today, -6));
  const thirtyDaysStart = bangkokDayStartUtc(addDaysToDateString(today, -29));

  const [today_, yesterday, last7Days, last30Days] = await Promise.all([
    db.booking.count({
      where: { agencyId, createdAt: { gte: todayStart, lt: tomorrowStart } },
    }),
    db.booking.count({
      where: { agencyId, createdAt: { gte: yesterdayStart, lt: todayStart } },
    }),
    db.booking.count({
      where: { agencyId, createdAt: { gte: sevenDaysStart, lt: tomorrowStart } },
    }),
    db.booking.count({
      where: { agencyId, createdAt: { gte: thirtyDaysStart, lt: tomorrowStart } },
    }),
  ]);

  return { today: today_, yesterday, last7Days, last30Days };
}

export interface DailyBookingPoint {
  date: string; // YYYY-MM-DD, Bangkok calendar day
  count: number;
  totalAmount: number;
}

// One point per calendar day in [from, to], zero-filled — the chart needs a
// continuous series, not just the days that happen to have bookings.
export async function getBookingsByDay(
  agencyId: string,
  from: string,
  to: string,
): Promise<DailyBookingPoint[]> {
  const fromStart = bangkokDayStartUtc(from);
  const toEnd = bangkokDayStartUtc(addDaysToDateString(to, 1));

  const bookings = await db.booking.findMany({
    where: { agencyId, createdAt: { gte: fromStart, lt: toEnd } },
    select: { createdAt: true, totalAmount: true },
  });

  const byDay = new Map<string, { count: number; totalAmount: number }>();
  for (const booking of bookings) {
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(
      booking.createdAt,
    );
    const entry = byDay.get(key) ?? { count: 0, totalAmount: 0 };
    entry.count += 1;
    entry.totalAmount += Number(booking.totalAmount);
    byDay.set(key, entry);
  }

  const points: DailyBookingPoint[] = [];
  let cursor = from;
  while (cursor <= to) {
    const entry = byDay.get(cursor) ?? { count: 0, totalAmount: 0 };
    points.push({ date: cursor, ...entry });
    cursor = addDaysToDateString(cursor, 1);
  }

  return points;
}
