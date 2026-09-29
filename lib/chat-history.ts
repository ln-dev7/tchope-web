/** Historique des conversations TchopAI (comme tchope/utils/chatHistory.ts), dans le navigateur. */

const STORAGE_KEY = "tchope_chat_history"
export const MAX_SAVED_CHATS = 10

export type SavedMessage = {
  id: string
  role: "user" | "assistant" | "info"
  content: string
}

export type SavedChat = {
  id: string
  title: string
  messages: SavedMessage[]
  createdAt: string
  updatedAt: string
}

function loadAll(): SavedChat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedChat[]) : []
  } catch {
    return []
  }
}

function saveAll(chats: SavedChat[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {
    // stockage plein ou bloqué
  }
}

export function getChatHistory(): SavedChat[] {
  return loadAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function saveChat(chat: SavedChat) {
  const chats = loadAll()
  const idx = chats.findIndex((c) => c.id === chat.id)
  if (idx >= 0) chats[idx] = chat
  else chats.unshift(chat)
  saveAll(chats.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, MAX_SAVED_CHATS))
}

export function deleteChat(chatId: string) {
  saveAll(loadAll().filter((c) => c.id !== chatId))
}

export function clearAllChats() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignoré
  }
}
