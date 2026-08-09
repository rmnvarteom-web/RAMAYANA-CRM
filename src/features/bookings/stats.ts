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
