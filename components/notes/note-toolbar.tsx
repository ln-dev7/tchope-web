"use client"

import { Heading1, Heading2, List, ListChecks, ListOrdered, Pilcrow, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TranslationKey } from "@/constants/translations"
import type { NoteBlockType } from "@/types/recipe"

/** Même ordre que tchope/components/notes/NoteToolbar.tsx, avec le raccourci Markdown équivalent. */
const ITEMS: { type: NoteBlockType; icon: LucideIcon; labelKey: TranslationKey; shortcut?: string }[] = [
  { type: "paragraph", icon: Pilcrow, labelKey: "formatParagraph" },
  { type: "heading1", icon: Heading1, labelKey: "formatHeading1", shortcut: "#" },
  { type: "heading2", icon: Heading2, labelKey: "formatHeading2", shortcut: "##" },
  { type: "bullet", icon: List, labelKey: "formatBullet", shortcut: "-" },
  { type: "numbered", icon: ListOrdered, labelKey: "formatNumbered", shortcut: "1." },
  { type: "checklist", icon: ListChecks, labelKey: "formatChecklist", shortcut: "[]" },
]

type Props = {
  activeType: NoteBlockType | null
  onSelect: (type: NoteBlockType) => void
  t: (key: TranslationKey) => string
  className?: string
}

export function NoteToolbar({ activeType, onSelect, t, className }: Props) {
  return (
    <div
      role="toolbar"
      aria-label={t("editNote")}
      className={cn("flex items-center gap-1.5", className)}
    >
      {ITEMS.map((item) => {
        const active = activeType === item.type
        const label = t(item.labelKey)
        return (
          <button
            key={item.type}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={item.shortcut ? `${label}  ·  ${item.shortcut}␣` : label}
            // Garde le focus dans le bloc en cours d'édition (clavier virtuel ouvert sur téléphone).
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item.type)}
            className={cn(
              "flex h-10 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors",
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-transparent bg-surface text-foreground hover:bg-primary/10 hover:text-primary dark:bg-dark-surface dark:text-white dark:hover:bg-primary/15"
            )}
          >
            <item.icon className="size-5" />
          </button>
        )
      })}
    </div>
  )
}
