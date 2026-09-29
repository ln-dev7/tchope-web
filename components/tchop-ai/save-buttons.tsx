"use client"

import { useState } from "react"
import { BookOpen, CheckCircle2, FileText, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note, UserRecipe } from "@/types/recipe"
import type { useAppTranslations } from "@/hooks/use-app-translations"
import { focusRingPrimary } from "./styles"

type T = ReturnType<typeof useAppTranslations>["t"]

function SaveButton({
  saved,
  onPress,
  icon: Icon,
  label,
  savedLabel,
}: {
  saved: boolean
  onPress: () => void
  icon: LucideIcon
  label: string
  savedLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={saved}
      className={cn(
        "mt-2 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-semibold transition-colors",
        saved
          ? "cursor-default bg-[#F3F0EF] text-muted dark:bg-[#2A2A2A] dark:text-dark-muted"
          : "cursor-pointer bg-primary text-white hover:bg-primary-dark",
        focusRingPrimary
      )}
    >
      {saved ? <CheckCircle2 className="size-[18px]" /> : <Icon className="size-[18px]" />}
      {saved ? savedLabel : label}
    </button>
  )
}

/** « Ajouter au Cookbook » sous une réponse [SAVE_RECIPE:…] (comme SaveRecipeButton sur mobile). */
export function SaveRecipeButton({
  recipe,
  onSave,
  alreadySaved,
  t,
}: {
  recipe: UserRecipe
  onSave: (r: UserRecipe) => void
  alreadySaved: boolean
  t: T
}) {
  const [clicked, setClicked] = useState(false)
  const saved = alreadySaved || clicked

  return (
    <SaveButton
      saved={saved}
      onPress={() => {
        if (saved) return
        onSave(recipe)
        setClicked(true)
      }}
      icon={BookOpen}
      label={t("addToCookbook")}
      savedLabel={t("recipeAlreadyAdded")}
    />
  )
}

/** Bouton d'ajout aux notes sous une réponse [SAVE_NOTE:…] (comme SaveNoteButton sur mobile). */
export function SaveNoteButton({
  note,
  onSave,
  alreadySaved,
  t,
}: {
  note: Note
  onSave: (n: Note) => void
  alreadySaved: boolean
  t: T
}) {
  const [clicked, setClicked] = useState(false)
  const saved = alreadySaved || clicked

  return (
    <SaveButton
      saved={saved}
      onPress={() => {
        if (saved) return
        onSave(note)
        setClicked(true)
      }}
      icon={FileText}
      label={t("addNote")}
      savedLabel={t("noteSaved")}
    />
  )
}
