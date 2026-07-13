import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtDecrypt } from "jose";
import { hkdf } from "@panva/hkdf";
import { prisma } from "@/lib/prisma";

const SECRET =
  process.env.NEXTAUTH_SECRET || "cyber-nexus-secret-key-change-in-production";

async function deriveKey(secret: string, salt: string): Promise<Uint8Array> {
  return await hkdf(
    "sha256",
    new TextEncoder().encode(secret),
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    64
  );
}

export interface AuthUser {
  id: string;
  role: string;
}

async function decryptSession(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    const cookieName = "authjs.session-token";
    const token =
      req.cookies.get(cookieName)?.value ||
      req.cookies.get(`__Secure-${cookieName}`)?.value;

    if (!token) return null;

    const encryptionKey = await deriveKey(SECRET, "authjs.session-token");
    const { payload } = await jwtDecrypt(token, encryptionKey);

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
