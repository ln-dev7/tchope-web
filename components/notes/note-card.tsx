"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { formatRelativeDate, notePreview } from "@/lib/notes"
import type { Locale } from "@/lib/i18n"
import type { Note } from "@/types/recipe"
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

/** Carte de la liste des notes (tchope/components/notes/NoteCard.tsx). */
export function NoteCard({
  note,
  locale,
  onDelete,
}: {
  note: Note
  locale: Locale
  onDelete: () => void
}) {
  const { t } = useAppTranslations(locale)
  const title = note.title.trim() || t("untitledNote")
  const preview = notePreview(note)
  const date = formatRelativeDate(note.updatedAt, locale === "fr")

  return (
    <div className="group relative rounded-2xl border border-foreground/5 bg-surface transition-colors hover:border-primary/25 dark:border-white/5 dark:bg-dark-surface dark:hover:border-primary/30">
      <Link
        href={`/${locale}/app/note/${note.id}`}
        className="flex h-full cursor-pointer flex-col gap-1 rounded-2xl p-4 pr-14 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <h3 className="truncate text-base font-bold text-foreground dark:text-white">{title}</h3>
        {preview ? (
          <p className="line-clamp-2 text-[13px] leading-[18px] text-foreground/65 dark:text-white/65">
            {preview}
          </p>
        ) : (
          <p className="text-[13px] leading-[18px] text-muted italic dark:text-dark-muted">
            {t("noteEmpty")}
          </p>
        )}
        <p className="mt-auto pt-1 text-xs text-muted dark:text-dark-muted">{date}</p>
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            aria-label={t("deleteNote")}
            title={t("deleteNote")}
            className="absolute top-3.5 right-3.5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="size-3.5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteNoteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteNoteMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
