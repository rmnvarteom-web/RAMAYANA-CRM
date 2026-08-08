"use client";

import { useActionState, useMemo, useState } from "react";
import { createBookingAction } from "@/features/bookings/actions";
import type { ActionState } from "@/features/auth/actions";
import type { PricedItem } from "@/features/bookings/pricing";

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

      <div className="flex flex-col gap-1">
        <label htmlFor="visitDate" className="text-sm font-medium">
          Visit date
        </label>
        <input
          id="visitDate"
          name="visitDate"
          type="date"
          required
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Items</p>
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3">
            <span className="text-sm">
              {item.nameEn} — THB {item.unitPrice.toFixed(0)}
              {item.unit === "PER_PERSON" ? " / person" : ""}
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
              className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1 text-black"
            />
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold">Total: THB {total.toFixed(2)}</p>

      <div className="flex flex-col gap-1">
        <label htmlFor="paymentMethod" className="text-sm font-medium">
          Payment method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
        >
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank transfer</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {paymentMethod === "BANK_TRANSFER" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="proofFile" className="text-sm font-medium">
            Transfer screenshot
          </label>
          <input
            id="proofFile"
            name="proofFile"
            type="file"
            accept="image/jpeg,image/png"
            required
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
          />
          <p className="text-xs text-black/60">
            Your booking will show as &ldquo;pending review&rdquo; until staff confirm the
            transfer.
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || lines.length === 0}
        className="rounded-md bg-black text-white py-2 disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Create booking"}
      </button>
    </form>
  );
}
