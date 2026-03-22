"use client"

import { useState } from "react"
import Image from "next/image"
import { getRecipeImage } from "@/constants/images"
import type { Category } from "@/types/recipe"

const categoryEmoji: Record<Category, string> = {
  Plat: "🍲",
  Entrée: "🥗",
  Sauce: "🫕",
  Accompagnement: "🍚",
  Boisson: "🥤",
  Grillade: "🔥",
  Dessert: "🍰",
}

const categoryColors: Record<Category, string> = {
  Plat: "bg-[#FED3C7] dark:bg-[#3A2520]",
  Entrée: "bg-[#D1FFC8] dark:bg-[#1A3A1A]",
  Sauce: "bg-[#FFE4C8] dark:bg-[#3A2A1A]",
  Accompagnement: "bg-[#FFF3C8] dark:bg-[#3A3520]",
  Boisson: "bg-[#C8E4FF] dark:bg-[#1A2A3A]",
  Grillade: "bg-[#FFD1C8] dark:bg-[#3A201A]",
  Dessert: "bg-[#F3C8FF] dark:bg-[#2A1A3A]",
}

export function RecipeImage({
  recipeId,
  category,
  alt,
  className = "",
  fill = false,
  width,
  height,
  imageUri,
}: {
  recipeId: string
  category: Category
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  imageUri?: string | null
}) {
  const [error, setError] = useState(false)

  const isUserRecipe = recipeId.startsWith("user-")
  const src = imageUri || (isUserRecipe ? null : getRecipeImage(recipeId, category))

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center ${categoryColors[category]} ${className}`}
      >
        <span className="text-4xl">{categoryEmoji[category]}</span>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        onError={() => setError(true)}
        unoptimized
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 200}
      height={height ?? 200}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      unoptimized
    />
  )
}
