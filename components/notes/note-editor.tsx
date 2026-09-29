"use client"

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react"
import { ArrowLeft, Check, Trash2 } from "lucide-react"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useNotes } from "@/stores/notes"
import { createEmptyBlock, isNoteEmpty } from "@/lib/notes"
import type { TranslationKey } from "@/constants/translations"
import type { Locale } from "@/lib/i18n"
import type { Note, NoteBlock as NoteBlockData, NoteBlockType } from "@/types/recipe"
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
import { AutoTextarea } from "./auto-textarea"
import { NoteBlock } from "./note-block"
import { NoteToolbar } from "./note-toolbar"
import { useGoBack } from "./hooks"
import {
  columnOf,
  focusAt,
  focusFromAbove,
  focusFromBelow,
  isCaretOnFirstLine,
  isCaretOnLastLine,
} from "./caret"

/* ------------------------------------------------------------------ */
/* Opérations pures sur la liste des blocs                             */
/* ------------------------------------------------------------------ */

type Caret = number | "end"
type Focus = { id: string; caret: Caret }
type Change = { blocks: NoteBlockData[]; focus?: Focus } | null

const TITLE_ID = "__title__"

const TYPE_LABEL: Record<NoteBlockType, TranslationKey> = {
  paragraph: "formatParagraph",
  heading1: "formatHeading1",
  heading2: "formatHeading2",
  bullet: "formatBullet",
  numbered: "formatNumbered",
  checklist: "formatChecklist",
}

function isList(type: NoteBlockType) {
  return type === "bullet" || type === "numbered" || type === "checklist"
}

/** Changement de type, comme setActiveBlockType sur mobile (checked initialisé pour les cases). */
function withType(block: NoteBlockData, type: NoteBlockType): NoteBlockData {
  return {
    ...block,
    type,
    ...(type === "checklist" && block.checked === undefined ? { checked: false } : {}),
  }
}

function replaceAt(blocks: NoteBlockData[], index: number, ...inserted: NoteBlockData[]) {
  return [...blocks.slice(0, index), ...inserted, ...blocks.slice(index + 1)]
}

/** Entrée : coupe le bloc au curseur (même type pour les listes, paragraphe sinon). */
function splitBlock(blocks: NoteBlockData[], index: number, before: string, after: string): Change {
  const current = blocks[index]
  // Liste vide + Entrée → on sort de la liste (le bloc redevient un paragraphe), comme le mobile.
  if (isList(current.type) && !before.trim() && !after.trim()) {
    return {
      blocks: replaceAt(blocks, index, { ...current, type: "paragraph", content: "" }),
      focus: { id: current.id, caret: 0 },
    }
  }
  const nextType: NoteBlockType = isList(current.type) ? current.type : "paragraph"
  // Entrée tout au début d'une ligne non vide : une ligne vide est insérée au-dessus.
  if (!before && after) {
    return {
      blocks: [...blocks.slice(0, index), createEmptyBlock(nextType), ...blocks.slice(index)],
      focus: { id: current.id, caret: 0 },
    }
  }
  const created: NoteBlockData = { ...createEmptyBlock(nextType), content: after }
  return {
    blocks: replaceAt(blocks, index, { ...current, content: before }, created),
    focus: { id: created.id, caret: 0 },
  }
}

/** Retour arrière sur un bloc vide : il disparaît, le curseur va à la fin du précédent. */
function removeBlock(blocks: NoteBlockData[], index: number): Change {
  if (blocks.length === 1 || index <= 0) return null
  return {
    blocks: blocks.filter((_, i) => i !== index),
    focus: { id: blocks[index - 1].id, caret: "end" },
  }
}

/** Retour arrière au début d'un paragraphe : il rejoint la fin du bloc précédent. */
function mergeIntoPrevious(blocks: NoteBlockData[], index: number): Change {
  if (index <= 0) return null
  const previous = blocks[index - 1]
  const merged = { ...previous, content: previous.content + blocks[index].content }
  return {
    blocks: [...blocks.slice(0, index - 1), merged, ...blocks.slice(index + 1)],
    focus: { id: previous.id, caret: previous.content.length },
  }
}

/** Suppr en fin de bloc : le bloc suivant remonte dans celui-ci. */
function mergeNext(blocks: NoteBlockData[], index: number): Change {
  const current = blocks[index]
  const next = blocks[index + 1]
  if (!next) return null
  return {
    blocks: [
      ...blocks.slice(0, index),
      { ...current, content: current.content + next.content },
      ...blocks.slice(index + 2),
    ],
    focus: { id: current.id, caret: current.content.length },
  }
}

/** Collage de plusieurs lignes : une ligne = un bloc. */
function pasteLines(
  blocks: NoteBlockData[],
  index: number,
  before: string,
  after: string,
  text: string
): Change {
  const current = blocks[index]
  const listLike = isList(current.type)
  let lines = text.replace(/\r\n?/g, "\n").split("\n")
  if (listLike) lines = lines.filter((line, i) => i === 0 || line.trim())
  if (lines.length < 2) return null
  const nextType: NoteBlockType = listLike ? current.type : "paragraph"
  const created = lines.slice(1).map((line) => ({ ...createEmptyBlock(nextType), content: line }))
  const last = created[created.length - 1]
  const caret = last.content.length
  last.content += after
  return {
    blocks: replaceAt(blocks, index, { ...current, content: before + lines[0] }, ...created),
    focus: { id: last.id, caret },
  }
}

/**
 * Touche qui valide une saisie IME (japonais, chinois…) : à ignorer. Safari envoie
 * « Entrée » après compositionend (isComposing = false) mais avec keyCode 229.
 */
function isImeKey(e: KeyboardEvent<HTMLTextAreaElement>): boolean {
  return e.nativeEvent.isComposing || e.keyCode === 229
}

/** Raccourcis Markdown tapés en début de paragraphe : « # », « ## », « - », « 1. », « [] » + espace. */
const MARKDOWN_SHORTCUT = /^(#{1,2}|[-*•]|\d+[.)]|\[ ?\])[  ]/

function shortcutType(marker: string): NoteBlockType {
  if (marker === "#") return "heading1"
  if (marker === "##") return "heading2"
  if (/^\d/.test(marker)) return "numbered"
  if (marker.startsWith("[")) return "checklist"
  return "bullet"
}

/* ------------------------------------------------------------------ */
/* Éditeur                                                             */
/* ------------------------------------------------------------------ */

type Props = {
  initialNote: Note
  /** Nouvelle note (/note/new) : rien n'est enregistré tant qu'elle est vide. */
  isNew: boolean
  locale: Locale
}

/** Éditeur de note par blocs (port de tchope/app/note/[id].tsx). */
export function NoteEditor({ initialNote, isNew, locale }: Props) {
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const goBack = useGoBack(`/${locale}/app/notes`)

  const [note, setNote] = useState<Note>(initialNote)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const isSaved = useNotes((s) => s.notes.some((n) => n.id === initialNote.id))

  const titleRef = useRef<HTMLTextAreaElement | null>(null)
  const blockRefs = useRef(new Map<string, HTMLTextAreaElement>())
  const pendingFocus = useRef<Focus | null>(null)
  const latestNote = useRef(initialNote)
  const lastSaved = useRef(initialNote)
  const deleted = useRef(false)
  const urlSynced = useRef(!isNew)
  const allowNewline = useRef(false)

  // Sauvegarde automatique à chaque modification (comme le mobile). Une note vide
  // n'est jamais créée ; ouvrir une note sans la modifier ne change pas sa date.
  useEffect(() => {
    latestNote.current = note
    if (deleted.current || note === lastSaved.current) return
    lastSaved.current = note
    const store = useNotes.getState()
    const stored = store.getNote(note.id)
    if (!stored && isNoteEmpty(note)) return
    if (stored) store.updateNote(note.id, note)
    else store.addNote(note)
    // La nouvelle note a maintenant sa propre adresse : /note/new devient /note/<id>
    // (rafraîchir la page ou revenir en arrière la retrouve).
    if (!urlSynced.current) {
      urlSynced.current = true
      window.history.replaceState(null, "", `/${locale}/app/note/${note.id}`)
    }
  }, [note, locale])

  // En quittant l'éditeur, une note restée vide est supprimée.
  useEffect(() => {
    return () => {
      if (deleted.current) return
      const last = latestNote.current
      const store = useNotes.getState()
      if (isNoteEmpty(last) && store.getNote(last.id)) store.deleteNote(last.id)
    }
  }, [])

  // Nouvelle note : le curseur est directement dans le titre.
  useEffect(() => {
    if (isNew) titleRef.current?.focus()
  }, [isNew])

  // Place le curseur après un changement de blocs (Entrée, Retour arrière, collage…).
  useLayoutEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    const el = target.id === TITLE_ID ? titleRef.current : blockRefs.current.get(target.id)
    if (el) focusAt(el, target.caret)
  }, [note])

  // Numérotation des listes numérotées (repart à 1 après tout autre bloc).
  const numberedIndices = useMemo(() => {
    const map: Record<string, number> = {}
    let counter = 0
    for (const b of note.blocks) {
      if (b.type === "numbered") {
        counter += 1
        map[b.id] = counter
      } else {
        counter = 0
      }
    }
    return map
  }, [note.blocks])

  const activeType = note.blocks.find((b) => b.id === activeBlockId)?.type ?? null

  function apply(change: Change): boolean {
    if (!change) return false
    if (change.focus) pendingFocus.current = change.focus
    setNote((prev) => ({ ...prev, blocks: change.blocks }))
    return true
  }

  function toggleCheck(blockId: string) {
    setNote((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === blockId ? { ...b, checked: !b.checked } : b)),
    }))
  }

  function selectType(type: NoteBlockType) {
    const blocks = note.blocks
    const targetId =
      activeBlockId && blocks.some((b) => b.id === activeBlockId)
        ? activeBlockId
        : blocks[blocks.length - 1]?.id
    if (!targetId) return
    const index = blocks.findIndex((b) => b.id === targetId)
    const el = blockRefs.current.get(targetId)
    const caret: Caret = el && document.activeElement === el ? el.selectionStart : "end"
    setActiveBlockId(targetId)
    if (blocks[index].type === type) {
      if (el) focusAt(el, caret)
      return
    }
    apply({
      blocks: replaceAt(blocks, index, withType(blocks[index], type)),
      focus: { id: targetId, caret },
    })
  }

  function focusEnd() {
    const last = note.blocks[note.blocks.length - 1]
    if (last && last.type === "paragraph" && !last.content) {
      const el = blockRefs.current.get(last.id)
      if (el) focusAt(el, 0)
      return
    }
    // Zone vide sous la note : un nouveau paragraphe (comme la zone tactile du mobile).
    const block = createEmptyBlock("paragraph")
    pendingFocus.current = { id: block.id, caret: 0 }
    setNote((prev) => ({ ...prev, blocks: [...prev.blocks, block] }))
  }

  function handleDelete() {
    deleted.current = true
    const store = useNotes.getState()
    if (store.getNote(note.id)) store.deleteNote(note.id)
    goBack()
  }

  /* ----------------------------- Titre ----------------------------- */

  function onTitleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (isImeKey(e)) return
    const el = e.currentTarget
    const first = note.blocks[0]
    const firstEl = first ? blockRefs.current.get(first.id) : undefined
    if (!firstEl) return
    const collapsed = el.selectionStart === el.selectionEnd
    const plain = !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey
    if (e.key === "Enter") {
      e.preventDefault()
      focusAt(firstEl, 0)
    } else if (e.key === "ArrowDown" && plain && collapsed && isCaretOnLastLine(el)) {
      e.preventDefault()
      focusFromAbove(firstEl, columnOf(el.value, el.selectionStart))
    } else if (e.key === "ArrowRight" && plain && collapsed && el.selectionStart === el.value.length) {
      e.preventDefault()
      focusAt(firstEl, 0)
    }
  }

  /* ----------------------------- Blocs ----------------------------- */

  function onBlockChange(index: number, e: ChangeEvent<HTMLTextAreaElement>) {
    const block = note.blocks[index]
    const el = e.currentTarget
    const value = el.value
    const caret = el.selectionStart
    const oneCharTyped = value.length === block.content.length + 1
    const newlineAllowed = allowNewline.current
    allowNewline.current = false

    // Retour à la ligne venu d'un clavier virtuel sans touche « Enter » détectée :
    // on coupe le bloc, comme le fait le mobile pour les listes.
    if (oneCharTyped && value[caret - 1] === "\n" && !newlineAllowed) {
      apply(splitBlock(note.blocks, index, value.slice(0, caret - 1), value.slice(caret)))
      return
    }

    if (block.type === "paragraph" && oneCharTyped) {
      const match = MARKDOWN_SHORTCUT.exec(value)
      if (match && caret === match[0].length) {
        const type = shortcutType(match[1])
        apply({
          blocks: replaceAt(
            note.blocks,
            index,
            withType({ ...block, content: value.slice(match[0].length) }, type)
          ),
          focus: { id: block.id, caret: 0 },
        })
        return
      }
    }

    setNote((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === block.id ? { ...b, content: value } : b)),
    }))
  }

  function onBlockKeyDown(index: number, e: KeyboardEvent<HTMLTextAreaElement>) {
    if (isImeKey(e)) return
    const el = e.currentTarget
    const block = note.blocks[index]
    const { selectionStart: start, selectionEnd: end, value } = el
    const collapsed = start === end
    const mod = e.metaKey || e.ctrlKey
    const plain = !e.shiftKey && !mod && !e.altKey
    allowNewline.current = e.key === "Enter" && (e.shiftKey || e.altKey)

    const previousEl =
      index > 0 ? blockRefs.current.get(note.blocks[index - 1].id) : titleRef.current
    const next = note.blocks[index + 1]
    const nextEl = next ? blockRefs.current.get(next.id) : undefined

    switch (e.key) {
      case "Enter": {
        // Ctrl/Cmd + Entrée coche ou décoche une case.
        if (mod) {
          if (block.type === "checklist") {
            e.preventDefault()
            toggleCheck(block.id)
          }
          return
        }
        // Maj + Entrée : retour à la ligne dans le même bloc.
        if (e.shiftKey || e.altKey) return
        e.preventDefault()
        apply(splitBlock(note.blocks, index, value.slice(0, start), value.slice(end)))
        return
      }
      case "Backspace": {
        if (!collapsed || start !== 0 || mod || e.altKey) return
        if (!value) {
          e.preventDefault()
          if (apply(removeBlock(note.blocks, index))) return
          // Premier bloc vide : il redevient un paragraphe, puis on remonte au titre.
          if (block.type !== "paragraph") {
            apply({
              blocks: replaceAt(note.blocks, index, withType(block, "paragraph")),
              focus: { id: block.id, caret: 0 },
            })
          } else if (note.blocks.length > 1) {
            apply({
              blocks: note.blocks.slice(1),
              focus: { id: TITLE_ID, caret: "end" },
            })
          } else if (titleRef.current) {
            focusAt(titleRef.current, "end")
          }
          return
        }
        // Début d'un titre / d'un élément de liste : il redevient un paragraphe.
        if (block.type !== "paragraph") {
          e.preventDefault()
          apply({
            blocks: replaceAt(note.blocks, index, withType(block, "paragraph")),
            focus: { id: block.id, caret: 0 },
          })
          return
        }
        if (index > 0) {
          e.preventDefault()
          apply(mergeIntoPrevious(note.blocks, index))
        }
        return
      }
      case "Delete": {
        if (!collapsed || start !== value.length || mod || e.altKey || !next) return
        e.preventDefault()
        apply(mergeNext(note.blocks, index))
        return
      }
      case "ArrowUp": {
        if (!collapsed || !plain || !previousEl || !isCaretOnFirstLine(el)) return
        e.preventDefault()
        focusFromBelow(previousEl, columnOf(value, start))
        return
      }
      case "ArrowDown": {
        if (!collapsed || !plain || !nextEl || !isCaretOnLastLine(el)) return
        e.preventDefault()
        focusFromAbove(nextEl, columnOf(value, start))
        return
      }
      case "ArrowLeft": {
        if (!collapsed || !plain || start !== 0 || !previousEl) return
        e.preventDefault()
        focusAt(previousEl, "end")
        return
      }
      case "ArrowRight": {
        if (!collapsed || !plain || start !== value.length || !nextEl) return
        e.preventDefault()
        focusAt(nextEl, 0)
        return
      }
    }
  }

  function onBlockPaste(index: number, e: ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData("text/plain")
    if (!text || !/[\r\n]/.test(text)) return
    const el = e.currentTarget
    const change = pasteLines(
      note.blocks,
      index,
      el.value.slice(0, el.selectionStart),
      el.value.slice(el.selectionEnd),
      text
    )
    if (!change) return
    e.preventDefault()
    apply(change)
  }

  /* ----------------------------- Rendu ----------------------------- */

  const deleteDialog = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label={t("deleteNote")}
          title={t("deleteNote")}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="size-[18px]" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteNoteConfirm")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteNoteMessage")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>{t("delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <div className="pb-4">
      {/* En-tête collant : retour, barre de mise en forme, suppression */}
      <div className="sticky top-0 z-30 -mx-4 -mt-5 border-b border-foreground/5 bg-background/90 px-4 backdrop-blur-xl sm:-mx-6 sm:px-6 md:-mt-6 dark:border-white/5 dark:bg-dark/90">
        <div className="flex items-center gap-2 py-3 md:grid md:grid-cols-[1fr_auto_1fr]">
          <div className="flex">
            <button
              type="button"
              onClick={goBack}
              aria-label={isFr ? "Retour" : "Back"}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-primary/10 dark:bg-dark-surface dark:text-white"
            >
              <ArrowLeft className="size-5" />
            </button>
          </div>
          <NoteToolbar
            className="hidden md:flex"
            activeType={activeType}
            onSelect={selectType}
            t={t}
          />
          <div className="ml-auto flex items-center justify-end gap-3">
            {isSaved && !isNoteEmpty(note) && (
              <span
                role="status"
                className="flex items-center gap-1 text-xs font-medium text-muted dark:text-dark-muted"
              >
                <Check className="size-3.5 text-secondary dark:text-green-400" />
                {t("noteSaved")}
              </span>
            )}
            {deleteDialog}
          </div>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:hidden [&::-webkit-scrollbar]:hidden">
          <NoteToolbar activeType={activeType} onSelect={selectType} t={t} />
        </div>
      </div>

      <div className="mx-auto max-w-2xl pt-6">
        <AutoTextarea
          inputRef={(el) => {
            titleRef.current = el
          }}
          value={note.title}
          onChange={(e) => {
            const title = e.currentTarget.value.replace(/\r?\n/g, " ")
            setNote((prev) => ({ ...prev, title }))
          }}
          onKeyDown={onTitleKeyDown}
          placeholder={t("noteTitlePlaceholder")}
          aria-label={t("noteTitlePlaceholder")}
          className="mb-2 scroll-mt-36 py-2 text-[28px] leading-9 font-extrabold tracking-tight text-foreground placeholder:text-muted/70 dark:text-white dark:placeholder:text-dark-muted/70"
        />

        <div className="flex flex-col gap-1">
          {note.blocks.map((block, index) => {
            const isActive = block.id === activeBlockId
            const placeholder =
              index === 0 && note.blocks.length === 1
                ? t("noteContentPlaceholder")
                : isActive && !block.content && (block.type === "heading1" || block.type === "heading2")
                  ? t(TYPE_LABEL[block.type])
                  : undefined
            return (
              <NoteBlock
                key={block.id}
                block={block}
                numberedIndex={numberedIndices[block.id] ?? 0}
                placeholder={placeholder}
                label={t(TYPE_LABEL[block.type])}
                checkLabel={t("formatChecklist")}
                inputRef={(el) => {
                  if (el) blockRefs.current.set(block.id, el)
                  else blockRefs.current.delete(block.id)
                }}
                onChange={(e) => onBlockChange(index, e)}
                onKeyDown={(e) => onBlockKeyDown(index, e)}
                onPaste={(e) => onBlockPaste(index, e)}
                onFocus={() => setActiveBlockId(block.id)}
                onToggleCheck={() => toggleCheck(block.id)}
              />
            )
          })}
        </div>

        {/* Zone vide sous la note : clic = continuer à écrire */}
        <div aria-hidden onClick={focusEnd} className="min-h-[200px] cursor-text" />
      </div>
    </div>
  )
}
