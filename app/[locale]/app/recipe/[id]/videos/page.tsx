"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Play, Youtube } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import {
  getRecipeVideos,
  getRecipeVideosEn,
  hasMultipleLanguages,
} from "@/constants/videos"

type Lang = "fr" | "en"

export default function RecipeVideosPage() {
  const params = useParams()
  const router = useRouter()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const recipes = useLocalizedRecipes(locale)
  const recipeId = params.id as string
  const recipe = recipes.find((r) => r.id === recipeId)

  const showTabs = hasMultipleLanguages(recipeId)
  const [lang, setLang] = useState<Lang>("fr")

  const videos = useMemo(() => {
    if (lang === "en") return getRecipeVideosEn(recipeId) ?? []
    return getRecipeVideos(recipeId) ?? []
  }, [recipeId, lang])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface dark:bg-dark-surface"
        >
          <ArrowLeft className="size-5 text-foreground dark:text-white" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted dark:text-dark-muted">
            {t("videoRecipes")}
          </p>
          <h1 className="truncate text-lg font-bold text-foreground dark:text-white">
            {recipe?.name ?? recipeId}
          </h1>
        </div>
      </div>

      {/* Language tabs */}
      {showTabs && (
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1 dark:bg-white/5">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                lang === l
                  ? "bg-surface text-primary shadow-sm dark:bg-dark-surface"
                  : "text-muted dark:text-dark-muted"
              }`}
            >
              {l === "fr" ? "🇫🇷 Français" : "🇬🇧 English"}
            </button>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-4 rounded-2xl bg-primary/8 p-5 dark:bg-primary/15">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Play className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground dark:text-white">
            {t("videoTutorials")}
          </p>
          <p className="mt-0.5 text-xs text-muted dark:text-dark-muted">
            {t("videoSubtitle")}
          </p>
        </div>
      </div>

      {/* Video cards */}
      <div className="space-y-4">
        {videos.map((video, index) => (
          <div
            key={`${lang}-${video.id}`}
            className="overflow-hidden rounded-3xl bg-surface dark:bg-dark-surface"
          >
            {/* Embedded YouTube player */}
            <div className="relative aspect-video w-full overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {/* Info */}
            <div className="p-5">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground dark:text-white">
                {video.title}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <Youtube className="size-4 text-red-500" />
                <span className="text-xs text-muted dark:text-dark-muted">
                  {index + 1}/{videos.length}
                </span>
                {showTabs && (
                  <span className="ml-1 text-xs text-muted dark:text-dark-muted">
                    · {lang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
