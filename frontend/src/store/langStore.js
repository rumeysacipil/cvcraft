import { create } from 'zustand'

const LANG_KEY = 'cvcraft_lang'

export const useLangStore = create((set) => ({
  lang: localStorage.getItem(LANG_KEY) || 'TR',
  setLang: (lang) => {
    localStorage.setItem(LANG_KEY, lang)
    set({ lang })
  },
  toggleLang: () => {
    set((state) => {
      const next = state.lang === 'TR' ? 'EN' : 'TR'
      localStorage.setItem(LANG_KEY, next)
      return { lang: next }
    })
  }
}))
