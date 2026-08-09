"use client";

import { useActionState, useMemo, useState } from "react";
import { createBookingAction } from "@/features/bookings/actions";
import type { ActionState } from "@/features/auth/actions";
import type { PricedItem } from "@/features/bookings/pricing";
import { input, label, buttonPrimary, card } from "@/lib/ui";

const initialState: ActionState = {};

export function CreateBookingForm({
  items,
  idempotencyKey,
}: {
  items: PricedItem[];
  idempotencyKey: string;
}) {
  const [state, formAction, pending] = useActionState(createBookingAction, initialState);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const lines = useMemo(
    () =>
      items
        .map((item) => ({ priceItemId: item.id, quantity: quantities[item.id] ?? 0 }))
        .filter((line) => line.quantity > 0),
    [items, quantities],
  );

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const item = items.find((i) => i.id === line.priceItemId);
        return sum + (item ? item.unitPrice * line.quantity : 0);
      }, 0),
    [lines, items],
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-6">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="visitDate" className={label}>
          Visit date
        </label>
        <input id="visitDate" name="visitDate" type="date" required className={input} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="customerName" className={label}>
          Customer&apos;s name <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input id="customerName" name="customerName" type="text" className={input} />
      </div>

      <div className="flex flex-col gap-2">
        <p className={label}>Items</p>
        <div className={`${card} flex flex-col divide-y divide-gray-100 p-0`}>
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm text-gray-700">
                {item.nameEn}
                <span className="text-gray-400"> — THB {item.unitPrice.toFixed(0)}</span>
                {item.unit === "PER_PERSON" ? (
                  <span className="text-gray-400"> / person</span>
                ) : null}
              </span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={quantities[item.id] ?? 0}
                onChange={(e) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [item.id]: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className={`${input} w-20 py-1.5 text-center`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
        <span className="text-sm font-medium text-gray-600">Total</span>
        <span className="text-lg font-semibold text-gray-900">THB {total.toFixed(2)}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="paymentMethod" className={label}>
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={input}
        >
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank transfer</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {paymentMethod === "BANK_TRANSFER" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="proofFile" className={label}>
            Payment slip <span className="font-normal text-gray-400">(optional, can add later)</span>
          </label>
          <input
            id="proofFile"
            name="proofFile"
            type="file"
            accept="image/jpeg,image/png"
            className={input}
          />
          <p className="text-xs text-gray-500">
            No slip yet? Book now and upload it from the booking page once you have it.
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || lines.length === 0}
        className={buttonPrimary}
      >
        {pending ? "Submitting..." : "Create booking"}
      </button>
    </form>
  );
}
