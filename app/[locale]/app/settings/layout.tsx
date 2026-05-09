import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Paramètres" : "Settings"
  const description = isFr
    ? "Configure Tchopé : thème clair/sombre, langue, notifications."
    : "Configure Tchopé: light/dark theme, language, notifications."
  const path = "/app/settings"

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    robots: { index: false, follow: false },
  }
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
