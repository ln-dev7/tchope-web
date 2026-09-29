"use client"

import { useCallback, useLayoutEffect, useRef, type ComponentProps } from "react"
import { cn } from "@/lib/utils"

type Props = Omit<ComponentProps<"textarea">, "ref" | "rows"> & {
  /** Référence vers le `textarea` (callback). */
  inputRef?: (el: HTMLTextAreaElement | null) => void
}

function fitHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = "auto"
  el.style.height = `${el.scrollHeight}px`
}

/** `textarea` d'une ligne qui grandit avec son contenu (comme un TextInput multiline sans défilement). */
export function AutoTextarea({ inputRef, className, value, ...props }: Props) {
  const elRef = useRef<HTMLTextAreaElement | null>(null)

  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      elRef.current = el
      inputRef?.(el)
    },
    [inputRef]
  )

  // Recalcule la hauteur quand le texte ou le style (type de bloc) change.
  useLayoutEffect(() => {
    fitHeight(elRef.current)
  }, [value, className])

  // …et quand la largeur change (fenêtre redimensionnée, rotation, polices chargées).
  useLayoutEffect(() => {
    const el = elRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    let lastWidth = el.clientWidth
    const observer = new ResizeObserver(() => {
      if (el.clientWidth !== lastWidth) {
        lastWidth = el.clientWidth
        fitHeight(el)
      }
    })
    observer.observe(el)
    document.fonts?.ready.then(() => fitHeight(el)).catch(() => {})
    return () => observer.disconnect()
  }, [])

  return (
    <textarea
      ref={setRef}
      rows={1}
      value={value}
      spellCheck
      className={cn(
        "block w-full min-w-0 resize-none overflow-hidden bg-transparent outline-none",
        className
      )}
      {...props}
    />
  )
}
