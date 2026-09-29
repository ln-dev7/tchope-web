/**
 * Petits utilitaires de curseur pour les `textarea` de l'éditeur de notes :
 * savoir si le curseur est sur la première / dernière ligne affichée (lignes
 * repliées comprises) pour passer d'un bloc à l'autre avec les flèches.
 */

const MIRROR_PROPS = [
  "box-sizing",
  "width",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-style",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "font-style",
  "font-variant",
  "font-weight",
  "font-stretch",
  "font-size",
  "font-family",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-transform",
  "text-indent",
  "tab-size",
  "word-break",
]

/** Position verticale (px) de la ligne affichée qui contient `position`. */
function caretTop(el: HTMLTextAreaElement, position: number): number {
  const computed = window.getComputedStyle(el)
  const mirror = document.createElement("div")
  for (const prop of MIRROR_PROPS) {
    mirror.style.setProperty(prop, computed.getPropertyValue(prop))
  }
  mirror.style.position = "absolute"
  mirror.style.visibility = "hidden"
  mirror.style.pointerEvents = "none"
  mirror.style.top = "0"
  mirror.style.left = "-9999px"
  mirror.style.height = "auto"
  mirror.style.whiteSpace = "pre-wrap"
  mirror.style.overflowWrap = "break-word"
  mirror.textContent = el.value.slice(0, position)
  const marker = document.createElement("span")
  marker.textContent = el.value.slice(position) || "."
  mirror.appendChild(marker)
  document.body.appendChild(mirror)
  const top = marker.offsetTop
  mirror.remove()
  return top
}

export function isCaretOnFirstLine(el: HTMLTextAreaElement): boolean {
  if (el.selectionStart === 0) return true
  return Math.abs(caretTop(el, el.selectionStart) - caretTop(el, 0)) < 2
}

export function isCaretOnLastLine(el: HTMLTextAreaElement): boolean {
  if (el.selectionEnd === el.value.length) return true
  return Math.abs(caretTop(el, el.selectionEnd) - caretTop(el, el.value.length)) < 2
}

/** Colonne du curseur dans sa ligne logique (après le dernier retour à la ligne). */
export function columnOf(value: string, position: number): number {
  return position - (value.lastIndexOf("\n", position - 1) + 1)
}

/** Donne le focus au champ et place le curseur (`"end"` = à la fin). */
export function focusAt(el: HTMLTextAreaElement, caret: number | "end") {
  el.focus()
  const pos = caret === "end" ? el.value.length : Math.max(0, Math.min(caret, el.value.length))
  el.setSelectionRange(pos, pos)
}

/** Arrive depuis le bloc du dessous : dernière ligne, à la même colonne si possible. */
export function focusFromBelow(el: HTMLTextAreaElement, column: number) {
  const value = el.value
  const lastLineStart = value.lastIndexOf("\n") + 1
  focusAt(el, Math.min(lastLineStart + column, value.length))
  if (!isCaretOnLastLine(el)) el.setSelectionRange(value.length, value.length)
}

/** Arrive depuis le bloc du dessus : première ligne, à la même colonne si possible. */
export function focusFromAbove(el: HTMLTextAreaElement, column: number) {
  const value = el.value
  const firstBreak = value.indexOf("\n")
  const firstLineLength = firstBreak === -1 ? value.length : firstBreak
  focusAt(el, Math.min(column, firstLineLength))
  if (!isCaretOnFirstLine(el)) el.setSelectionRange(0, 0)
}
