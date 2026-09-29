"use client"

import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react"
import { Square, SquareCheckBig } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NoteBlock as NoteBlockData } from "@/types/recipe"
import { AutoTextarea } from "./auto-textarea"

type Props = {
  block: NoteBlockData
  numberedIndex: number
  placeholder?: string
  /** Nom du type de bloc (lecteurs d'écran). */
  label: string
  checkLabel: string
  inputRef: (el: HTMLTextAreaElement | null) => void
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onPaste: (e: ClipboardEvent<HTMLTextAreaElement>) => void
  onFocus: () => void
  onToggleCheck: () => void
}

/** Styles par type, repris de tchope/components/notes/NoteBlock.tsx (16/24, 24/32, 19/26). */
const TEXT_BY_TYPE: Record<NoteBlockData["type"], string> = {
  paragraph: "text-base leading-6",
  heading1: "text-2xl font-extrabold leading-8 tracking-tight",
  heading2: "text-[19px] font-bold leading-[26px]",
  bullet: "text-base leading-6",
  numbered: "text-base leading-6",
  checklist: "text-base leading-6",
}

export function NoteBlock({
  block,
  numberedIndex,
  placeholder,
  label,
  checkLabel,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  onToggleCheck,
}: Props) {
  const checked = block.type === "checklist" && !!block.checked

  return (
    <div className="flex items-start gap-1.5">
      {block.type === "bullet" && (
        <span
          aria-hidden
          className="mt-1 w-[18px] shrink-0 text-center text-lg leading-6 text-foreground select-none dark:text-white"
        >
          •
        </span>
      )}
      {block.type === "numbered" && (
        <span
          aria-hidden
          className="mt-1 min-w-[22px] shrink-0 text-base leading-6 text-foreground tabular-nums select-none dark:text-white"
        >
          {numberedIndex}.
        </span>
      )}
      {block.type === "checklist" && (
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label={block.content.trim() || checkLabel}
          // Ne vole pas le focus du bloc en cours d'édition.
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleCheck}
          className="mt-0.5 -ml-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-primary/10"
        >
          {checked ? (
            <SquareCheckBig className="size-5 text-primary" />
          ) : (
            <Square className="size-5 text-muted dark:text-dark-muted" />
          )}
        </button>
      )}
      <AutoTextarea
        inputRef={inputRef}
        value={block.content}
        placeholder={placeholder}
        aria-label={label}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={onFocus}
        className={cn(
          "flex-1 scroll-mt-36 scroll-mb-28 py-1 text-foreground placeholder:text-muted/70 dark:text-white dark:placeholder:text-dark-muted/70",
          TEXT_BY_TYPE[block.type],
          checked && "text-muted line-through decoration-muted/60 dark:text-dark-muted"
        )}
      />
    </div>
  )
}
