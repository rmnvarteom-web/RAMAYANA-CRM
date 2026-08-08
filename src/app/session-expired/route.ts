import { NextResponse } from "next/server";
import { destroySession } from "@/features/auth/session";

// Route Handlers can write cookies; Server Components can't. This is the
// bridge a Server Component redirects to when it finds a stale session.
export async function GET(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url));
}
