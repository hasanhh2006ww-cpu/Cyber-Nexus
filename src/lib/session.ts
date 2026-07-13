import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface AuthUser {
  id: string;
  role: string;
}

// next-auth/jwt exports decode at runtime but types are incomplete in beta.31
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _decode: any = null;
async function decodeToken(params: { token: string; secret: string; salt: string }) {
  if (!_decode) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _decode = require("next-auth/jwt").decode;
  }
  return _decode(params);
}

async function decryptSession(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    const cookieName = "authjs.session-token";
    const token =
      req.cookies.get(`__Secure-${cookieName}`)?.value ||
      req.cookies.get(cookieName)?.value;

    if (!token) return null;

    const payload = await decodeToken({
      token,
      secret,
      salt: "authjs.session-token",
    });

    if (!payload || !payload.id) return null;

    return {
      id: payload.id as string,
      role: (payload.role as string) || "student",
    };
  } catch {
    return null;
  }
}

function sessionExpiredResponse() {
  return NextResponse.json(
    {
      error: "انتهت صلاحية جلستك أو تم حذف حسابك، يرجى تسجيل الدخول مرة أخرى",
      sessionExpired: true,
    },
    { status: 401 }
  );
}

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

export async function requireAuth(
  req: NextRequest
): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const session = await decryptSession(req);

  if (!session) {
    return { response: unauthorizedResponse() };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true },
  });

  if (!dbUser) {
    return { response: sessionExpiredResponse() };
  }

  return { user: session };
}
