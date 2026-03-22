import type { Metadata } from "next"
import { recipes } from "@/data/recipes"
import { recipesEn } from "@/data/recipes-en"
import { getRecipeImage } from "@/constants/images"
import { locales } from "@/lib/i18n"
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
  const description =
    locale === "en" && en?.description ? en.description : recipe.description
  const image = getRecipeImage(recipe.id, recipe.category)

  const isFr = locale === "fr"
  const title = isFr
    ? `${recipe.name} — Recette Camerounaise | Tchopé`
    : `${recipe.name} — Cameroonian Recipe | Tchopé`
  const desc = isFr
    ? `${description} Temps de préparation : ${recipe.duration} min. Difficulté : ${recipe.difficulty}. Spécialité de la région ${recipe.region}.`
    : `${description} Prep time: ${recipe.duration} min. Difficulty: ${recipe.difficulty}. Specialty from ${recipe.region} region.`

  return {
    title,
    description: desc,
    keywords: [
      recipe.name,
      isFr ? "recette camerounaise" : "cameroonian recipe",
      recipe.region,
      ...recipe.ingredients.map((i) => i.name),
    ],
    openGraph: {
      title,
      description: desc,
      images: image ? [{ url: image }] : [],
      type: "article",
    },
    alternates: {
      languages: {
        fr: `/fr/app/recipe/${id}`,
        en: `/en/app/recipe/${id}`,
      },
    },
  }
}

export default function RecipePage() {
  return <RecipeDetail />
}
