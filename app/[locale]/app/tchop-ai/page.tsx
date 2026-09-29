"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useLocalizedRecipes } from "@/hooks/use-localized-recipes"
import { useUserRecipes } from "@/stores/user-recipes"
import { useFavorites } from "@/stores/favorites"
import { useMealPlanner } from "@/stores/meal-planner"
import { useNotes } from "@/stores/notes"
import { useAiConsentStore } from "@/stores/ai-consent"
import { useImageQuota } from "@/stores/image-quota"
import {
  AiConsentError,
  AiHttpError,
  TCHOPAI_MODEL,
  callClaude,
  callClaudeLive,
  fetchRecipeUrl,
  imageFileToBase64Jpeg,
} from "@/lib/ai/client"
import { getChatHistory, saveChat, deleteChat, clearAllChats, type SavedChat } from "@/lib/chat-history"
import { buildSystemPrompt, parseResponse } from "@/lib/tchop-ai/utils"
import type { Message } from "@/components/tchop-ai/types"
import { ChatHeader } from "@/components/tchop-ai/chat-header"
import { ChatMessage } from "@/components/tchop-ai/chat-message"
import { ChatInput } from "@/components/tchop-ai/chat-input"
import { ChatHistoryDialog } from "@/components/tchop-ai/chat-history-dialog"
import { PhotoSourceDialog } from "@/components/tchop-ai/photo-source-dialog"
import { AiConsentScreen } from "@/components/tchop-ai/ai-consent-screen"
import { useIsClient } from "@/components/tchop-ai/use-online-status"
import { useGoBack } from "@/components/tchop-ai/use-go-back"

/**
 * /api/claude refuse plus de 60 messages par requête (MAX_MESSAGES dans
 * app/api/claude/route.ts) ; le serveur mobile n'a pas cette limite. Au-delà, on
 * n'envoie que la fin de la conversation (en commençant par un message de
 * l'utilisateur), sinon une longue conversation échouerait à chaque envoi.
 */
const MAX_AI_MESSAGES = 60

function historyForAi<T extends { role: string; content: unknown }>(history: T[]): T[] {
  // L'API Anthropic refuse un message vide (réponse réduite à un tag, par ex.) :
  // gardé, il ferait échouer tous les envois suivants de la conversation.
  const nonEmpty = history.filter((m) => typeof m.content !== "string" || m.content.trim() !== "")
  if (nonEmpty.length <= MAX_AI_MESSAGES) return nonEmpty
  const recent = nonEmpty.slice(-MAX_AI_MESSAGES)
  const firstUser = recent.findIndex((m) => m.role === "user")
  return firstUser > 0 ? recent.slice(firstUser) : recent
}

/** Chat TchopAI (port de tchope/app/tchop-ai.tsx). Écran plein écran : voir components/app-shell.tsx. */
export default function TchopAIPage() {
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const isFr = locale === "fr"
  const isClient = useIsClient()
  const goBack = useGoBack(`/${locale}/app`)

  const recipes = useLocalizedRecipes(locale)
  const { userRecipes, addRecipe } = useUserRecipes()
  const { favorites } = useFavorites()
  const { currentPlan } = useMealPlanner()
  const { notes, addNote } = useNotes()
  const { aiConsent, setAiConsent } = useAiConsentStore()
  const imageQuota = useImageQuota()

  // --- State ---
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: "welcome", role: "assistant", content: t("tchopaiWelcome") },
  ])
  const [input, setInput] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [chatHistoryList, setChatHistoryList] = useState<SavedChat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Identifiant de la conversation en cours (créé au premier message, comme Date.now() sur mobile).
  const chatIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Incrémenté à chaque nouvelle conversation ou chargement depuis l'historique : une réponse
  // qui arrive après ce changement est ignorée (sinon elle s'ajouterait à l'autre conversation
  // et y serait sauvegardée).
  const sessionRef = useRef(0)

  const thinkingText = isFr ? "TchopAI réfléchit..." : "TchopAI is thinking..."
  const rateLimitText = isFr ? "Trop de demandes, réessaie dans une minute" : "Too many requests, try again in a minute"

  // --- Auto-save chat ---
  useEffect(() => {
    const realMessages = messages.filter((m) => m.id !== "welcome")
    if (realMessages.length === 0) return
    if (!chatIdRef.current) chatIdRef.current = Date.now().toString()
    const id = chatIdRef.current
    const firstUserMsg = realMessages.find((m) => m.role === "user")
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "")
      : "Chat"
    saveChat({
      id,
      title,
      messages: realMessages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
      createdAt: new Date(Number(id) || Date.now()).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }, [messages])

  // --- Défilement automatique vers le bas ---
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, loading, aiConsent, isClient])

  // Quand la zone rétrécit (clavier virtuel, champ qui s'agrandit), on garde le bas
  // de la conversation visible si l'utilisateur y était.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    let atBottom = true
    const onScroll = () => {
      atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48
    }
    const observer = new ResizeObserver(() => {
      if (atBottom) el.scrollTop = el.scrollHeight
    })
    el.addEventListener("scroll", onScroll, { passive: true })
    observer.observe(el)
    return () => {
      observer.disconnect()
      el.removeEventListener("scroll", onScroll)
    }
  }, [aiConsent, isClient])

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    },
    []
  )

  const getSystemPrompt = () => buildSystemPrompt(recipes, userRecipes, favorites, currentPlan, isFr, notes)

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content }])
  }

  /** Erreur d'appel IA : refus du consentement → on revient à l'état précédent, sans message. */
  const handleAiError = (error: unknown, rollbackIds: string[], restoreInput?: string) => {
    if (error instanceof AiConsentError) {
      setMessages((prev) => prev.filter((m) => !rollbackIds.includes(m.id)))
      if (restoreInput !== undefined) setInput(restoreInput)
      return
    }
    addAssistantMessage(error instanceof AiHttpError && error.status === 429 ? rateLimitText : t("tchopaiError"))
  }

  // --- Send message ---
  const handleSend = async () => {
    const text = input.trim()
    // Garde-fou : aucun envoi vers l'IA tant que le consentement n'est pas donné.
    if (!text || loading || !aiConsent) return

    if (!navigator.onLine) {
      addAssistantMessage(t("tchopaiOffline"))
      return
    }

    const session = sessionRef.current
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)
    setLoadingMessage(thinkingText)

    try {
      let enrichedText = text
      const urlMatch = text.match(/https?:\/\/[^\s]+/i)
      if (urlMatch) {
        setLoadingMessage(isFr ? "Analyse du lien en cours..." : "Analyzing link...")
        const urlContent = await fetchRecipeUrl(urlMatch[0])
        if (session !== sessionRef.current) return
        if (urlContent) enrichedText = `${text}\n\n[Contenu extrait du lien :\n${urlContent}]`
        setLoadingMessage(isFr ? "Préparation de la réponse..." : "Preparing response...")
      }

      const enrichedMsg = { ...userMsg, content: enrichedText }
      const history = [...messages.filter((m) => m.id !== "welcome" && m.role !== "info"), enrichedMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await callClaude({
        model: TCHOPAI_MODEL,
        max_tokens: 2048,
        system: [{ type: "text", text: getSystemPrompt(), cache_control: { type: "ephemeral" } }],
        messages: historyForAi(history),
      })
      if (session !== sessionRef.current) return

      const parsed = parseResponse(response, recipes, notes)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: parsed.content,
          recipeIds: parsed.recipeIds,
          saveRecipe: parsed.saveRecipe,
          noteIds: parsed.noteIds,
          saveNote: parsed.saveNote,
        },
      ])
    } catch (error) {
      if (session === sessionRef.current) handleAiError(error, [userMsg.id], text)
    } finally {
      if (session === sessionRef.current) {
        setLoading(false)
        setLoadingMessage("")
      }
    }
  }

  // --- Chat management ---
  /** Change de conversation : la réponse éventuellement en cours est abandonnée. */
  const startSession = () => {
    sessionRef.current += 1
    setLoading(false)
    setLoadingMessage("")
  }

  const handleNewChat = () => {
    startSession()
    chatIdRef.current = null
    setCurrentChatId(null)
    setMessages([{ id: "welcome", role: "assistant", content: t("tchopaiWelcome") }])
    setInput("")
  }

  const handleOpenHistory = () => {
    setChatHistoryList(getChatHistory())
    setCurrentChatId(chatIdRef.current)
    setShowHistory(true)
  }

  const handleLoadChat = (chat: SavedChat) => {
    startSession()
    chatIdRef.current = chat.id
    setCurrentChatId(chat.id)
    setMessages([{ id: "welcome", role: "assistant", content: t("tchopaiWelcome") }, ...chat.messages])
    setShowHistory(false)
  }

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId)
    setChatHistoryList((prev) => prev.filter((c) => c.id !== chatId))
  }

  const handleClearAllHistory = () => {
    clearAllChats()
    setChatHistoryList([])
  }

  // --- Copy ---
  const handleCopy = async (item: Message) => {
    try {
      await navigator.clipboard.writeText(item.content)
    } catch {
      return
    }
    setCopiedId(item.id)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopiedId(null), 1500)
  }

  // --- Photo ---
  // Envoi de photo borné par useImageQuota (limite quotidienne d'images).
  const handlePhotoPress = () => {
    if (!imageQuota.canSend) {
      toast.error(isFr ? "Limite atteinte" : "Limit reached", { description: t("imageQuotaReached") })
      return
    }
    setShowSource(true)
  }

  const pickPhoto = (source: "camera" | "gallery") => {
    setShowSource(false)
    const el = source === "camera" ? cameraInputRef.current : galleryInputRef.current
    el?.click()
  }

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || loading || !aiConsent) return

    if (!imageQuota.canSend) {
      toast.error(isFr ? "Limite atteinte" : "Limit reached", { description: t("imageQuotaReached") })
      return
    }
    if (!navigator.onLine) {
      addAssistantMessage(t("tchopaiOffline"))
      return
    }

    const session = sessionRef.current
    setLoading(true)
    setLoadingMessage(isFr ? "Analyse de la photo..." : "Analyzing photo...")

    let base64Data: string
    try {
      base64Data = await imageFileToBase64Jpeg(file)
    } catch {
      if (session !== sessionRef.current) return
      toast.error(t("errorPhotoLoad"))
      setLoading(false)
      setLoadingMessage("")
      return
    }
    // Conversation changée pendant la préparation de la photo : on n'envoie rien.
    if (session !== sessionRef.current) return

    imageQuota.increment()
    const remaining = imageQuota.remaining - 1
    const quotaInfo =
      remaining <= 0
        ? `📷 0/${imageQuota.limit} — ${t("imageQuotaReached")}`
        : `📷 ${remaining}/${imageQuota.limit} ${t("imageQuota")}`
    const now = Date.now()
    const userMsg: Message = { id: now.toString(), role: "user", content: isFr ? "📷 Photo envoyée" : "📷 Photo sent" }
    const quotaMsg: Message = { id: `quota-${now}`, role: "info", content: quotaInfo }
    setMessages((prev) => [...prev, userMsg, quotaMsg])

    try {
      const history = [...messages.filter((m) => m.id !== "welcome" && m.role !== "info"), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const messagesWithImage = [
        ...history.slice(0, -1),
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: isFr
                ? "Analyse cette photo et dis-moi ce que tu en penses pour la cuisine camerounaise."
                : "Analyze this photo and tell me what you think for Cameroonian cooking.",
            },
            {
              type: "image" as const,
              source: { type: "base64" as const, media_type: "image/jpeg", data: base64Data },
            },
          ],
        },
      ]

      const response = await callClaudeLive({
        model: TCHOPAI_MODEL,
        max_tokens: 1024,
        system: [{ type: "text", text: getSystemPrompt(), cache_control: { type: "ephemeral" } }],
        messages: historyForAi(messagesWithImage),
      })
      if (session !== sessionRef.current) return

      const parsed = parseResponse(response, recipes, notes)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: parsed.content,
          recipeIds: parsed.recipeIds,
          saveRecipe: parsed.saveRecipe,
          noteIds: parsed.noteIds,
          saveNote: parsed.saveNote,
        },
      ])
    } catch (error) {
      if (session === sessionRef.current) handleAiError(error, [userMsg.id, quotaMsg.id])
    } finally {
      if (session === sessionRef.current) {
        setLoading(false)
        setLoadingMessage("")
      }
    }
  }

  // --- Render ---
  // Le consentement et l'historique vivent dans le localStorage : rien avant l'hydratation.
  if (!isClient) {
    return <div className="h-dvh bg-background dark:bg-dark" />
  }

  if (!aiConsent) {
    return (
      <div className="h-dvh bg-background dark:bg-dark">
        <AiConsentScreen locale={locale} isFr={isFr} t={t} onAgree={() => setAiConsent(true)} onBack={goBack} />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col bg-background dark:bg-dark">
      <ChatHeader
        isFr={isFr}
        messageCount={messages.length}
        onBack={goBack}
        onNewChat={handleNewChat}
        onOpenHistory={handleOpenHistory}
        t={t}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div
          role="log"
          aria-live="polite"
          aria-label={isFr ? "Conversation avec TchopAI" : "Conversation with TchopAI"}
          className="mx-auto w-full max-w-3xl px-4 pt-4 pb-2 sm:px-6"
        >
          {messages.map((item) => (
            <ChatMessage
              key={item.id}
              item={item}
              locale={locale}
              isFr={isFr}
              recipes={recipes}
              userRecipes={userRecipes}
              notes={notes}
              copied={copiedId === item.id}
              onCopy={handleCopy}
              onSaveRecipe={addRecipe}
              onSaveNote={addNote}
              t={t}
            />
          ))}

          {loading && (
            <div className="mb-3 flex motion-safe:animate-in motion-safe:fade-in-0">
              <div
                role="status"
                className="flex items-center gap-2.5 rounded-[20px] rounded-bl-[6px] bg-[#F3F0EF] px-4 py-3 dark:bg-[#2A2A2A]"
              >
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-[13px] text-muted italic dark:text-dark-muted">
                  {loadingMessage || thinkingText}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        canSend
        canPhoto={imageQuota.canSend}
        isFr={isFr}
        onSend={handleSend}
        onPhoto={handlePhotoPress}
        t={t}
      />

      {/* Entrées fichier cachées : appareil photo (mobile) et galerie */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handlePhotoSelected}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handlePhotoSelected}
      />

      <PhotoSourceDialog
        open={showSource}
        onOpenChange={setShowSource}
        isFr={isFr}
        onCamera={() => pickPhoto("camera")}
        onGallery={() => pickPhoto("gallery")}
      />

      <ChatHistoryDialog
        open={showHistory}
        onOpenChange={setShowHistory}
        chats={chatHistoryList}
        currentChatId={currentChatId}
        onLoad={handleLoadChat}
        onDelete={handleDeleteChat}
        onClearAll={handleClearAllHistory}
        isFr={isFr}
        t={t}
      />
    </div>
  )
}
