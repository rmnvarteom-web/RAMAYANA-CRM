"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/session";
import { createAgency } from "@/features/agencies/create-agency";
import { createAgencySchema } from "@/features/agencies/schemas";
import type { ActionState } from "@/features/auth/actions";

export async function createAgencyAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (session.role !== "ADMIN") return { error: "Not authorized." };

  const parsed = createAgencySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    locale: formData.get("locale"),
    tariffPlanId: formData.get("tariffPlanId"),
    contractEnd: formData.get("contractEnd"),
    depositBalance: formData.get("depositBalance") || 0,
    creditLimit: formData.get("creditLimit") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await createAgency(parsed.data);
  if (!result.ok) return { error: "An account with this email already exists." };

  redirect("/admin/agencies");
}
