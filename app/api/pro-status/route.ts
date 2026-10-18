/* Diagnostic du contrôle Tchopé Pro (lib/server/pro-check.ts) : https://tchope.lndev.me/api/pro-status.
   `active: true` seulement si la clé v2 est acceptée, les droits sont bons et l'entitlement `tchope_pro` existe dans ce
   projet RevenueCat ; sinon `errors` dit pourquoi. Aucun secret renvoyé. Limité par IP. */
import { NextRequest, NextResponse } from "next/server"
import { proCheckStatus } from "@/lib/server/pro-check"
import { checkRateLimit, clientKeyFromHeaders } from "@/lib/server/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(`pro-status:${clientKeyFromHeaders(req.headers)}`, { perMinute: 5, perDay: 100 })
  if (!rl.ok) return NextResponse.json({ error: "slow-down" }, { status: 429 })
  const status = await proCheckStatus()
  return NextResponse.json(
    { ...status, anthropicKey: !!(process.env.TCHOPE_SECRET_KEY || process.env.ANTHROPIC_API_KEY) },
    { headers: { "cache-control": "no-store", "x-robots-tag": "noindex" } }
  )
}
