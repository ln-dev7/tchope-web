import type { Metadata } from "next"
import { languageAlternates, SITE_NAME, SITE_URL, ogLocale, DEFAULT_OG_FR, DEFAULT_OG_EN } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Mon cookbook" : "My cookbook"
  const description = isFr
    ? "Tes favoris et tes recettes personnelles dans un seul endroit. Crée, sauvegarde et organise tes recettes camerounaises."
    : "Your favorites and personal recipes in one place. Create, save and organize your Cameroonian recipes."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN
  const path = "/app/cookbook"

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

export default function CookbookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
