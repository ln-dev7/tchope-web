"use client"

import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recipe, UserRecipe, Note } from "@/types/recipe"
import type { Locale } from "@/lib/i18n"
import type { useAppTranslations } from "@/hooks/use-app-translations"
import type { Message } from "./types"
import { MiniRecipeCard } from "./mini-recipe-card"
import { MiniNoteCard } from "./mini-note-card"
import { SaveRecipeButton, SaveNoteButton } from "./save-buttons"
import { focusRing } from "./styles"

type Props = {
  item: Message
  locale: Locale
  isFr: boolean
  recipes: Recipe[]
  userRecipes: UserRecipe[]
  notes: Note[]
  copied: boolean
  onCopy: (item: Message) => void
  onSaveRecipe: (r: UserRecipe) => void
  onSaveNote: (n: Note) => void
  t: ReturnType<typeof useAppTranslations>["t"]
}

/** Une bulle du chat (comme tchope/components/tchop-ai/ChatMessage.tsx). */
export function ChatMessage({
  item,
  locale,
  isFr,
  recipes,
  userRecipes,
  notes,
  copied,
  onCopy,
  onSaveRecipe,
  onSaveNote,
  t,
}: Props) {
  if (item.role === "info") {
    return (
      <div className="mb-2 flex justify-center px-5 motion-safe:animate-in motion-safe:fade-in-0">
        <p className="text-center text-xs text-muted dark:text-dark-muted">{item.content}</p>
      </div>
    )
  }

  const isUser = item.role === "user"
  const linkedRecipes = (item.recipeIds ?? [])
    .map((id) => recipes.find((r) => r.id === id))
    .filter(Boolean) as Recipe[]
  const linkedNotes = (item.noteIds ?? [])
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean) as Note[]
  const hasExtras = linkedRecipes.length > 0 || linkedNotes.length > 0 || !!item.saveRecipe || !!item.saveNote

  return (
    <div
      className={cn(
        "mb-3 flex max-w-[82%] flex-col motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300",
        isUser ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      <span className="sr-only">{isUser ? (isFr ? "Vous :" : "You:") : isFr ? "TchopAI :" : "TchopAI:"}</span>
      <div
        className={cn(
          // max-w-full : sans lui, un lien long (collé pour « Analyse du lien ») élargit la bulle hors de l'écran.
          "max-w-full rounded-[20px] px-4 py-3 text-[15px] leading-[22px] break-words whitespace-pre-wrap",
          isUser
            ? "rounded-br-[6px] bg-primary text-white"
            : "rounded-bl-[6px] bg-[#F3F0EF] text-foreground dark:bg-[#2A2A2A] dark:text-white"
        )}
      >
        {item.content}
      </div>

      {!isUser && item.id !== "welcome" && (
        <button
          type="button"
          onClick={() => onCopy(item)}
          aria-label={copied ? (isFr ? "Copié" : "Copied") : isFr ? "Copier la réponse" : "Copy reply"}
          title={isFr ? "Copier" : "Copy"}
          className={cn(
            "mt-1 flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white",
            focusRing
          )}
        >
          {copied ? (
            <Check className="size-3.5 text-[#0A6A1D] dark:text-[#4CAF50]" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied && (
            <span className="text-[11px] font-semibold text-[#0A6A1D] dark:text-[#4CAF50]">
              {isFr ? "Copié" : "Copied"}
            </span>
          )}
        </button>
      )}

      {hasExtras && (
        <div className="w-80 max-w-full">
          {linkedRecipes.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {linkedRecipes.map((recipe) => (
                <MiniRecipeCard key={recipe.id} recipe={recipe} locale={locale} />
              ))}
            </div>
          )}
          {linkedNotes.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {linkedNotes.map((note) => (
                <MiniNoteCard key={note.id} note={note} locale={locale} untitledLabel={t("untitledNote")} />
              ))}
            </div>
          )}
          {item.saveRecipe && (
            <SaveRecipeButton
              recipe={item.saveRecipe}
              onSave={onSaveRecipe}
              alreadySaved={userRecipes.some((r) => r.id === item.saveRecipe!.id)}
              t={t}
            />
          )}
          {item.saveNote && (
            <SaveNoteButton
              note={item.saveNote}
              onSave={onSaveNote}
              alreadySaved={notes.some((n) => n.id === item.saveNote!.id)}
              t={t}
            />
          )}
        </div>
      )}
    </div>
  )
}
