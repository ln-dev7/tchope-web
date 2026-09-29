"use client"

import Link from "next/link"
import { Bookmark, ChevronRight, FileText, RefreshCw, ShoppingCart } from "lucide-react"
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

/** Boutons du plan : liste de courses, sauvegarder, exporter en PDF, réinitialiser. */
export function PlanActions({
  shoppingHref,
  shoppingCount,
  onSave,
  onExport,
  onReset,
  t,
}: {
  shoppingHref: string
  shoppingCount: number
  onSave: () => void
  onExport: () => void
  onReset: () => void
  t: (key: TranslationKey) => string
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <Link
        href={shoppingHref}
        className="group flex items-center gap-3 rounded-2xl bg-primary p-4 text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary-dark"
      >
        <ShoppingCart className="size-[18px] shrink-0" />
        <span className="flex-1 text-[15px] font-bold">{t("plannerShoppingList")}</span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold tabular-nums">
          {shoppingCount} {t("shoppingListItemCount")}
        </span>
        <ChevronRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <button
        type="button"
        onClick={onSave}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-secondary/10 p-4 text-[15px] font-bold text-secondary transition-colors hover:bg-secondary/15 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/15"
      >
        <Bookmark className="size-[18px]" />
        {t("plannerSave")}
      </button>

      <button
        type="button"
        onClick={onExport}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#A855F7]/8 p-4 text-[15px] font-bold text-[#A855F7] transition-colors hover:bg-[#A855F7]/12 dark:bg-[#A855F7]/10 dark:hover:bg-[#A855F7]/15"
      >
        <FileText className="size-[18px]" />
        {t("plannerExportPdf")}
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl p-4 text-[15px] font-semibold text-muted transition-colors hover:bg-foreground/5 hover:text-foreground dark:text-dark-muted dark:hover:bg-white/5 dark:hover:text-white"
          >
            <RefreshCw className="size-[18px]" />
            {t("plannerReset")}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("plannerReset")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clearConfirmMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onReset}>{t("confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
