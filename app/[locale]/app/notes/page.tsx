"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Plus, CirclePlus } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useNotes } from "@/stores/notes"
import { NoteCard } from "@/components/notes/note-card"
import { EmptyState } from "@/components/notes/empty-state"
import { useGoBack, useNotesHydrated } from "@/components/notes/hooks"

/** Liste des notes (port de tchope/app/notes.tsx). */
export default function NotesPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const hydrated = useNotesHydrated()
  const notes = useNotes((s) => s.notes)
  const deleteNote = useNotes((s) => s.deleteNote)
  const goBack = useGoBack(`/${locale}/app/cookbook`)

  // Les plus récemment modifiées en premier, comme sur le mobile.
  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes]
  )

  const newNoteHref = `/${locale}/app/note/new`
  const count = hydrated ? notes.length : 0

  return (
    <div className="space-y-5 pb-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={isFr ? "Retour" : "Back"}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-primary/10 dark:bg-dark-surface dark:text-white"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-extrabold text-foreground dark:text-white">{t("myNotes")}</h1>
          <p className="mt-0.5 text-xs text-muted dark:text-dark-muted">
            {hydrated ? t("notesCount").replace("{count}", String(count)) : " "}
          </p>
        </div>
        {hydrated && sortedNotes.length > 0 && (
          <Link
            href={newNoteHref}
            aria-label={t("addNote")}
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary text-white transition-colors hover:bg-primary-dark sm:w-auto sm:px-4"
          >
            <Plus className="size-[22px] sm:size-5" />
            <span className="hidden text-sm font-bold sm:inline">{t("addNote")}</span>
          </Link>
        )}
      </header>

      {!hydrated ? null : sortedNotes.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col justify-center">
          <EmptyState icon={FileText} title={t("noNotes")} subtitle={t("noNotesSubtitle")}>
            <Link
              href={newNoteHref}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary-dark"
            >
              <CirclePlus className="size-[18px]" />
              {t("addNote")}
            </Link>
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              locale={locale}
              onDelete={() => deleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
