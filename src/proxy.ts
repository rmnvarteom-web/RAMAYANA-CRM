import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/features/auth/session";

const PUBLIC_ROUTES = ["/login", "/invite", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  const path = request.nextUrl.pathname;
  const isAuthed = Boolean(session.userId);
  const isPublicRoute = PUBLIC_ROUTES.some((route) => path.startsWith(route));

  if (!isAuthed && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthed && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (path.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
