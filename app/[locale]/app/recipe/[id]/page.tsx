import type { Metadata } from "next"
import Script from "next/script"
import { notFound } from "next/navigation"
import { recipes } from "@/data/recipes"
import { recipesEn } from "@/data/recipes-en"
import { getRecipeImage } from "@/constants/images"
import { locales, type Locale } from "@/lib/i18n"
import {
  DEFAULT_OG_EN,
  DEFAULT_OG_FR,
  SITE_NAME,
  SITE_TWITTER,
  SITE_URL,
  breadcrumbJsonLd,
  languageAlternates,
  localizedDifficulty,
  ogLocale,
  recipeJsonLd,
} from "@/lib/seo"
import RecipeDetail from "./recipe-detail"

export async function generateStaticParams() {
  return recipes.flatMap((recipe) =>
    locales.map((locale) => ({ locale, id: recipe.id }))
  )
}

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
  const baseDescription = !isFr && en?.description ? en.description : recipe.description
  const image = getRecipeImage(recipe.id, recipe.category) ?? (isFr ? DEFAULT_OG_FR : DEFAULT_OG_EN)
  const path = `/app/recipe/${id}`
  const url = `${SITE_URL}/${locale}${path}`

  const title = isFr
    ? `${name} — Recette Camerounaise`
    : `${name} — Cameroonian Recipe`
  const desc = isFr
    ? `${baseDescription} Préparation : ${recipe.duration} min. Difficulté : ${localizedDifficulty(recipe.difficulty, "fr")}. Spécialité de la région ${recipe.region}.`
    : `${baseDescription} Prep time: ${recipe.duration} min. Difficulty: ${recipe.difficulty}. Specialty from ${recipe.region} region.`

  return {
    title,
    description: desc,
    keywords: [
      name,
      isFr ? "recette camerounaise" : "cameroonian recipe",
      isFr ? "cuisine camerounaise" : "cameroonian cuisine",
      recipe.region,
      recipe.category,
      ...recipe.ingredients.slice(0, 8).map((i) => i.name),
    ],
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: ogLocale(locale === "en" ? "en" : "fr"),
      alternateLocale: isFr ? ["en_US"] : ["fr_FR"],
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: name }]
        : [],
      tags: [recipe.region, recipe.category, name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: image ? [image] : [],
      creator: SITE_TWITTER,
      site: SITE_TWITTER,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const recipe = recipes.find((r) => r.id === id)
  if (!recipe) notFound()

  const typedLocale = (locale === "en" ? "en" : "fr") as Locale
  const en = recipesEn[id]
  const name = typedLocale === "en" && en?.name ? en.name : recipe.name
  const description =
    typedLocale === "en" && en?.description ? en.description : recipe.description
  const ingredients =
    typedLocale === "en" && en?.ingredients ? en.ingredients : recipe.ingredients
  const steps = typedLocale === "en" && en?.steps ? en.steps : recipe.steps
  const image = getRecipeImage(recipe.id, recipe.category)
  const url = `${SITE_URL}/${locale}/app/recipe/${id}`

  const ldRecipe = recipeJsonLd({
    recipe,
    locale: typedLocale,
    url,
    image,
    description,
    name,
    ingredients,
    steps,
  })

  const breadcrumbs = breadcrumbJsonLd([
    {
      name: "Tchopé",
      url: `${SITE_URL}/${locale}`,
    },
    {
      name: typedLocale === "fr" ? "Recettes" : "Recipes",
      url: `${SITE_URL}/${locale}/app`,
    },
    { name, url },
  ])

  return (
    <>
      <Script
        id={`ld-recipe-${id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldRecipe) }}
      />
      <Script
        id={`ld-breadcrumb-${id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <RecipeDetail />
    </>
  )
}
