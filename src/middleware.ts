import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt } from "jose";
import { hkdf } from "@panva/hkdf";

const protectedPaths = ["/dashboard", "/profile"];
const authPaths = ["/login", "/register"];
const adminPaths = ["/admin"];

async function deriveKey(secret: string, salt: string): Promise<Uint8Array> {
  return await hkdf(
    "sha256",
    new TextEncoder().encode(secret),
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    64
  );
}

async function verifySession(
  token: string
): Promise<{ id?: string; role?: string } | null> {
  try {
    const secret =
      process.env.NEXTAUTH_SECRET || "cyber-nexus-secret-key-change-in-production";
    const encryptionKey = await deriveKey(secret, "authjs.session-token");
    const { payload } = await jwtDecrypt(token, encryptionKey);
    if (!payload) return null;
    return {
      id: payload.id as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.includes(pathname);
  const isCoursesPath = pathname.startsWith("/courses/");

  const cookieName = "authjs.session-token";
  const token =
    req.cookies.get(cookieName)?.value ||
    req.cookies.get(`__Secure-${cookieName}`)?.value;

  const session = token ? await verifySession(token) : null;
  const isAuthenticated = !!session;

  if (isAdminPath) {
    if (!isAuthenticated) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (session?.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  if ((isProtectedPath || isCoursesPath) && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath && isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = session?.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
