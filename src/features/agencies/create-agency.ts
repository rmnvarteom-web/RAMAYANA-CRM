import { db } from "@/lib/db";
import { createAndSendInvite } from "@/features/auth/invites";
import type { CreateAgencyInput } from "@/features/agencies/schemas";

export type CreateAgencyResult =
  | { ok: true; agencyId: string }
  | { ok: false; reason: "email_taken" };

export async function createAgency(input: CreateAgencyInput): Promise<CreateAgencyResult> {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) return { ok: false, reason: "email_taken" };

  const { agency, user } = await db.$transaction(async (tx) => {
    const agency = await tx.agency.create({
      data: {
        name: input.name,
        email: input.email,
        locale: input.locale,
        tariffPlanId: input.tariffPlanId,
        contractEnd: new Date(input.contractEnd),
        depositBalance: input.depositBalance,
        creditLimit: input.creditLimit,
      },
    });

    const user = await tx.user.create({
      data: {
        email: input.email,
        role: "OWNER",
        status: "INVITED",
        agencyId: agency.id,
      },
    });

    return { agency, user };
  });

  await createAndSendInvite(user.id, user.email, agency.locale);

  return { ok: true, agencyId: agency.id };
}
