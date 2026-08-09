"use client";

import { useActionState } from "react";
import { uploadPaymentSlipAction } from "@/features/bookings/actions";
import type { ActionState } from "@/features/auth/actions";
import { input, label, buttonPrimary, card } from "@/lib/ui";

const initialState: ActionState = {};

export function UploadSlipForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(uploadPaymentSlipAction, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className={`${card} flex flex-col gap-3`}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="proofFile" className={label}>
          Upload payment slip
        </label>
        <input
          id="proofFile"
          name="proofFile"
          type="file"
          accept="image/jpeg,image/png"
          required
          className={input}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? "Uploading..." : "Upload payment slip"}
      </button>
    </form>
  );
}
