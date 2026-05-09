import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { SITE_NAME, SITE_URL } from "@/lib/seo"

import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Tchopé — Recettes Camerounaises",
    template: "%s | Tchopé",
  },
  description:
    "Découvre des recettes traditionnelles camerounaises authentiques. Filtre par région, sauvegarde tes favoris et crée ton cookbook. 100% gratuit, 100% hors ligne.",
  authors: [{ name: "LNDEV", url: "https://lndev.me" }],
  creator: "LNDEV",
  publisher: SITE_NAME,
  category: "food",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/brand/logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      fr: "/fr",
      en: "/en",
      "x-default": "/fr",
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={jakarta.variable}>
      <body>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
