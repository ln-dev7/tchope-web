import type { UserRecipe, Note } from "@/types/recipe"

/** Message du chat TchopAI (comme tchope/components/tchop-ai/types.ts). */
export type Message = {
  id: string
  role: "user" | "assistant" | "info"
  content: string
  recipeIds?: string[]
  saveRecipe?: UserRecipe
  noteIds?: string[]
  saveNote?: Note
}
