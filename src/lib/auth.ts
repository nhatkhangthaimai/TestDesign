import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_2026";
export const COOKIE_NAME = "aj_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  return role === "ROLE_ADMIN" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: Request) {
  try {
    let token: string | undefined;

    // 1. Check req header if passed directly
    if (req) {
      const auth = req.headers.get("authorization");
      if (auth?.startsWith("Bearer ")) {
        token = auth.slice(7).trim();
      }
    }

    // 2. Check cookies
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(COOKIE_NAME)?.value;
      } catch {}
    }

    // 3. Check next/headers if still not found
    if (!token) {
      try {
        const headerList = await headers();
        const auth = headerList.get("authorization");
        if (auth?.startsWith("Bearer ")) {
          token = auth.slice(7).trim();
        }
      } catch {}
    }

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export function setAuthCookieHeader(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600};`;
}

export function clearAuthCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;`;
}
