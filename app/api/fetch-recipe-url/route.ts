/* Import d'une recette depuis un lien collé dans le chat TchopAI de l'app : le serveur lit la page et en renvoie le
   texte (repris de tchope/server le 18 oct. 2026). Réservé à l'app, même contrôle d'accès que /api/claude (fonction
   `recipe-url`, qui fait partie du chat), limites, et refus des adresses internes (localhost, réseaux privés), revérifiés
   à chaque redirection, pour ne pas servir de relais. */
import { NextRequest, NextResponse } from "next/server"
import { accessRefusal, checkLimits, resolveAccess } from "@/lib/server/pro-check"
import { isBrowserRequest } from "@/lib/server/app-only"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 20

/** Hôte interne ou réservé (adresse IP littérale ou nom local) : jamais lu par le serveur. */
function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "")
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") || (!h.includes(".") && !h.includes(":"))) return true
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(h)) return true
  if (h.includes(":") && (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80") || h.startsWith("::ffff:"))) return true
  return false
}

const isHttp = (u: URL) => u.protocol === "http:" || u.protocol === "https:"

export async function POST(req: NextRequest) {
  if (isBrowserRequest(req.headers)) return NextResponse.json({ error: "app-only" }, { status: 403 })
  const access = await resolveAccess(req.headers)
  const refusal = accessRefusal(access)
  if (refusal) return NextResponse.json({ error: refusal.error }, { status: refusal.status })
  const rl = checkLimits(access, "recipe-url")
  if (!rl.ok) return NextResponse.json({ error: rl.reason === "day" ? "daily-limit" : "slow-down" }, { status: 429 })

  const url = ((await req.json().catch(() => null)) as { url?: unknown } | null)?.url
  if (!url || typeof url !== "string") return NextResponse.json({ error: "Missing url" }, { status: 400 })
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }
  if (!isHttp(target)) return NextResponse.json({ error: "Invalid protocol" }, { status: 400 })
  if (isPrivateHost(target.hostname)) return NextResponse.json({ error: "Invalid host" }, { status: 400 })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    // Redirections suivies à la main (3 au plus) pour revérifier l'hôte à chaque saut.
    let response: Response | null = null
    for (let hop = 0; hop < 4; hop++) {
      response = await fetch(target.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Tchope/1.0)", Accept: "text/html" },
        signal: controller.signal,
        redirect: "manual",
      })
      const loc = response.status >= 300 && response.status < 400 ? response.headers.get("location") : null
      if (!loc) break
      target = new URL(loc, target)
      if (!isHttp(target) || isPrivateHost(target.hostname)) return NextResponse.json({ error: "Invalid redirect" }, { status: 400 })
      response = null
    }
    if (!response) return NextResponse.json({ error: "Too many redirects" }, { status: 400 })
    if (!response.ok) return NextResponse.json({ error: `Failed to fetch: ${response.status}` }, { status: 400 })
    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return NextResponse.json({ error: "URL does not point to an HTML page" }, { status: 400 })
    }
    const text = (await response.text())
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim()
    // ~4 000 caractères au plus, pour ne pas alourdir le prompt.
    return NextResponse.json({ content: text.length > 4000 ? text.slice(0, 4000) + "..." : text })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return NextResponse.json({ error: "Request timeout" }, { status: 408 })
    return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}
