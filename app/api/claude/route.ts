/* Relais Claude de l'app Tchopé (≥ 2.0.0), réservé à l'app (repris de tchope/server le 18 oct. 2026) :
   - lib/server/claude-policy.ts : modèles autorisés (`ALLOWED_MODELS`, défaut Haiku 4.5), max_tokens ≤ 2048, taille bornée ;
   - lib/server/pro-check.ts : Tchopé Pro vérifié auprès de RevenueCat. Seul le chat texte a un avant-goût gratuit ; photo,
     recherche par ingrédients, recherche libre, planning et guidage vocal sont Pro (402 `pro-required` → écran Pro) ;
   - limites par appareil. Le corps porte `feature` ; une image dans les messages = fonction photo, donc Pro.
   Rien n'est enregistré : la requête part à Anthropic et la réponse revient à l'app. */
import { NextRequest, NextResponse } from "next/server"
import { cleanClaudeRequest } from "@/lib/server/claude-policy"
import { FEATURES, accessRefusal, checkLimits, needsPro, resolveAccess, type Feature } from "@/lib/server/pro-check"
import { isBrowserRequest } from "@/lib/server/app-only"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

export async function POST(req: NextRequest) {
  if (isBrowserRequest(req.headers)) return NextResponse.json({ error: "app-only" }, { status: 403 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: "not-configured" }, { status: 503 })

  const access = await resolveAccess(req.headers)
  const refusal = accessRefusal(access)
  if (refusal) return NextResponse.json({ error: refusal.error }, { status: refusal.status })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 })
  }
  const clean = cleanClaudeRequest(body)
  if ("error" in clean) return NextResponse.json({ error: clean.error }, { status: clean.error === "too-large" ? 413 : 400 })

  const raw = (body as { feature?: unknown }).feature
  const declared: Feature = typeof raw === "string" && (FEATURES as string[]).includes(raw) ? (raw as Feature) : "chat"
  const feature: Feature = clean.images > 0 && declared === "chat" ? "chat-photo" : declared
  if (needsPro(access, feature)) return NextResponse.json({ error: "pro-required" }, { status: 402 })

  const rl = checkLimits(access, feature)
  if (!rl.ok) {
    if (!access.pro && rl.reason === "day") return NextResponse.json({ error: "pro-required" }, { status: 402 })
    return NextResponse.json({ error: rl.reason === "day" ? "daily-limit" : "slow-down" }, { status: 429 })
  }

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({ model: clean.model, max_tokens: clean.max_tokens, system: clean.system, messages: clean.messages }),
    })
    if (!res.ok) {
      console.error(`[claude] Anthropic HTTP ${res.status} : ${(await res.text()).slice(0, 300)}`)
      return NextResponse.json({ error: "ai-failed" }, { status: 502 })
    }
    return NextResponse.json(await res.json(), { headers: { "cache-control": "no-store" } })
  } catch (err) {
    console.error("[claude] erreur :", err)
    return NextResponse.json({ error: "ai-failed" }, { status: 502 })
  }
}
