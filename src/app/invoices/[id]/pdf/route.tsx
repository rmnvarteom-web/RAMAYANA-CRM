import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { getSession } from "@/features/auth/session";
import { InvoicePdfDocument } from "@/features/invoices/invoice-pdf";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      agency: true,
      booking: { include: { lines: { include: { priceItem: true } } } },
    },
  });
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  const isOwnerAgency = session.agencyId === invoice.agencyId;
  const isAdmin = session.role === "ADMIN";
  if (!isOwnerAgency && !isAdmin) return new NextResponse("Forbidden", { status: 403 });

  const buffer = await renderToBuffer(
    <InvoicePdfDocument
      invoiceNumber={invoice.number}
      agencyName={invoice.agency.name}
      customerName={invoice.booking.customerName}
      visitDate={invoice.booking.visitDate}
      paymentMethod={invoice.booking.paymentMethod}
      lines={invoice.booking.lines.map((line) => ({
        name: line.priceItem.nameEn,
        quantity: line.quantity,
        unitPrice: Number(line.unitPriceAtBooking),
        lineTotal: Number(line.lineTotal),
      }))}
      totalAmount={Number(invoice.booking.totalAmount)}
    />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
