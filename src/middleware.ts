import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "aj_ecommerce_production_secure_jwt_secret_2026_xyz987";
const COOKIE_NAME = "aj_auth_token";

/**
 * Verify JWT token signature and expiration using native Web Crypto API
 * (Fully compatible with Next.js Edge Runtime and Node.js runtime)
 */
async function verifyJwt(token: string, secret: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = Uint8Array.from(
      Buffer.from(signatureB64.replace(/-/g, "+").replace(/_/g, "/"), "base64")
    );
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!valid) return null;

    const payloadJson = Buffer.from(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    const payload = JSON.parse(payloadJson);

    // Check expiration timestamp
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  return role === "ROLE_ADMIN" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyJwt(token, JWT_SECRET) : null;
  const isAuthenticated = !!payload?.userId;
  const isAdmin = isAdminRole(payload?.role);

  // 1. ADMIN PAGES (/admin, /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // Normal USER attempting to access /admin
      // Deny and redirect to /account with unauthorized flag
      const accountUrl = new URL("/account", req.url);
      accountUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(accountUrl);
    }
  }

  // 2. ADMIN API ENDPOINTS (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticated || !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Truy cập bị từ chối: Yêu cầu quyền quản trị viên (Admin Privilege Required)",
        },
        { status: 403 }
      );
    }
  }

  // 3. CUSTOMER ACCOUNT PAGES (/account, /account/*)
  if (pathname.startsWith("/account")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. LOGIN PAGE (/login)
  if (pathname === "/login") {
    if (isAuthenticated) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/login",
  ],
};
