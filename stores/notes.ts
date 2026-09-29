import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Note } from "@/types/recipe"

/** Notes personnelles (comme tchope/context/NotesContext.tsx), dans le navigateur. */
type NotesStore = {
  notes: Note[]
  addNote: (note: Note) => void
  updateNote: (id: string, note: Note) => void
  deleteNote: (id: string) => void
  getNote: (id: string) => Note | undefined
  clearAll: () => void
}

export const useNotes = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: [],
      addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
      updateNote: (id, note) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...note, updatedAt: new Date().toISOString() } : n)),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      getNote: (id) => get().notes.find((n) => n.id === id),
      clearAll: () => set({ notes: [] }),
    }),
    { name: "tchope_notes" }
  )
)
