"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Search,
  ChevronRight,
  Sparkles,
  MessageCircleMore,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useAppOnly } from "@/components/app-only"
import { StoreBanner } from "@/components/store-banner"
import { FeaturedCard } from "@/components/featured-card"
import { RecipeCard } from "@/components/recipe-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

const FEATURED_IDS = [
  "ndole",
  "poulet-dg",
  "eru",
  "mbongo-tchobi",
  "koki",
  "taro-sauce-jaune",
  "kondre",
  "sanga",
  "okok-sucre",
  "poisson-braise",
  "ekwang",
  "met-de-pistache",
  "okok-sale",
]
const POPULAR_IDS = [
  "ndole",
  "poulet-dg",
  "eru",
  "mbongo-tchobi",
  "koki",
  "taro-sauce-jaune",
  "kondre",
  "sanga",
  "okok-sucre",
  "poisson-braise",
  "ekwang",
  "met-de-pistache",
  "okok-sale",
]

export default function AppHomePage() {
  const { locale } = useLocale()
  const { openAppOnly } = useAppOnly()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)

  const featured = useMemo(
    () =>
      FEATURED_IDS.map((id) => recipes.find((r) => r.id === id)).filter(
        Boolean
      ) as typeof recipes,
    [recipes]
  )
  const popular = useMemo(
    () =>
      POPULAR_IDS.map((id) => recipes.find((r) => r.id === id)).filter(
        Boolean
      ) as typeof recipes,
    [recipes]
  )

  return (
    <div className="space-y-6 pb-4">
      <StoreBanner />

      {/* Header */}
      <header className="space-y-3">
        <p className="app-eyebrow">
          {locale === "fr" ? "LA CUISINE, EN PARTAGE" : "GOOD FOOD, SHARED"}
        </p>
        <h1 className="app-display text-foreground dark:text-white">
          {/* Texte propre au web : pas dans constants/translations.ts, qui est copié depuis l'app mobile (pnpm sync) */}
          {locale === "fr"
            ? "On mange quoi aujourd’hui ?"
            : "What are we cooking today?"}
        </h1>
      </header>

      {/* Search bar */}
      <Link
        href={`/${locale}/app/search`}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-foreground/5 bg-surface px-4 py-3 text-sm text-muted dark:border-white/5 dark:bg-dark-surface dark:text-dark-muted"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{t("searchPlaceholder")}</span>
      </Link>

      {/* Qu'est-ce que je peux cuisiner ? (comme l'accueil mobile) */}
      <Link
        href={`/${locale}/app/ai-recipes`}
        className="flex cursor-pointer items-center gap-4 rounded-3xl border-[1.5px] border-primary/15 bg-primary/8 p-5 transition-colors hover:border-primary/30 hover:bg-primary/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="size-6 fill-primary/20 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold tracking-tight text-foreground dark:text-white">
            {t("aiCta")}
          </p>
          <p className="mt-0.5 text-[13px] text-muted dark:text-dark-muted">
            {t("aiCtaSubtitle")}
          </p>
        </div>
        <ChevronRight className="size-[18px] shrink-0 text-primary" />
      </Link>

      <button
        type="button"
        onClick={openAppOnly}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary/15 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 md:hidden"
      >
        <MessageCircleMore className="size-5" />
        {locale === "fr"
          ? "Un coup de main avec TchopAI"
          : "A helping hand from TchopAI"}
      </button>

      {/* Featured — Carousel */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground dark:text-white">
          {t("featuredRecipes")}
        </h2>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {featured.map((r) => (
              <CarouselItem
                key={r.id}
                className="basis-[75%] pl-3 sm:basis-[55%] md:basis-[45%] lg:basis-[40%]"
              >
                <FeaturedCard recipe={r} locale={locale} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 size-10 border-foreground/10 bg-surface text-foreground hover:bg-surface active:-translate-y-1/2 dark:border-white/10 dark:bg-dark-surface dark:text-white dark:hover:bg-dark-surface" />
          <CarouselNext className="-right-3 size-10 border-foreground/10 bg-surface text-foreground hover:bg-surface active:-translate-y-1/2 dark:border-white/10 dark:bg-dark-surface dark:text-white dark:hover:bg-dark-surface" />
        </Carousel>
      </section>

      {/* Popular */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-white">
            {t("popularRecipes")}
          </h2>
          <Link
            href={`/${locale}/app/search`}
            className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary"
          >
            {t("seeAll")}
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-2">
          {popular.map((r) => (
            <RecipeCard key={r.id} recipe={r} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  )
}
