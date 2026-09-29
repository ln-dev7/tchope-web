import { LIMITS, clientIp, isSameOrigin, jsonError, rateLimit } from "@/lib/server/ai-guard"

/**
 * Relais vers l'API Claude pour TchopAI (même rôle que server/api/claude.ts de
 * l'app mobile), avec la clé côté serveur uniquement. Seul le modèle de l'app
 * est accepté, les tokens sont plafonnés et chaque IP est limitée.
 */

export const runtime = "nodejs"
export const maxDuration = 60

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
const ALLOWED_MODELS = new Set(["claude-haiku-4-5-20251001"])
const MAX_TOKENS = 2048
const MAX_BODY_BYTES = 4_000_000
// Le chat TchopAI renvoie toute la conversation (comme le mobile, sans plafond) :
// 60 messages bloquaient une conversation dès le 30e échange.
const MAX_MESSAGES = 200
const MAX_SYSTEM_CHARS = 200_000
// La recherche IA libre envoie tout le catalogue dans un seul message (≈ 26 000
// caractères pour 140 recettes) : 30 000 aurait cassé la fonction dès quelques recettes de plus.
const MAX_TEXT_CHARS = 100_000
const MAX_IMAGE_B64 = 3_000_000
const UPSTREAM_TIMEOUT_MS = 55_000
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

type TextBlock = { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
type ImageBlock = { type: "image"; source: { type: "base64"; media_type: string; data: string } }
type Message = { role: "user" | "assistant"; content: string | (TextBlock | ImageBlock)[] }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function cleanSystem(system: unknown): string | TextBlock[] | null {
  if (typeof system === "string") return system.length <= MAX_SYSTEM_CHARS ? system : null
  if (!Array.isArray(system) || system.length > 4) return null
  let total = 0
  const out: TextBlock[] = []
  for (const b of system) {
    if (!isRecord(b) || b.type !== "text" || typeof b.text !== "string") return null
    total += b.text.length
    const block: TextBlock = { type: "text", text: b.text }
    if (isRecord(b.cache_control) && b.cache_control.type === "ephemeral") block.cache_control = { type: "ephemeral" }
    out.push(block)
  }
  return total <= MAX_SYSTEM_CHARS ? out : null
}

/**
 * Valide les messages. `newImages` = photos du dernier message seulement : le
 * Live garde ses photos récentes dans l'historique, elles ne doivent pas être
 * recomptées à chaque échange vocal (sinon la limite photo tombe en quelques minutes).
 */
function cleanMessages(messages: unknown): { messages: Message[]; newImages: number } | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null
  let images = 0
  const out: Message[] = []
  for (const m of messages) {
    if (!isRecord(m) || (m.role !== "user" && m.role !== "assistant")) return null
    if (typeof m.content === "string") {
      if (m.content.length > MAX_TEXT_CHARS) return null
      // Texte vide (réponse du chat réduite à ses balises [RECIPES:…]/[SAVE_…]) : refusé par
      // Anthropic, il bloquerait toute la suite de la conversation. Les tours consécutifs
      // du même rôle sont fusionnés par l'API, on peut donc l'omettre.
      if (m.content.trim()) out.push({ role: m.role, content: m.content })
      continue
    }
    if (!Array.isArray(m.content) || m.content.length === 0 || m.content.length > 6) return null
    const blocks: (TextBlock | ImageBlock)[] = []
    for (const b of m.content) {
      if (!isRecord(b)) return null
      if (b.type === "text" && typeof b.text === "string" && b.text.length <= MAX_TEXT_CHARS) {
        if (b.text.trim()) blocks.push({ type: "text", text: b.text })
      } else if (b.type === "image" && isRecord(b.source)) {
        const { type, media_type, data } = b.source
        if (type !== "base64" || typeof media_type !== "string" || !IMAGE_TYPES.has(media_type)) return null
        if (typeof data !== "string" || data.length > MAX_IMAGE_B64) return null
        images++
        blocks.push({ type: "image", source: { type: "base64", media_type, data } })
      } else {
        return null
      }
    }
    if (blocks.length > 0) out.push({ role: m.role, content: blocks })
  }
  if (out.length === 0 || images > 2) return null
  const last = out[out.length - 1].content
  const newImages = typeof last === "string" ? 0 : last.filter((b) => b.type === "image").length
  return { messages: out, newImages }
}

export async function POST(req: Request) {
  const apiKey = process.env.TCHOPE_SECRET_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) return jsonError(500, "API key not configured")

  if (!isSameOrigin(req)) return jsonError(403, "Forbidden")

  const length = Number(req.headers.get("content-length") ?? 0)
  if (length > MAX_BODY_BYTES) return jsonError(413, "Payload too large")

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonError(400, "Invalid JSON")
  }
  if (!isRecord(body)) return jsonError(400, "Invalid body")

  const model = typeof body.model === "string" ? body.model : ""
  if (!ALLOWED_MODELS.has(model)) return jsonError(400, "Model not allowed")

  const requested = typeof body.max_tokens === "number" ? Math.floor(body.max_tokens) : MAX_TOKENS
  const max_tokens = Math.min(Math.max(requested, 1), MAX_TOKENS)

  const system = body.system === undefined ? undefined : cleanSystem(body.system)
  if (system === null) return jsonError(400, "Invalid system prompt")

  const cleaned = cleanMessages(body.messages)
  if (!cleaned) return jsonError(400, "Invalid messages")

  const ip = clientIp(req)
  const wait =
    rateLimit("claude", ip, LIMITS.claude) ||
    (cleaned.newImages > 0 ? rateLimit("image", ip, LIMITS.image) : 0)
  if (wait) return jsonError(429, "Too many requests", { "Retry-After": String(wait) })

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, ...(system !== undefined ? { system } : {}), messages: cleaned.messages }),
      // Réponse JSON propre avant que Vercel ne coupe la fonction (maxDuration = 60 s)
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!response.ok) {
      const details = await response.text()
      console.error("Anthropic API error", response.status, details.slice(0, 500))
      return jsonError(response.status === 429 || response.status === 529 ? 503 : 502, `Anthropic API error: ${response.status}`)
    }

    const data = (await response.json()) as { content?: unknown; stop_reason?: unknown }
    return Response.json({ content: data.content ?? [], stop_reason: data.stop_reason ?? null })
  } catch (err) {
    if ((err as Error)?.name === "TimeoutError") return jsonError(504, "Upstream timeout")
    console.error("Claude proxy error", err)
    return jsonError(500, "Internal server error")
  }
}
