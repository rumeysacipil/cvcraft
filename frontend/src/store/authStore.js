import { create } from 'zustand'
import { authApi, userApi } from '../services/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { set({ loading: false }); return }
    try {
      const { data } = await userApi.me()
      set({ user: data, loading: false })
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, loading: false })
    }
  },

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data
  },

  register: async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data
  },

  loginWithGoogle: async (idToken) => {
    const { data } = await authApi.googleLogin(idToken)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null })
  },

  refreshUser: async () => {
    const { data } = await userApi.me()
    set({ user: data })
  }
}))
