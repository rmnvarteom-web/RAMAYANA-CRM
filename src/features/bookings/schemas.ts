import { z } from "zod";

export const bookingLineInputSchema = z.object({
  priceItemId: z.string().min(1),
  quantity: z.coerce.number().int().min(0),
});

export const createBookingSchema = z.object({
  visitDate: z.string().min(1, "Visit date is required"),
  customerName: z
    .string()
    .trim()
    .transform((v) => (v.length > 0 ? v : undefined))
    .optional(),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH", "CARD", "OTHER"]),
  idempotencyKey: z.string().min(1),
  lines: z.array(bookingLineInputSchema),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
