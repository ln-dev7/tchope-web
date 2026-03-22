import { NextRequest, NextResponse } from "next/server"

const locales = ["fr", "en"]
const defaultLocale = "fr"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (hasLocale) return

  // Redirect / to /fr
  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Match all paths except _next, api, static files
    "/((?!_next|api|brand|mockups|fonts|store|favicon.ico).*)",
  ],
}
