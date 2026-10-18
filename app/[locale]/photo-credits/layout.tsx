import type { Metadata } from "next"
import {
  languageAlternates,
  SITE_NAME,
  SITE_URL,
  ogLocale,
  DEFAULT_OG_FR,
  DEFAULT_OG_EN,
} from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Crédits photos" : "Photo credits"
  const description = isFr
    ? "Auteurs et licences des photos de plats de Tchopé (Wikimedia Commons, Pexels, Unsplash, Pixabay)."
    : "Authors and licences of the Tchopé dish photos (Wikimedia Commons, Pexels, Unsplash, Pixabay)."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN
  const path = "/photo-credits"

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
      images: [{ url: ogImage, width: 1536, height: 1024, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default function PhotoCreditsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
