import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import {
  DEFAULT_OG_EN,
  DEFAULT_OG_FR,
  SITE_NAME,
  SITE_TWITTER,
  SITE_URL,
  languageAlternates,
  ogLocale,
} from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr
    ? "Toutes les recettes camerounaises"
    : "All Cameroonian recipes"
  const description = isFr
    ? "Parcours 140+ recettes traditionnelles camerounaises classées par région et par catégorie. Entrées, plats, sauces, grillades, desserts et boissons."
    : "Browse 140+ traditional Cameroonian recipes by region and category. Starters, mains, sauces, grills, desserts and drinks."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN
  const path = "/app"

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
      type: "website",
      images: [{ url: ogImage, width: 1536, height: 1024, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: SITE_TWITTER,
      site: SITE_TWITTER,
    },
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
