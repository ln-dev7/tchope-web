"use client"

import { useState } from "react"
import { MessageCircle, MessagesSquare, Trash2, X } from "lucide-react"
import { Dialog } from "radix-ui"
import { cn } from "@/lib/utils"
import { MAX_SAVED_CHATS, type SavedChat } from "@/lib/chat-history"
import type { useAppTranslations } from "@/hooks/use-app-translations"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { focusRing, roundButton } from "./styles"

type T = ReturnType<typeof useAppTranslations>["t"]

/** « Aujourd'hui/Hier/date · heure · N msg », comme la liste d'historique du mobile. */
function formatChatMeta(chat: SavedChat, isFr: boolean, t: T): string {
  const date = new Date(chat.updatedAt)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  const dateStr = isToday
    ? t("today")
    : isYesterday
      ? t("yesterday")
      : date.toLocaleDateString(isFr ? "fr-FR" : "en-US", { day: "numeric", month: "short" })
  const timeStr = date.toLocaleTimeString(isFr ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })
  const msgCount = chat.messages.filter((m) => m.role !== "info").length
  return `${dateStr} · ${timeStr} · ${msgCount} msg`
}

/** Historique des conversations (comme la modale d'historique du mobile). */
export function ChatHistoryDialog({
  open,
  onOpenChange,
  chats,
  currentChatId,
  onLoad,
  onDelete,
  onClearAll,
  isFr,
  t,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  chats: SavedChat[]
  currentChatId: string | null
  onLoad: (chat: SavedChat) => void
  onDelete: (chatId: string) => void
  onClearAll: () => void
  isFr: boolean
  t: T
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 top-[6dvh] bottom-0 z-50 flex flex-col overflow-hidden rounded-t-3xl bg-background shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:h-[min(640px,85dvh)] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:fade-out-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:fade-in-0 sm:data-[state=open]:zoom-in-95 dark:bg-dark"
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-[#EAE7E7] px-5 py-3 dark:border-[#333333]">
              <Dialog.Close aria-label={isFr ? "Fermer" : "Close"} className={cn(roundButton, focusRing)}>
                <X className="size-5" />
              </Dialog.Close>
              <Dialog.Title className="flex-1 text-[17px] font-bold text-foreground dark:text-white">
                {t("chatHistory")}
              </Dialog.Title>
              {chats.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className={cn(
                    "cursor-pointer rounded-full px-2 py-1 text-sm font-semibold text-[#E74C3C] transition-colors hover:bg-[#E74C3C]/10",
                    focusRing
                  )}
                >
                  {t("deleteAllHistory")}
                </button>
              )}
            </div>

            <p className="shrink-0 px-5 pt-3 pb-1 text-center text-xs text-muted dark:text-dark-muted">
              {t("chatHistoryLimit").replace("{count}", String(MAX_SAVED_CHATS))}
            </p>

            {chats.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-10 text-muted dark:text-dark-muted">
                <MessagesSquare className="size-12" strokeWidth={1.5} />
                <p className="text-[15px]">{t("chatHistoryEmpty")}</p>
              </div>
            ) : (
              <ul className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
                {chats.map((chat) => {
                  const isCurrent = chat.id === currentChatId
                  return (
                    <li
                      key={chat.id}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl border bg-white p-1.5 pr-2 transition-colors hover:border-[#A855F7]/40 dark:bg-[#2A2A2A] dark:hover:border-[#A855F7]/50",
                        isCurrent ? "border-[#A855F7]/40 dark:border-[#A855F7]/50" : "border-[#E8E5E4] dark:border-[#3A3A3A]"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onLoad(chat)}
                        aria-current={isCurrent ? "true" : undefined}
                        className={cn(
                          "flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-2 text-left",
                          focusRing
                        )}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#A855F7]/10 dark:bg-[#A855F7]/15">
                          <MessageCircle className="size-[18px] text-[#A855F7]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground dark:text-white">
                            {chat.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted dark:text-dark-muted">
                            {formatChatMeta(chat, isFr, t)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(chat.id)}
                        aria-label={`${t("delete")} : ${chat.title}`}
                        title={t("delete")}
                        className={cn(
                          "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-[#E74C3C]/10 hover:text-[#E74C3C] dark:text-dark-muted",
                          focusRing
                        )}
                      >
                        <Trash2 className="size-[18px]" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteAllHistoryConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteAllHistoryDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAll()
                setConfirmOpen(false)
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
