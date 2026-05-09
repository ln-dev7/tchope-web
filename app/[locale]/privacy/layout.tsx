import type { Metadata } from "next"
import { languageAlternates, SITE_NAME, SITE_URL, ogLocale, DEFAULT_OG_FR, DEFAULT_OG_EN } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Politique de confidentialité" : "Privacy Policy"
  const description = isFr
    ? "Comment Tchopé gère tes données. Aucun compte, aucun tracking, aucun envoi serveur. Tout reste sur ton appareil."
    : "How Tchopé handles your data. No account, no tracking, no server. Everything stays on your device."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN
  const path = "/privacy"

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}${path}`,
      siteName: SITE_NAME,
      locale: ogLocale(locale === "en" ? "en" : "fr"),
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
