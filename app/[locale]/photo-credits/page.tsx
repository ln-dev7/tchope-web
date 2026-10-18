"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLocale } from "@/lib/locale-context"
import { photoCredits } from "@/constants/photoCredits"
import { recipes } from "@/data/recipes"
import { recipesEn } from "@/data/recipes-en"

/** Auteurs et licences des photos de plats (exigé par les licences CC BY et CC BY-SA). */
export default function PhotoCreditsPage() {
  const { locale } = useLocale()
  const fr = locale === "fr"

  const rows = useMemo(() => {
    const names = new Map(
      recipes.map((r) => [r.id, (!fr && recipesEn[r.id]?.name) || r.name])
    )
    return photoCredits
      .map((c) => ({ ...c, name: names.get(c.id) ?? c.id }))
      .sort((a, b) => a.name.localeCompare(b.name, fr ? "fr" : "en"))
  }, [fr])

  return (
    <div className="brand-site">
      <Header />

      <main id="content" className="brand-legal">
        <div className="brand-container">
          <Link
            href={`/${locale}`}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {fr ? "Retour" : "Back"}
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {fr ? "Crédits photos" : "Photo credits"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {fr
              ? "Les photos des plats sont sous licence libre (Wikimedia Commons, Pexels, Unsplash, Pixabay). Merci à leurs auteurs. Chaque ligne mène à la page d'origine de la photo."
              : "The dish photos are under free licences (Wikimedia Commons, Pexels, Unsplash, Pixabay). Thanks to their authors. Each line links to the photo's original page."}
          </p>

          <ul className="mt-10 divide-y divide-foreground/10">
            {rows.map((row) => (
              <li key={row.id}>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-3"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground group-hover:text-primary">
                      {row.name}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {row.author} · {row.license} · {row.source}
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-muted group-hover:text-primary" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}
