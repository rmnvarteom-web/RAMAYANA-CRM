"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordResetAction, type ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm">
          If that email is registered, a reset code has been sent. Check your inbox.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
          className="rounded-md bg-black text-white py-2"
        >
          I have the code
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black text-white py-2 disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send reset code"}
      </button>
    </form>
  );
}
