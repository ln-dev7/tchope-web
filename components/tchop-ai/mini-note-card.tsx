"use client"

import Link from "next/link"
import { ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { notePreview } from "@/lib/notes"
import type { Note } from "@/types/recipe"
import type { Locale } from "@/lib/i18n"
import { focusRingPrimary } from "./styles"

/** Note liée sous une réponse de TchopAI (comme MiniNoteCard sur mobile). */
export function MiniNoteCard({
  note,
  locale,
  untitledLabel,
}: {
  note: Note
  locale: Locale
  untitledLabel: string
}) {
  const title = note.title.trim() || untitledLabel
  const preview = notePreview(note, 60)

  return (
    <Link
      href={`/${locale}/app/note/${note.id}`}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-2xl border border-[#E8E5E4] bg-white p-2.5 transition-colors hover:border-primary/30 dark:border-[#3A3A3A] dark:bg-[#2A2A2A] dark:hover:border-primary/40",
        focusRingPrimary
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileText className="size-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground dark:text-white">{title}</p>
        {preview ? (
          <p className="truncate text-[11px] text-muted dark:text-dark-muted">{preview}</p>
        ) : null}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted dark:text-dark-muted" />
    </Link>
  )
}
