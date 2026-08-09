"use client";

import { useActionState } from "react";
import { uploadPaymentSlipAction } from "@/features/bookings/actions";
import type { ActionState } from "@/features/auth/actions";

const initialState: ActionState = {};

export function UploadSlipForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(uploadPaymentSlipAction, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="proofFile" className="text-sm font-medium">
          Payment slip
        </label>
        <input
          id="proofFile"
          name="proofFile"
          type="file"
          accept="image/jpeg,image/png"
          required
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black text-white py-2 disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload payment slip"}
      </button>
    </form>
  );
}
