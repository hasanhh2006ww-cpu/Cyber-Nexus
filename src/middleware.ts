import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const protectedPaths = ["/dashboard", "/profile"];
const authPaths = ["/login", "/register"];
const adminPaths = ["/admin"];

export default auth((req: NextRequest & { auth: { user?: { id?: string; role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.includes(pathname);
  const isCoursesPath = pathname.startsWith("/courses/");

  const isAuthenticated = !!session?.user;

  if (isAdminPath) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if ((session?.user as Record<string, unknown>)?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if ((isProtectedPath || isCoursesPath) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPath && isAuthenticated) {
    const role = (session?.user as Record<string, unknown>)?.role;
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
