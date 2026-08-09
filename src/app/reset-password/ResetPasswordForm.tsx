"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ActionState } from "@/features/auth/actions";
import { input, label, buttonPrimary } from "@/lib/ui";

const initialState: ActionState = {};

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="email" value={email} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className={label}>
          6-digit code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className={`${input} tracking-widest`}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={label}>
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={input}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
