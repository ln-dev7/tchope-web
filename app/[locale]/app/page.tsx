"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Search,
  MapPin,
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
} from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { FeaturedCard } from "@/components/featured-card"
import { RecipeCard } from "@/components/recipe-card"
import type { Region } from "@/types/recipe"
import type { LucideIcon } from "lucide-react"

const FEATURED_IDS = [
  "ndole",
  "poulet-dg",
  "eru",
  "kondre",
  "poisson-braise",
  "koki",
  "okok-sale",
]

const POPULAR_IDS = [
  "ndole",
  "poulet-dg",
  "eru",
  "poisson-braise",
  "beignets-haricots",
  "jus-gingembre",
  "soya",
  "kondre",
  "koki",
  "okok-sale",
]

const regionIcons: Record<Region, LucideIcon> = {
  Littoral: Droplets,
  Ouest: Triangle,
  Centre: Building2,
  Sud: Compass,
  Nord: Sun,
  Est: Leaf,
  Adamaoua: Signpost,
  "Extrême-Nord": Thermometer,
  "Nord-Ouest": Map,
  "Sud-Ouest": Ship,
}

const ALL_REGIONS: Region[] = [
  "Littoral",
  "Ouest",
  "Centre",
  "Sud",
  "Nord",
  "Est",
  "Adamaoua",
  "Extrême-Nord",
  "Nord-Ouest",
  "Sud-Ouest",
]

const regionTranslationKeys: Record<Region, string> = {
  Littoral: "regionLittoral",
  Ouest: "regionOuest",
  Centre: "regionCentre",
  Sud: "regionSud",
  Nord: "regionNord",
  Est: "regionEst",
  Adamaoua: "regionAdamaoua",
  "Extrême-Nord": "regionExtremeNord",
  "Nord-Ouest": "regionNordOuest",
  "Sud-Ouest": "regionSudOuest",
}

export default function AppHomePage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)

  const featured = useMemo(
    () => recipes.filter((r) => FEATURED_IDS.includes(r.id)),
    [recipes]
  )

  const popular = useMemo(
    () => recipes.filter((r) => POPULAR_IDS.includes(r.id)),
    [recipes]
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground dark:text-white">
          {t("welcome")} 👋
        </h1>
      </div>

      {/* Search bar (link to search) */}
      <Link
        href={`/${locale}/app/search`}
        className="flex items-center gap-3 rounded-2xl border border-foreground/5 bg-surface px-4 py-3.5 text-sm text-muted transition-colors hover:border-primary/20 dark:border-white/5 dark:bg-dark-surface dark:text-dark-muted"
      >
        <Search className="size-4" />
        {t("searchPlaceholder")}
      </Link>

      {/* Regions */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground dark:text-white">
          {t("regions")}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ALL_REGIONS.map((region) => {
            const Icon = regionIcons[region]
            return (
              <Link
                key={region}
                href={`/${locale}/app/search?region=${encodeURIComponent(region)}`}
                className="flex shrink-0 flex-col items-center gap-2"
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

      {/* Featured */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground dark:text-white">
          {t("featuredRecipes")}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {featured.map((r) => (
            <FeaturedCard key={r.id} recipe={r} locale={locale} />
          ))}
        </div>
      </section>

      {/* Popular */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground dark:text-white">
          {t("popularRecipes")}
        </h2>
        <div className="space-y-3">
          {popular.map((r) => (
            <RecipeCard key={r.id} recipe={r} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  )
}
