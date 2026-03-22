"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Camera } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { useAppTranslations } from "@/hooks/use-app-translations"
import { useUserRecipes } from "@/stores/user-recipes"
import type { Region, Difficulty, UserRecipe } from "@/types/recipe"

const REGIONS: Region[] = [
  "Littoral", "Ouest", "Centre", "Sud", "Nord", "Est",
  "Adamaoua", "Extrême-Nord", "Nord-Ouest", "Sud-Ouest",
]
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"]

export default function AddRecipePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLocale()
  const { t } = useAppTranslations(locale)
  const { addRecipe, updateRecipe, userRecipes } = useUserRecipes()

  const editId = searchParams.get("edit")
  const editingRecipe = editId ? userRecipes.find((r) => r.id === editId) : null
  const isEditing = !!editingRecipe

  const [name, setName] = useState("")
  const [region, setRegion] = useState<Region>("Centre")
  const [duration, setDuration] = useState("30")
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy")
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }])
  const [steps, setSteps] = useState([""])
  const [imageUri, setImageUri] = useState<string | null>(null)

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name)
      setRegion(editingRecipe.region)
      setDuration(String(editingRecipe.duration))
      setDifficulty(editingRecipe.difficulty)
      setIngredients(
        editingRecipe.ingredients.length > 0
          ? editingRecipe.ingredients
          : [{ name: "", quantity: "" }]
      )
      setSteps(
        editingRecipe.steps.length > 0 ? editingRecipe.steps : [""]
      )
      setImageUri(editingRecipe.imageUri ?? null)
    }
  }, [editingRecipe])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageUri(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!name.trim()) return

    const recipe: UserRecipe = {
      id: isEditing ? editingRecipe!.id : `user-${Date.now()}`,
      name: name.trim(),
      description: "",
      image: null,
      region,
      category: "Plat",
      duration: parseInt(duration) || 30,
      difficulty,
      spiciness: "Mild",
      servings: 4,
      rating: 0,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.trim()),
      tips: null,
      isUserCreated: true,
      createdAt: isEditing ? editingRecipe!.createdAt : new Date().toISOString(),
      imageUri,
    }

    if (isEditing) {
      updateRecipe(editingRecipe!.id, recipe)
      toast.success(t("recipeUpdated"))
    } else {
      addRecipe(recipe)
      toast.success(t("recipeAdded"))
    }
    router.back()
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex size-9 cursor-pointer items-center justify-center rounded-xl bg-surface dark:bg-dark-surface"
        >
          <ArrowLeft className="size-5 text-foreground dark:text-white" />
        </button>
        <h1 className="text-xl font-extrabold text-foreground dark:text-white">
          {isEditing ? t("editRecipe") : t("newRecipe")}
        </h1>
      </div>

      {/* Photo */}
      <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/10 bg-surface transition-colors hover:border-primary/30 sm:h-40 dark:border-white/10 dark:bg-dark-surface">
        {imageUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUri} alt="Recipe" className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <>
            <Camera className="size-7 text-muted dark:text-dark-muted" />
            <span className="text-sm text-muted dark:text-dark-muted">{t("addPhoto")}</span>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </label>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("recipeName")}
        className="w-full rounded-2xl bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted dark:bg-dark-surface dark:text-white dark:placeholder:text-dark-muted"
      />

      {/* Region */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-muted dark:text-dark-muted">{t("region")}</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          className="w-full cursor-pointer rounded-2xl bg-surface px-4 py-3 text-sm text-foreground dark:bg-dark-surface dark:text-white"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Duration + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-muted dark:text-dark-muted">{t("prepTimeLabel")}</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-2xl bg-surface px-4 py-3 text-sm text-foreground dark:bg-dark-surface dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold text-muted dark:text-dark-muted">{t("difficultyLabel")}</label>
          <div className="flex gap-1">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 cursor-pointer rounded-xl py-3 text-xs font-semibold transition-colors ${
                  difficulty === d
                    ? "bg-primary text-white"
                    : "bg-surface text-foreground dark:bg-dark-surface dark:text-white"
                }`}
              >
                {d === "Easy" ? t("easy") : d === "Medium" ? t("medium") : t("hard")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-foreground dark:text-white">
          {t("ingredients")} <span className="text-muted dark:text-dark-muted">({ingredients.filter((i) => i.name.trim()).length})</span>
        </h2>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => {
                  const next = [...ingredients]
                  next[i] = { ...next[i], name: e.target.value }
                  setIngredients(next)
                }}
                placeholder={t("ingredientName")}
                className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted dark:bg-dark-surface dark:text-white"
              />
              <input
                type="text"
                value={ing.quantity}
                onChange={(e) => {
                  const next = [...ingredients]
                  next[i] = { ...next[i], quantity: e.target.value }
                  setIngredients(next)
                }}
                placeholder={t("quantity")}
                className="w-24 rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted sm:w-28 dark:bg-dark-surface dark:text-white"
              />
              {ingredients.length > 1 && (
                <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))} className="cursor-pointer text-red-500">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setIngredients([...ingredients, { name: "", quantity: "" }])}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/10 py-2.5 text-sm font-medium text-muted dark:border-white/10 dark:text-dark-muted"
          >
            <Plus className="size-4" />
            {t("addIngredient")}
          </button>
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-foreground dark:text-white">{t("steps")}</h2>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white sm:size-8">
                {i + 1}
              </div>
              <textarea
                value={step}
                onChange={(e) => {
                  const next = [...steps]
                  next[i] = e.target.value
                  setSteps(next)
                }}
                placeholder={t("describeStep")}
                rows={2}
                className="min-w-0 flex-1 resize-none rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted dark:bg-dark-surface dark:text-white"
              />
              {steps.length > 1 && (
                <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="cursor-pointer self-start text-red-500">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setSteps([...steps, ""])}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/10 py-2.5 text-sm font-medium text-muted dark:border-white/10 dark:text-dark-muted"
          >
            <Plus className="size-4" />
            {t("addStep")}
          </button>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 cursor-pointer rounded-2xl bg-surface py-3.5 text-sm font-semibold text-foreground dark:bg-dark-surface dark:text-white"
        >
          {t("cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 cursor-pointer rounded-2xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {t("saveRecipe")}
        </button>
      </div>
    </div>
  )
}
