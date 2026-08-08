import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";
import { env } from "@/lib/env";
import type { UserRole } from "@/generated/prisma/enums";

export interface SessionData {
  userId: string;
  role: UserRole;
  agencyId: string | null;
}

export const sessionOptions = {
  password: env.SESSION_SECRET,
  cookieName: "ramayana_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession(data: SessionData): Promise<void> {
  const session = await getSession();
  session.userId = data.userId;
  session.role = data.role;
  session.agencyId = data.agencyId;
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
