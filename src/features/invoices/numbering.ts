import { db } from "@/lib/db";

// Atomic upsert+increment — safe under concurrent bookings, and numbers are
// never reused even if the invoice row that reserved one fails to save.
export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await db.numberSequence.upsert({
    where: { id: `invoice-${year}` },
    create: { id: `invoice-${year}`, lastUsed: 1 },
    update: { lastUsed: { increment: 1 } },
  });
  return `INV-${year}-${String(seq.lastUsed).padStart(5, "0")}`;
}
