import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = isFr ? "Ajouter une recette" : "Add a recipe"
  const description = isFr
    ? "Crée ta propre recette camerounaise et ajoute-la à ton cookbook."
    : "Create your own Cameroonian recipe and add it to your cookbook."
  const path = "/app/add-recipe"

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: languageAlternates(path),
    },
    robots: { index: false, follow: false },
  }
}

export default function AddRecipeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
