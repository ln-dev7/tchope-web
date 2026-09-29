"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

/**
 * Sélecteur d'heures / minutes / secondes de la page Minuteur (NumberPicker
 * de app/timer.tsx sur mobile) : flèches qui bouclent, plus saisie directe
 * et flèches haut/bas du clavier sur le web.
 */
export function NumberPicker({
  value,
  onChange,
  max,
  label,
}: {
  value: number
  onChange: (value: number) => void
  max: number
  label: string
}) {
  const [draft, setDraft] = useState<string | null>(null)

  const increment = () => onChange(value < max ? value + 1 : 0)
  const decrement = () => onChange(value > 0 ? value - 1 : max)

  const commit = (raw: string) => {
    const parsed = parseInt(raw.replace(/\D/g, ""), 10)
    onChange(Number.isNaN(parsed) ? 0 : Math.min(max, Math.max(0, parsed)))
    setDraft(null)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={increment}
        aria-label={`${label} +1`}
        tabIndex={-1}
        className="flex h-10 w-14 cursor-pointer items-center justify-center rounded-xl bg-surface text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ChevronUp className="size-[22px]" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={draft ?? value.toString().padStart(2, "0")}
        onFocus={(e) => {
          setDraft(value.toString().padStart(2, "0"))
          e.currentTarget.select()
        }}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(-2))}
        onBlur={(e) => commit(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault()
            setDraft(null)
            increment()
          } else if (e.key === "ArrowDown") {
            e.preventDefault()
            setDraft(null)
            decrement()
          } else if (e.key === "Enter") {
            // Valide la saisie sans lancer le minuteur (le formulaire parent le ferait).
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
        className="size-[72px] rounded-2xl border-2 border-primary/20 bg-white text-center text-4xl font-extrabold text-foreground tabular-nums caret-primary outline-none transition-colors focus:border-primary dark:bg-dark-surface dark:text-white"
      />
      <button
        type="button"
        onClick={decrement}
        aria-label={`${label} -1`}
        tabIndex={-1}
        className="flex h-10 w-14 cursor-pointer items-center justify-center rounded-xl bg-surface text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ChevronDown className="size-[22px]" />
      </button>
      <span className="mt-0.5 text-xs font-semibold text-muted dark:text-dark-muted">{label}</span>
    </div>
  )
}
