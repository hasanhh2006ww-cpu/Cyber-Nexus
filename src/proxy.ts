import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextAuthFn = NextAuth as any;
const { auth } = NextAuthFn(authConfig);

const protectedPaths = ["/dashboard", "/profile"];
const authPaths = ["/login", "/register"];
const adminPaths = ["/admin"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: any) => {
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
    if (session?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  if ((isProtectedPath || isCoursesPath) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPath && isAuthenticated) {
    const role = session?.user?.role;
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
