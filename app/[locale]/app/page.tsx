"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Droplets,
  Triangle,
  Building2,
  Compass,
  Sun,
  Leaf,
  Signpost,
  Thermometer,
  Map,
  Ship,
  ChevronRight,
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
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
import type { Region } from "@/types/recipe"
import type { LucideIcon } from "lucide-react"

const FEATURED_IDS = [
  "ndole", "poulet-dg", "eru", "mbongo-tchobi", "koki",
  "taro-sauce-jaune", "kondre", "sanga", "okok-sucre",
  "poisson-braise", "ekwang", "met-de-pistache", "okok-sale",
]
const POPULAR_IDS = [
  "ndole", "poulet-dg", "eru", "mbongo-tchobi", "koki",
  "taro-sauce-jaune", "kondre", "sanga", "okok-sucre",
  "poisson-braise", "ekwang", "met-de-pistache", "okok-sale",
]

const regionIcons: Record<Region, LucideIcon> = {
  Littoral: Droplets, Ouest: Triangle, Centre: Building2, Sud: Compass,
  Nord: Sun, Est: Leaf, Adamaoua: Signpost, "Extrême-Nord": Thermometer,
  "Nord-Ouest": Map, "Sud-Ouest": Ship,
}

const ALL_REGIONS: Region[] = [
  "Littoral", "Ouest", "Centre", "Sud", "Nord", "Est",
  "Adamaoua", "Extrême-Nord", "Nord-Ouest", "Sud-Ouest",
]

const regionTranslationKeys: Record<Region, string> = {
  Littoral: "regionLittoral", Ouest: "regionOuest", Centre: "regionCentre",
  Sud: "regionSud", Nord: "regionNord", Est: "regionEst",
  Adamaoua: "regionAdamaoua", "Extrême-Nord": "regionExtremeNord",
  "Nord-Ouest": "regionNordOuest", "Sud-Ouest": "regionSudOuest",
}

export default function AppHomePage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)

  const featured = useMemo(
    () => FEATURED_IDS.map((id) => recipes.find((r) => r.id === id)).filter(Boolean) as typeof recipes,
    [recipes]
  )
  const popular = useMemo(
    () => POPULAR_IDS.map((id) => recipes.find((r) => r.id === id)).filter(Boolean) as typeof recipes,
    [recipes]
  )

  return (
    <div className="space-y-6 pb-4">
      <StoreBanner />

      {/* Header */}
      <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
        {t("welcome")} 👋
      </h1>

      {/* Search bar */}
      <Link
        href={`/${locale}/app/search`}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-foreground/5 bg-surface px-4 py-3 text-sm text-muted dark:border-white/5 dark:bg-dark-surface dark:text-dark-muted"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">{t("searchPlaceholder")}</span>
      </Link>

      {/* Regions */}
      <section>
        <h2 className="mb-4 text-base font-bold text-foreground dark:text-white">
          {t("regions")}
        </h2>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
          {ALL_REGIONS.map((region) => {
            const Icon = regionIcons[region]
            return (
              <Link
                key={region}
                href={`/${locale}/app/search?region=${encodeURIComponent(region)}`}
                className="flex shrink-0 cursor-pointer flex-col items-center gap-2"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-tags text-primary transition-colors hover:bg-primary hover:text-white dark:bg-primary/15 dark:hover:bg-primary">
                  <Icon className="size-5" />
                </div>
                <span className="w-16 truncate text-center text-[11px] font-semibold text-foreground dark:text-white">
                  {t(regionTranslationKeys[region] as Parameters<typeof t>[0])}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured — Carousel */}
      <section>
        <h2 className="mb-4 text-base font-bold text-foreground dark:text-white">
          {t("featuredRecipes")}
        </h2>
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
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
          <CarouselPrevious className="-left-3 size-10 border-foreground/10 bg-surface text-foreground active:-translate-y-1/2 hover:bg-surface dark:border-white/10 dark:bg-dark-surface dark:text-white dark:hover:bg-dark-surface" />
          <CarouselNext className="-right-3 size-10 border-foreground/10 bg-surface text-foreground active:-translate-y-1/2 hover:bg-surface dark:border-white/10 dark:bg-dark-surface dark:text-white dark:hover:bg-dark-surface" />
        </Carousel>
      </section>

      {/* Popular */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground dark:text-white">
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
