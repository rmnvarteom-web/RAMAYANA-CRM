"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/features/auth/actions";
import { input, label, buttonPrimary } from "@/lib/ui";

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

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
          autoComplete="email"
          className={input}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={label}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={input}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <Link
        href="/forgot-password"
        className="text-center text-sm text-blue-600 hover:text-blue-700"
      >
        Forgot password?
      </Link>
    </form>
  );
}
