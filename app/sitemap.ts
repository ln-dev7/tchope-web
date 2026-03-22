import type { MetadataRoute } from "next"
import { recipes } from "@/data/recipes"

const BASE_URL = "https://tchope.lndev.me"

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["fr", "en"]
  const staticPages = ["", "/privacy", "/app", "/app/search", "/app/cookbook", "/app/settings"]

  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page === "" ? 1 : page === "/app" ? 0.9 : 0.7,
    }))
  )

  const recipeEntries = locales.flatMap((locale) =>
    recipes.map((recipe) => ({
      url: `${BASE_URL}/${locale}/app/recipe/${recipe.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  )

  return [...staticEntries, ...recipeEntries]
}
