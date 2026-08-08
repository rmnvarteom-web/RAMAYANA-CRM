"use client";

import { useActionState } from "react";
import { acceptInviteAction, type ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

export function InviteForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInviteAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Choose a password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
        />
        <p className="text-xs text-black/60">At least 8 characters.</p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black text-white py-2 disabled:opacity-50"
      >
        {pending ? "Setting up..." : "Activate account"}
      </button>
    </form>
  );
}
