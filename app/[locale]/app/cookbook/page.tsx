"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Plus,
  CirclePlus,
  Trash2,
  Pencil,
  FileText,
  ChevronRight,
  Heart,
  MapPin,
  Clock,
  PenLine,
} from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useFavorites } from "@/stores/favorites"
import { useUserRecipes } from "@/stores/user-recipes"
import { useNotes } from "@/stores/notes"
import { StoreBanner } from "@/components/store-banner"
import { RecipeImage } from "@/components/recipe-image"
import { EmptyState } from "@/components/notes/empty-state"
import { useHydrated } from "@/components/notes/hooks"
import type { Locale } from "@/lib/i18n"
import type { Recipe, UserRecipe } from "@/types/recipe"
import type { TranslationKey } from "@/constants/translations"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

type Tab = "myRecipes" | "favorites"
type Filter = "all" | "breakfast" | "sundayFeast" | "starters" | "sauces"

const TABS: Tab[] = ["myRecipes", "favorites"]
const FILTERS: Filter[] = ["all", "breakfast", "sundayFeast", "starters", "sauces"]

/** Mêmes filtres que tchope/app/(tabs)/cookbook.tsx. */
function matchesFilter(recipe: Recipe, filter: Filter): boolean {
  switch (filter) {
    case "breakfast":
      return !!recipe.tags?.includes("Breakfast")
    case "sundayFeast":
      return !!recipe.tags?.includes("Sunday Feast")
    case "starters":
      return recipe.category === "Entrée"
    case "sauces":
      return recipe.category === "Sauce"
    default:
      return true
  }
}

export default function CookbookPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  // Favoris, recettes et notes sont dans localStorage : affichés une fois côté client.
  const hydrated = useHydrated()
  const recipes = useLocalizedRecipes(locale)
  const favorites = useFavorites((s) => s.favorites)
  const userRecipes = useUserRecipes((s) => s.userRecipes)
  const notesCount = useNotes((s) => s.notes.length)
  const [tab, setTab] = useState<Tab>("myRecipes")
  const [filter, setFilter] = useState<Filter>("all")

  const savedRecipes = useMemo(
    () => recipes.filter((r) => favorites.includes(r.id) && matchesFilter(r, filter)),
    [recipes, favorites, filter]
  )

  const addRecipeHref = `/${locale}/app/add-recipe`

  return (
    <div className="space-y-6 pb-4">
      <StoreBanner />

      {/* Titre + bouton ajouter */}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wider text-muted uppercase dark:text-dark-muted">
            {t("personalSpace")}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl dark:text-white">
            {t("myCookbook")}
          </h1>
        </div>
        <Link
          href={addRecipeHref}
          aria-label={t("addRecipe")}
          title={t("addRecipe")}
          className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25 transition-transform hover:scale-105"
        >
          <Plus className="size-6" />
        </Link>
      </div>

      {/* Raccourci vers les notes */}
      <Link
        href={`/${locale}/app/notes`}
        className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-foreground/5 bg-surface p-4 transition-colors hover:border-primary/25 dark:border-white/5 dark:bg-dark-surface dark:hover:border-primary/30"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary dark:bg-primary/15">
          <FileText className="size-[22px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-foreground dark:text-white">{t("myNotes")}</p>
          <p className="mt-0.5 truncate text-xs text-muted dark:text-dark-muted">
            {!hydrated || notesCount === 0
              ? t("notesSubtitle")
              : t("notesCount").replace("{count}", String(notesCount))}
          </p>
        </div>
        <ChevronRight className="size-[18px] shrink-0 text-muted transition-transform group-hover:translate-x-0.5 dark:text-dark-muted" />
      </Link>

      {/* Onglets */}
      <div role="tablist" className="flex rounded-full bg-foreground/5 p-1.5 dark:bg-white/5">
        {TABS.map((key) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`flex-1 cursor-pointer rounded-full py-3 text-sm font-semibold transition-all ${
                active
                  ? "bg-surface text-primary shadow-sm dark:bg-dark-surface"
                  : "text-muted hover:text-foreground dark:text-dark-muted dark:hover:text-white"
              }`}
            >
              {t(key)}
            </button>
          )
        })}
      </div>

      {tab === "myRecipes" ? (
        /* Mes recettes */
        <div role="tabpanel" className="space-y-5">
          <Link
            href={addRecipeHref}
            className="flex cursor-pointer items-center justify-center gap-2.5 rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 py-5 text-base font-semibold text-primary transition-colors hover:border-primary/35 hover:bg-primary/10 dark:border-primary/25 dark:bg-primary/10"
          >
            <CirclePlus className="size-[22px]" />
            {t("addRecipe")}
          </Link>

          {!hydrated ? null : userRecipes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {userRecipes.map((recipe) => (
                <UserRecipeCard key={recipe.id} recipe={recipe} locale={locale} t={t} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={PenLine}
              title={t("noUserRecipes")}
              subtitle={t("noUserRecipesSubtitle")}
            />
          )}
        </div>
      ) : (
        /* Mes favoris */
        <div role="tabpanel" className="space-y-5">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
            {FILTERS.map((key) => {
              const active = filter === key
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(key)}
                  className={`shrink-0 cursor-pointer rounded-full px-5 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-primary font-semibold text-white"
                      : "bg-[#EFC6B9]/55 font-medium text-[#51352C] hover:bg-[#EFC6B9] dark:bg-[#3A2518] dark:text-[#FFCBA4] dark:hover:bg-[#4A2F1E]"
                  }`}
                >
                  {t(key)}
                </button>
              )
            })}
          </div>

          {!hydrated ? null : savedRecipes.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {savedRecipes.map((recipe) => (
                <FavoriteGridCard key={recipe.id} recipe={recipe} locale={locale} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Heart} title={t("noFavorites")} subtitle={t("noFavoritesSubtitle")} />
          )}
        </div>
      )}
    </div>
  )
}

/** Recette créée : carte (comme RecipeCard du mobile) avec modifier / supprimer. */
function UserRecipeCard({
  recipe,
  locale,
  t,
}: {
  recipe: UserRecipe
  locale: Locale
  t: (key: TranslationKey) => string
}) {
  const deleteRecipe = useUserRecipes((s) => s.deleteRecipe)

  return (
    <div className="relative">
      <Link
        href={`/${locale}/app/recipe/${recipe.id}`}
        className="group flex cursor-pointer items-center gap-4 rounded-[28px] bg-surface p-3 dark:bg-dark-surface"
      >
        <div className="relative size-20 shrink-0 overflow-hidden rounded-3xl sm:size-24">
          <RecipeImage
            recipeId={recipe.id}
            category={recipe.category}
            alt={recipe.name}
            fill
            imageUri={recipe.imageUri}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1 pr-20">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground dark:text-white">
            {recipe.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted dark:text-dark-muted">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{recipe.region}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-foreground/80 dark:text-white/80">
            <Clock className="size-3.5" />
            {recipe.duration} min
          </p>
        </div>
      </Link>

      <div className="absolute top-3 right-3 flex gap-2">
        <Link
          href={`/${locale}/app/add-recipe?edit=${recipe.id}`}
          aria-label={t("editRecipe")}
          title={t("editRecipe")}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 dark:bg-primary/15"
        >
          <Pencil className="size-3.5" />
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label={t("delete")}
              title={t("delete")}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="size-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{t("clearConfirmMessage")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteRecipe(recipe.id)
                  toast.success(t("recipeDeleted"))
                }}
              >
                {t("confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

/** Favori : carte en grille (comme RecipeGridCard du mobile) avec le cœur pour retirer. */
function FavoriteGridCard({ recipe, locale }: { recipe: Recipe; locale: Locale }) {
  const toggleFavorite = useFavorites((s) => s.toggleFavorite)
  const isFr = locale === "fr"

  return (
    <div className="group relative min-w-0">
      <Link href={`/${locale}/app/recipe/${recipe.id}`} className="block cursor-pointer">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-[#EAE7E7] dark:bg-[#2A2A2A]">
          <RecipeImage
            recipeId={recipe.id}
            category={recipe.category}
            alt={recipe.name}
            fill
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-2 truncate text-base font-bold text-foreground sm:text-lg dark:text-white">
          {recipe.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted dark:text-dark-muted">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{recipe.region}</span>
        </p>
      </Link>
      <button
        type="button"
        aria-label={isFr ? "Retirer des favoris" : "Remove from favorites"}
        onClick={() => {
          toggleFavorite(recipe.id)
          toast.success(isFr ? "Retiré des favoris" : "Removed from favorites", {
            action: {
              label: isFr ? "Annuler" : "Undo",
              onClick: () => toggleFavorite(recipe.id),
            },
          })
        }}
        className="absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-transform hover:scale-105 dark:bg-dark/70"
      >
        <Heart className="size-5 fill-red-500 text-red-500" />
      </button>
    </div>
  )
}
