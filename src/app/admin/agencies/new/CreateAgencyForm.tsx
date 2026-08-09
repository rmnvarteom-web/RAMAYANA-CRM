"use client";

import { useActionState } from "react";
import { createAgencyAction } from "@/features/agencies/actions";
import type { ActionState } from "@/features/auth/actions";
import { input, label as labelClass, buttonPrimary } from "@/lib/ui";

const initialState: ActionState = {};

export function CreateAgencyForm({
  tariffPlans,
}: {
  tariffPlans: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createAgencyAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Agency name" name="name" required />
      <Field label="Email" name="email" type="email" required />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="locale" className={labelClass}>
          Language
        </label>
        <select id="locale" name="locale" defaultValue="EN" className={input}>
          <option value="EN">English</option>
          <option value="RU">Русский</option>
          <option value="TH">ไทย</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tariffPlanId" className={labelClass}>
          Tariff plan
        </label>
        <select id="tariffPlanId" name="tariffPlanId" required className={input}>
          <option value="">Select a plan</option>
          {tariffPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      <Field label="Contract end date" name="contractEnd" type="date" required />
      <Field label="Deposit balance (THB)" name="depositBalance" type="number" defaultValue="0" />
      <Field label="Credit limit (THB)" name="creditLimit" type="number" defaultValue="0" />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Creating..." : "Create agency & send invite"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className={input}
      />
    </div>
  );
}
