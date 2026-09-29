"use client"

/**
 * Client TchopAI : même API que tchope/utils/api.ts (callClaude avec cache 24 h,
 * callClaudeLive sans cache, fetchRecipeUrl), mais via les routes /api du site.
 * Aucun envoi vers l'IA sans consentement (requestAiConsent).
 */

import { requestAiConsent, AiConsentError } from "./consent"

export { AiConsentError }

export const TCHOPAI_MODEL = "claude-haiku-4-5-20251001"

const CACHE_PREFIX = "ai_cache:"
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 h

export type SystemBlock = {
  type: "text"
  text: string
  cache_control?: { type: "ephemeral" }
}

export type MessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    >

export type ClaudeRequest = {
  model: string
  max_tokens?: number
  system: string | SystemBlock[]
  messages: { role: string; content: MessageContent }[]
}

/** Erreur HTTP de la route IA (429 = trop de requêtes). */
export class AiHttpError extends Error {
  constructor(public status: number) {
    super(`API error: ${status}`)
    this.name = "AiHttpError"
  }
}

function hashKey(params: ClaudeRequest): string {
  const raw = JSON.stringify({ m: params.model, s: params.system, msg: params.messages })
  let h = 0
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0
  }
  return CACHE_PREFIX + h.toString(36)
}

function getCache(key: string): string | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as { text: string; expiresAt: number }
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return entry.text
  } catch {
    return null
  }
}

/**
 * Retire les réponses expirées (ou toutes avec `all`). Sans ce ménage, chaque
 * message du chat laisse une entrée qui n'est jamais relue : le localStorage
 * finit plein et les notes, recettes et favoris ne s'enregistrent plus.
 */
function pruneCache(all = false) {
  try {
    const now = Date.now()
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) keys.push(key)
    }
    for (const key of keys) {
      let expired = all
      if (!expired) {
        try {
          expired = !(now <= (JSON.parse(localStorage.getItem(key) ?? "") as { expiresAt: number }).expiresAt)
        } catch {
          expired = true
        }
      }
      if (expired) localStorage.removeItem(key)
    }
  } catch {
    // stockage indisponible
  }
}

let pruned = false

function setCache(key: string, text: string) {
  if (!pruned) {
    pruned = true
    pruneCache()
  }
  try {
    localStorage.setItem(key, JSON.stringify({ text, expiresAt: Date.now() + CACHE_TTL }))
  } catch {
    // quota plein : on vide le cache IA (facultatif) pour laisser la place aux données de l'utilisateur
    pruneCache(true)
  }
}

async function post(params: ClaudeRequest): Promise<string> {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  if (!response.ok) throw new AiHttpError(response.status)
  const data = (await response.json()) as { content?: { type: string; text?: string }[] }
  return data.content?.[0]?.text ?? ""
}

/** Appel avec cache de 24 h (recherche IA, planning, chat texte). */
export async function callClaude(params: ClaudeRequest): Promise<string> {
  if (!(await requestAiConsent())) throw new AiConsentError()
  const key = hashKey(params)
  const cached = getCache(key)
  if (cached) return cached
  const text = await post(params)
  setCache(key, text)
  return text
}

/** Appel sans cache (photos, TchopAI Live). */
export async function callClaudeLive(params: ClaudeRequest): Promise<string> {
  if (!(await requestAiConsent())) throw new AiConsentError()
  return post(params)
}

export async function fetchRecipeUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch("/api/fetch-recipe-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { content?: string }
    return data.content ?? null
  } catch {
    return null
  }
}

/**
 * Photo choisie ou prise → JPEG base64 réduit (1280 px max) pour rester loin
 * de la limite de taille des requêtes.
 */
export async function imageFileToBase64Jpeg(file: Blob, maxSide = 1280, quality = 0.7): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const dataUrl = canvas.toDataURL("image/jpeg", quality)
  return dataUrl.slice(dataUrl.indexOf(",") + 1)
}
