import type { Metadata } from "next"
import Script from "next/script"
import { recipes } from "@/data/recipes"
import { recipesEn } from "@/data/recipes-en"
import { getRecipeVideos, getRecipeVideosEn } from "@/constants/videos"
import {
  DEFAULT_OG_EN,
  DEFAULT_OG_FR,
  SITE_NAME,
  SITE_TWITTER,
  SITE_URL,
  languageAlternates,
  ogLocale,
  videoListJsonLd,
} from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}): Promise<Metadata> {
  const { locale, id } = await params
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) return { title: "Recipe not found" }

  const en = recipesEn[id]
  const isFr = locale !== "en"
  const name = !isFr && en?.name ? en.name : recipe.name
  const ogImage = isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN
  const path = `/app/recipe/${id}/videos`

  const title = isFr ? `Vidéos — ${name}` : `Videos — ${name}`
  const description = isFr
    ? `Tutoriels vidéo pour préparer ${name}, recette camerounaise traditionnelle.`
    : `Video tutorials to cook ${name}, a traditional Cameroonian recipe.`

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
      creator: SITE_TWITTER,
      site: SITE_TWITTER,
    },
  }
}

export default async function VideosLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) return <>{children}</>

  const en = recipesEn[id]
  const name = locale === "en" && en?.name ? en.name : recipe.name
  const videos =
    locale === "en"
      ? getRecipeVideosEn(id) ?? getRecipeVideos(id) ?? []
      : getRecipeVideos(id) ?? []

  if (videos.length === 0) return <>{children}</>

  const url = `${SITE_URL}/${locale}/app/recipe/${id}/videos`
  const ld = videoListJsonLd({ recipeName: name, url, videos })

  return (
    <>
      <Script
        id={`ld-videos-${id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      {children}
    </>
  )
}
