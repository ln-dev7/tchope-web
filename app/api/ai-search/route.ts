import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.TCHOPE_SECRET_KEY

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  const body = await request.json()
  const { mode, recipeIndex, userIngredients, query, isFr } = body

  if (mode === "ingredients") {
    const systemPrompt = `You are a Cameroonian cooking ingredient matcher.
You will receive a list of recipes (format: id|name|ingredients) and user's available ingredients.
For each recipe, determine which of its ingredients the user HAS, using semantic matching:
- "poulet" matches "cuisses de poulet", "ailes de poulet", "poulet entier", etc.
- "tomate" matches "tomates cerises", "tomates fraîches", etc.
- "haricots blancs" matches "Haricots blancs (Koki / Cornilles)", "haricots de cornille", "niébé", etc.
- "piment" matches "piment rouge", "piment habanero", "piment jaune", etc.
- Be generous with matching: if the user's ingredient is a core component of a recipe ingredient, it's a match.

IMPORTANT - Classify each recipe ingredient as:
- "base": the main/essential ingredient(s) that define the dish (e.g. haricots for Koki, ndolé leaves for Ndolé)
- "secondary": supporting ingredients (e.g. huile de palme, feuilles de bananier)
- "generic": common pantry items everyone has (sel, poivre, eau, huile de friture, cube maggi) - EXCLUDE these from counts

Return ONLY a valid JSON array (no markdown):
[{"id":"recipe-id","matchedBase":["ingredient1"],"matchedSecondary":["ingredient2"],"totalBase":1,"totalSecondary":3,"reason":"${isFr ? "Courte explication en français" : "Short explanation in English"}"}]
- "matchedBase": base ingredients the user has
- "matchedSecondary": secondary ingredients the user has
- "totalBase": total base ingredients in recipe (excluding generic)
- "totalSecondary": total secondary ingredients in recipe (excluding generic)
- "reason": what key ingredients are missing, or "all main ingredients available" if they have the base
- Include ALL recipes where at least 1 base ingredient matches
- Return at most 15 results
- If nothing matches, return []`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: `RECIPES:\n${recipeIndex}\n\nMY INGREDIENTS:\n${userIngredients.join(", ")}` }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid response" }, { status: 500 })
    }

    type Raw = { id: string; matchedBase: string[]; matchedSecondary: string[]; totalBase: number; totalSecondary: number; reason: string }
    const parsed: Raw[] = JSON.parse(jsonMatch[0])

    const BW = 0.6, SW = 0.4
    const results = parsed
      .map((r) => {
        const bm = r.matchedBase?.length ?? 0, bt = Math.max(r.totalBase ?? 1, 1)
        const sm = r.matchedSecondary?.length ?? 0, st = Math.max(r.totalSecondary ?? 1, 1)
        return { id: r.id, match: Math.round((bm / bt * BW + sm / st * SW) * 100), reason: r.reason }
      })
      .filter((r) => r.match >= 15)
      .sort((a, b) => b.match - a.match)
      .slice(0, 10)

    return NextResponse.json({ results })
  }

  if (mode === "free") {
    const systemPrompt = `You are a Cameroonian cooking assistant. You help users find recipes based on natural language requests.
You will receive a list of recipes (format: id|name|category|duration|difficulty|spiciness|servings|ingredients) and a user request in natural language.

The user may ask things like:
- "un plat épicé avec du poulet pour 6 personnes"
- "something quick with tomatoes and onions"
- "je veux un dessert facile"
- "j'ai du manioc et des arachides, qu'est-ce que je peux faire?"
- "un truc pour le dimanche en famille"

Analyze the request and find the best matching recipes considering:
- Mentioned ingredients
- Desired cuisine type/category
- Time constraints (quick, long, etc.)
- Difficulty level
- Number of servings
- Spiciness preferences
- General mood/occasion

Return ONLY a valid JSON array (no markdown):
[{"id":"recipe-id","match":85,"reason":"${isFr ? "Courte explication en français de pourquoi cette recette correspond" : "Short explanation in English of why this recipe matches"}"}]
- "match": relevance score 0-100 based on how well the recipe fits the request
- "reason": brief explanation of why this recipe was selected
- Return at most 10 results, sorted by relevance
- Only include recipes with match >= 30
- If nothing matches, return []`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: `RECIPES:\n${recipeIndex}\n\nREQUEST:\n${query}` }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid response" }, { status: 500 })
    }

    type SearchResult = { id: string; match: number; reason: string }
    const parsed: SearchResult[] = JSON.parse(jsonMatch[0])
    const results = parsed.filter((r) => r.match >= 30).sort((a, b) => b.match - a.match).slice(0, 10)

    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
}
