import { Nunito } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={nunito.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
