"use client"

import { Check } from "lucide-react"
import type { ShoppingItem } from "@/lib/shopping"

/** Un article de la liste de courses, à cocher (« Déjà chez moi »). */
export function ShoppingItemRow({
  item,
  checked,
  onToggle,
}: {
  item: ShoppingItem
  checked: boolean
  onToggle: () => void
}) {
  const recipesText = item.recipes.join(", ")

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`flex w-full animate-in cursor-pointer items-center gap-3 rounded-[14px] border border-foreground/5 bg-surface p-3.5 text-left transition-[border-color,opacity] fade-in-0 duration-200 outline-none hover:border-primary/25 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 dark:border-white/5 dark:bg-dark-surface dark:hover:border-primary/30 ${
        checked ? "opacity-50 hover:opacity-70" : ""
      }`}
    >
      {checked ? (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-secondary dark:bg-green-600">
          <Check className="size-4 text-white" strokeWidth={3} />
        </span>
      ) : (
        <span className="size-6 shrink-0 rounded-lg border-2 border-primary" />
      )}

      <span className="min-w-0 flex-1">
        <span
          className={`block text-[15px] font-semibold text-foreground dark:text-white ${checked ? "line-through" : ""}`}
        >
          {item.name}
        </span>
        {item.quantity ? (
          <span className="mt-0.5 block text-xs text-muted dark:text-dark-muted">{item.quantity}</span>
        ) : null}
        {!checked && (
          <span className="mt-1 block truncate text-[10px] text-muted/80 dark:text-dark-muted/80" title={recipesText}>
            {recipesText}
          </span>
        )}
      </span>
    </button>
  )
}
