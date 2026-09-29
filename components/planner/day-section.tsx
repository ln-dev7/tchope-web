"use client"

import type { DayPlan } from "@/stores/meal-planner"
import type { Recipe } from "@/types/recipe"
import { MealCard } from "./meal-card"
import { formatDate, shortDay, type Lang } from "./planner-utils"

/** Une journée du plan : pastille du jour, date complète et repas. */
export function DaySection({
  date,
  day,
  lang,
  isToday,
  todayLabel,
  swapLabel,
  recipeMap,
  recipeHref,
  onSwap,
}: {
  date: string
  day: DayPlan
  lang: Lang
  isToday: boolean
  todayLabel: string
  swapLabel: string
  recipeMap: Record<string, Recipe>
  recipeHref: (recipeId: string) => string
  onSwap: (date: string, mealIndex: number) => void
}) {
  return (
    <section aria-label={formatDate(date, lang)}>
      <div className="mb-2.5 flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-extrabold text-white ${
            isToday ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background dark:ring-offset-dark" : ""
          }`}
        >
          {shortDay(date, lang)}
        </div>
        <h2 className="text-[15px] font-bold text-foreground dark:text-white">{formatDate(date, lang)}</h2>
        {isToday && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20">
            {todayLabel}
          </span>
        )}
      </div>

      <div className="ml-[52px] space-y-2 max-[359px]:ml-0">
        {day.meals.map((meal, idx) => (
          <MealCard
            key={`${date}-${idx}`}
            recipe={recipeMap[meal.recipeId]}
            label={meal.label}
            href={recipeHref(meal.recipeId)}
            swapLabel={swapLabel}
            onSwap={() => onSwap(date, idx)}
          />
        ))}
      </div>
    </section>
  )
}
