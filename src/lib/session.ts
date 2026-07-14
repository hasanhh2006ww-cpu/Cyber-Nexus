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
    const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[AUTH] No secret configured (checked AUTH_SECRET and NEXTAUTH_SECRET)");
      return null;
    }

    // NextAuth uses the full cookie name as the HKDF salt.
    // On HTTPS (Vercel): "__Secure-authjs.session-token"
    // On HTTP  (local):  "authjs.session-token"
    const secureToken = req.cookies.get("__Secure-authjs.session-token")?.value;
    const insecureToken = req.cookies.get("authjs.session-token")?.value;

    let token: string | undefined;
    let salt: string;
    if (secureToken) {
      token = secureToken;
      salt = "__Secure-authjs.session-token";
    } else if (insecureToken) {
      token = insecureToken;
      salt = "authjs.session-token";
    } else {
      console.error("[AUTH] No session cookie found");
      return null;
    }

    const payload = await decodeToken({ token, secret, salt });

    if (!payload || !payload.id) {
      console.error("[AUTH] JWT decode failed or missing id claim");
      return null;
    }

    return {
      id: payload.id as string,
      role: (payload.role as string) || "student",
    };
  } catch (error) {
    console.error("[AUTH] decryptSession error:", error);
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
