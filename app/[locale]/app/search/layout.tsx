import type { Metadata } from "next"
import { languageAlternates, SITE_NAME, SITE_URL, ogLocale, DEFAULT_OG_FR, DEFAULT_OG_EN } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Rechercher une recette" : "Search a recipe"
  const description = isFr
    ? "Filtre par région, catégorie, temps de préparation, niveau de piment et ingrédients pour trouver la recette camerounaise parfaite."
    : "Filter by region, category, prep time, spiciness and ingredients to find the perfect Cameroonian recipe."
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN
  const path = "/app/search"

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
    },
  }
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
