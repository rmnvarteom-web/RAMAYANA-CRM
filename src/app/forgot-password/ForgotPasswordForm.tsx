"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordResetAction, type ActionState } from "@/features/auth/actions";
import { input, label, buttonPrimary } from "@/lib/ui";

const initialState: ActionState = {};

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          If that email is registered, a reset code has been sent. Check your inbox.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
          className={buttonPrimary}
        >
          I have the code
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Sending..." : "Send reset code"}
      </button>
    </form>
  );
}
