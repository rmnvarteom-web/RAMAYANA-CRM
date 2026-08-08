import { z } from "zod";

export const createAgencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  locale: z.enum(["EN", "RU", "TH"]),
  tariffPlanId: z.string().min(1, "Select a tariff plan"),
  contractEnd: z.string().min(1, "Contract end date is required"),
  depositBalance: z.coerce.number().min(0).default(0),
  creditLimit: z.coerce.number().min(0).default(0),
});

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
