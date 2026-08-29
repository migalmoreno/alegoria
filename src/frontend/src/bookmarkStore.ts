import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";

const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => set(name, value),
  removeItem: async (name) => del(name),
};

export interface Bookmark {
  url: string;
  title?: string;
  thumbnail?: string;
  addedAt: string;
}

interface BookmarkStore {
  bookmarks: Bookmark[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  add: (bookmark: Omit<Bookmark, "addedAt">) => void;
  remove: (url: string) => void;
  isBookmarked: (url: string) => boolean;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      add: (bookmark) =>
        set((state) => ({
          bookmarks: [
            { ...bookmark, addedAt: new Date().toISOString() },
            ...state.bookmarks,
          ],
        })),
      remove: (url) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.url !== url),
        })),
      isBookmarked: (url) => get().bookmarks.some((b) => b.url === url),
    }),
    {
      name: "alegoria-bookmarks",
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
