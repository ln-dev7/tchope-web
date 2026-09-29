"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, FileQuestion } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useNotes } from "@/stores/notes"
import { createEmptyNote } from "@/lib/notes"
import type { Locale } from "@/lib/i18n"
import { NoteEditor } from "@/components/notes/note-editor"
import { EmptyState } from "@/components/notes/empty-state"
import { useNotesHydrated } from "@/components/notes/hooks"

/** Dernier segment de l'URL : « new » ou l'id de la note. */
function noteIdFromPath(pathname: string): string {
  const last = pathname.split("/").filter(Boolean).pop() ?? "new"
  try {
    return decodeURIComponent(last)
  } catch {
    return last
  }
}

export default function NotePage() {
  const { locale } = useLocale()
  const pathname = usePathname()
  const hydrated = useNotesHydrated()
  // L'id est lu une seule fois dans l'URL (et pas dans les paramètres de route) :
  // l'éditeur remplace /note/new par /note/<id> dès le premier caractère tapé.
  const [noteId] = useState(() => noteIdFromPath(pathname))

  // Les notes vivent dans localStorage : rien à afficher avant l'hydratation.
  if (!hydrated) return <div className="min-h-[60vh]" />
  return <NoteScreen noteId={noteId} locale={locale} />
}

function NoteScreen({ noteId, locale }: { noteId: string; locale: Locale }) {
  // Comme le mobile : /note/new ouvre une note vierge, créée au premier caractère.
  const [initial] = useState(() =>
    noteId === "new"
      ? { note: createEmptyNote(), isNew: true }
      : { note: useNotes.getState().getNote(noteId), isNew: false }
  )

  if (!initial.note) return <NoteNotFound locale={locale} />
  return <NoteEditor initialNote={initial.note} isNew={initial.isNew} locale={locale} />
}

function NoteNotFound({ locale }: { locale: Locale }) {
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <EmptyState
        icon={FileQuestion}
        title={isFr ? "Note introuvable" : "Note not found"}
        subtitle={
          isFr
            ? "Cette note n'existe pas ou a été supprimée. Les notes sont enregistrées dans ce navigateur."
            : "This note doesn't exist or has been deleted. Notes are saved in this browser."
        }
      >
        <Link
          href={`/${locale}/app/notes`}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-primary-dark"
        >
          <ArrowLeft className="size-[18px]" />
          {t("myNotes")}
        </Link>
      </EmptyState>
    </div>
  )
}
