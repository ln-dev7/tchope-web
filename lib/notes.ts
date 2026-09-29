import type { Note, NoteBlock } from "@/types/recipe"

/** Même logique que tchope/context/NotesContext.tsx et components/notes/utils.ts. */

export function createEmptyBlock(type: NoteBlock["type"] = "paragraph"): NoteBlock {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content: "",
    ...(type === "checklist" ? { checked: false } : {}),
  }
}

export function createEmptyNote(): Note {
  const now = new Date().toISOString()
  return {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    blocks: [createEmptyBlock("paragraph")],
    createdAt: now,
    updatedAt: now,
  }
}

export function noteToPlainText(note: Note): string {
  const lines: string[] = []
  let numberedCounter = 0
  for (const block of note.blocks) {
    const content = block.content.trim()
    if (block.type === "numbered") numberedCounter += 1
    else numberedCounter = 0
    if (!content && block.type !== "paragraph") continue
    switch (block.type) {
      case "heading1":
        lines.push(`# ${content}`)
        break
      case "heading2":
        lines.push(`## ${content}`)
        break
      case "bullet":
        lines.push(`• ${content}`)
        break
      case "numbered":
        lines.push(`${numberedCounter}. ${content}`)
        break
      case "checklist":
        lines.push(`${block.checked ? "[x]" : "[ ]"} ${content}`)
        break
      default:
        lines.push(content)
    }
  }
  return lines.join("\n")
}

export function notePreview(note: Note, maxChars = 80): string {
  for (const block of note.blocks) {
    const text = block.content.trim()
    if (text) return text.length > maxChars ? text.slice(0, maxChars) + "…" : text
  }
  return ""
}

export function isNoteEmpty(note: Note): boolean {
  if (note.title.trim()) return false
  return note.blocks.every((b) => !b.content.trim())
}

export function formatRelativeDate(iso: string, isFr: boolean): string {
  const date = new Date(iso)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(isFr ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })
  }
  if (date.toDateString() === yesterday.toDateString()) return isFr ? "Hier" : "Yesterday"
  return date.toLocaleDateString(isFr ? "fr-FR" : "en-US", { day: "numeric", month: "short" })
}
