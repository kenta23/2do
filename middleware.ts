import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  const protectedRoutes = ["/todo", "/collaborations", "/planned", "/lists"];
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!req.auth?.user && isProtected) {
    const newUrl = new URL("/sign-in", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  if (req.auth?.user && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/todo", req.nextUrl));
  }
});
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
