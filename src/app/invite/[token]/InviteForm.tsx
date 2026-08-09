"use client";

import { useActionState } from "react";
import { acceptInviteAction, type ActionState } from "@/features/auth/actions";
import { input, label, buttonPrimary } from "@/lib/ui";

const initialState: ActionState = {};

export function InviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={label}>
          Choose a password
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
        <p className="text-xs text-gray-500">At least 8 characters.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Setting up..." : "Activate account"}
      </button>
    </form>
  );
}
