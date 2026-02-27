import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for auth pages during development if no secret is set
  if (!process.env.NEXTAUTH_SECRET && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.next();
  }
  
  // Get the token from the request
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  const isAuthenticated = !!token;

  // Allow access to auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes - but allow access if no secret is set (development)
  if (!process.env.NEXTAUTH_SECRET || !isAuthenticated) {
    if (pathname !== "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
