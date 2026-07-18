import type { Recipe } from "@/types/recipe"

export const SITE_URL = "https://tchope.lndev.me"
export const SITE_NAME = "Tchopé"
export const SITE_TWITTER = "@tchope_app"
export const ORG_NAME = "Tchopé"
export const ORG_LOGO = `${SITE_URL}/brand/logo-with-name.png`
export const DEFAULT_OG_FR = `${SITE_URL}/brand/banner.jpg`
export const DEFAULT_OG_EN = `${SITE_URL}/brand/banner-en.jpg`

export type AppLocale = "fr" | "en"

export function localePath(locale: AppLocale, path: string = ""): string {
  const clean = path.startsWith("/") ? path : path ? `/${path}` : ""
  return `/${locale}${clean}`
}

export function absoluteUrl(locale: AppLocale, path: string = ""): string {
  return `${SITE_URL}${localePath(locale, path)}`
}

export function languageAlternates(path: string = ""): Record<string, string> {
  return {
    fr: localePath("fr", path),
    en: localePath("en", path),
    "x-default": localePath("fr", path),
  }
}

export function ogLocale(locale: AppLocale): string {
  return locale === "fr" ? "fr_FR" : "en_US"
}

export function htmlLang(locale: AppLocale): string {
  return locale === "fr" ? "fr-FR" : "en-US"
}

const difficultyMap: Record<string, string> = {
  Easy: "Facile",
  Medium: "Moyen",
  Hard: "Difficile",
}

const spicinessMap: Record<string, string> = {
  Mild: "Doux",
  Medium: "Épicé",
  "Extra Hot": "Très épicé",
}

export function localizedDifficulty(value: string, locale: AppLocale): string {
  if (locale === "en") return value
  return difficultyMap[value] ?? value
}

export function localizedSpiciness(value: string, locale: AppLocale): string {
  if (locale === "en") return value
  return spicinessMap[value] ?? value
}

export function isoDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return "PT0M"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours && mins) return `PT${hours}H${mins}M`
  if (hours) return `PT${hours}H`
  return `PT${mins}M`
}

type RecipeJsonLdInput = {
  recipe: Recipe
  locale: AppLocale
  url: string
  image: string | null
  description: string
  name: string
  ingredients?: { name: string; quantity: string }[]
  steps?: string[]
}

export function recipeJsonLd({
  recipe,
  locale,
  url,
  image,
  description,
  name,
  ingredients,
  steps,
}: RecipeJsonLdInput) {
  const ing = ingredients ?? recipe.ingredients
  const stp = steps ?? recipe.steps
  const author = {
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
  }

  const categoryMap: Record<string, string> = {
    Plat: locale === "fr" ? "Plat principal" : "Main course",
    Sauce: locale === "fr" ? "Sauce" : "Sauce",
    Grillade: locale === "fr" ? "Grillade" : "Grilled",
    Boisson: locale === "fr" ? "Boisson" : "Drink",
    Dessert: locale === "fr" ? "Dessert" : "Dessert",
    "Entrée": locale === "fr" ? "Entrée" : "Starter",
    Accompagnement: locale === "fr" ? "Accompagnement" : "Side dish",
  }

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name,
    description,
    image: image ? [image] : undefined,
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    url,
    author,
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      logo: { "@type": "ImageObject", url: ORG_LOGO },
    },
    datePublished: "2026-01-01",
    recipeCategory: categoryMap[recipe.category] ?? recipe.category,
    recipeCuisine: locale === "fr" ? "Camerounaise" : "Cameroonian",
    keywords: [
      recipe.name,
      recipe.region,
      locale === "fr" ? "cuisine camerounaise" : "Cameroonian cuisine",
    ].join(", "),
    recipeYield: `${recipe.servings} ${locale === "fr" ? "portions" : "servings"}`,
    totalTime: isoDuration(recipe.duration),
    cookTime: isoDuration(recipe.duration),
    recipeIngredient: ing.map((i) =>
      i.quantity ? `${i.quantity} ${i.name}` : i.name
    ),
    recipeInstructions: stp.map((text, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      text,
      name: `${locale === "fr" ? "Étape" : "Step"} ${idx + 1}`,
    })),
    aggregateRating:
      recipe.rating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: recipe.rating,
            bestRating: 5,
            worstRating: 1,
            ratingCount: Math.max(10, Math.round(recipe.rating * 20)),
          }
        : undefined,
    suitableForDiet: undefined,
  }
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function websiteJsonLd(locale: AppLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/app/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    sameAs: [],
  }
}

export function videoListJsonLd(input: {
  recipeName: string
  url: string
  videos: { id: string; title: string }[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.recipeName,
    url: input.url,
    itemListElement: input.videos.map((v, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "VideoObject",
        name: v.title,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        uploadDate: "2026-01-01",
        description: input.recipeName,
      },
    })),
  }
}
