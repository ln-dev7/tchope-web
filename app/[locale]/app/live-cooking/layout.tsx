import type { Metadata } from "next"
import { languageAlternates } from "@/lib/seo"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale !== "en"
  const title = "TchopAI Live"
  const description = isFr
    ? "Cuisine avec TchopAI à la voix : pose tes questions pendant la recette, montre ta préparation à la caméra et reçois des conseils en temps réel."
    : "Cook with TchopAI by voice: ask questions during the recipe, show your preparation to the camera and get real-time advice."
  const path = "/app/live-cooking"

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

export default function LiveCookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
