"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { login } from "@/features/auth/login";
import { acceptInvite } from "@/features/auth/invites";
import { requestPasswordResetOtp, resetPasswordWithOtp } from "@/features/auth/otp";
import { createSession, destroySession } from "@/features/auth/session";
import {
  loginSchema,
  acceptInviteSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const result = await login(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return {
      error:
        result.reason === "not_activated"
          ? "This account is not active yet. Check your invite email."
          : "Incorrect email or password.",
    };
  }

  redirect("/dashboard");
}

export async function acceptInviteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await acceptInvite(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return {
      error:
        result.reason === "expired"
          ? "This invite link has expired. Ask an admin to resend it."
          : result.reason === "used"
            ? "This invite link was already used. Try logging in instead."
            : "This invite link is invalid.",
    };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: result.userId } });
  await createSession({ userId: user.id, role: user.role, agencyId: user.agencyId });
  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email." };

  await requestPasswordResetOtp(parsed.data.email);
  // Always report success — confirming an email doesn't exist would leak
  // which agencies are registered.
  return { success: true };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await resetPasswordWithOtp(
    parsed.data.email,
    parsed.data.code,
    parsed.data.password,
  );
  if (!result.ok) {
    return {
      error:
        result.reason === "expired"
          ? "This code has expired. Request a new one."
          : result.reason === "too_many_attempts"
            ? "Too many attempts. Request a new code."
            : "Incorrect code.",
    };
  }

  redirect("/login");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
