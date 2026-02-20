import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 인증은 클라이언트 사이드(AuthContext)에서 처리
  console.log("[DEBUG] Middleware: pass-through for", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*\\.js).*)",
  ],
};
