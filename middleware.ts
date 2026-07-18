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
    // Match all paths except _next, api, static files — et les fichiers SEO
    // (robots.txt, sitemap.xml, manifest) qui doivent répondre à la racine
    // sans redirection de locale.
    "/((?!_next|api|brand|mockups|fonts|store|favicon.ico|app-ads.txt|robots.txt|sitemap.xml|manifest.webmanifest|.well-known).*)",
  ],
}
