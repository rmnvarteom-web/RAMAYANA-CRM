import { db } from "@/lib/db";
import { nextInvoiceNumber } from "@/features/invoices/numbering";

export async function createInvoiceForBooking(bookingId: string, agencyId: string) {
  const number = await nextInvoiceNumber();
  const invoice = await db.invoice.create({
    data: { number, bookingId, agencyId, pdfUrl: "" },
  });

  // The PDF route needs the invoice's own id, so the URL is filled in
  // right after creation rather than guessed in advance.
  return db.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: `/invoices/${invoice.id}/pdf` },
  });
}
