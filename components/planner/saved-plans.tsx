"use client"

import { useState } from "react"
import { ChevronDown, CalendarRange, RotateCcw, Trash2 } from "lucide-react"
import type { MealPlan } from "@/stores/meal-planner"
import type { TranslationKey } from "@/constants/translations"
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
import { formatDate, type Lang } from "./planner-utils"

/** Plans sauvegardés : liste repliable, réutiliser ou supprimer (avec confirmation). */
export function SavedPlans({
  plans,
  lang,
  t,
  onReuse,
  onDelete,
}: {
  plans: MealPlan[]
  lang: Lang
  t: (key: TranslationKey) => string
  onReuse: (plan: MealPlan) => void
  onDelete: (planId: string) => void
}) {
  const [open, setOpen] = useState(false)

  if (plans.length === 0) return null

  return (
    <section className="pt-2">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={open ? "planner-saved-plans" : undefined}
          className="flex w-full cursor-pointer items-center gap-2 rounded-xl py-1 text-left"
        >
          <span className="text-lg font-bold text-foreground dark:text-white">{t("plannerSavedPlans")}</span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary dark:bg-primary/25">
            {plans.length}
          </span>
          <span className="flex-1" />
          <ChevronDown
            className={`size-[18px] text-muted transition-transform duration-200 dark:text-dark-muted ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h2>

      {open && (
        <div id="planner-saved-plans" className="mt-3 grid animate-in gap-2.5 fade-in-0 slide-in-from-top-1 duration-200 sm:grid-cols-2">
          {plans.map((plan) => {
            const dayCount = Object.keys(plan.days).length
            return (
              <div
                key={plan.id}
                className="flex flex-col rounded-2xl border border-foreground/5 bg-surface p-3.5 dark:border-white/5 dark:bg-dark-surface"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                    <CalendarRange className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground dark:text-white">
                      {formatDate(plan.startDate, lang)} → {formatDate(plan.endDate, lang)}
                    </p>
                    {plan.preferences ? (
                      <p className="mt-1 truncate text-xs text-muted dark:text-dark-muted" title={plan.preferences}>
                        {plan.preferences}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                        {dayCount} {lang === "fr" ? (dayCount > 1 ? "jours" : "jour") : dayCount > 1 ? "days" : "day"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onReuse(plan)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary/10 p-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/25"
                  >
                    <RotateCcw className="size-3.5" />
                    {t("plannerReuse")}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-red-600/8 px-4 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-600/15 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
                      >
                        <Trash2 className="size-3.5" />
                        {t("plannerDelete")}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("plannerDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("clearConfirmMessage")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(plan.id)}>{t("confirm")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
