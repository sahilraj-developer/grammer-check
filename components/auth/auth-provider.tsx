"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type AuthState, authService, anonymousService, type AnonymousUsage } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  updateUsage: (corrections: number) => void
  anonymousUsage: AnonymousUsage
  updateAnonymousUsage: (corrections: number) => void
  canUseAnonymous: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const [anonymousUsage, setAnonymousUsage] = useState<AnonymousUsage>({ corrections: 0, limit: 5 })

  useEffect(() => {
    const user = authService.getCurrentUser()
    const usage = anonymousService.getUsage()
    setAnonymousUsage(usage)

    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }, [])

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.login(email, password)
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const user = await authService.register(email, password, name)
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    await authService.logout()
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const updateUsage = (corrections: number) => {
    if (state.user) {
      authService.updateUserUsage(state.user.id, corrections)
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, usage: { ...prev.user.usage, corrections } } : null,
      }))
    }
  }

  const updateAnonymousUsage = (corrections: number) => {
    anonymousService.updateUsage(corrections)
    setAnonymousUsage({ corrections, limit: 5 })
  }

  const canUseAnonymous = () => {
    return anonymousService.canUse()
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUsage,
        anonymousUsage,
        updateAnonymousUsage,
        canUseAnonymous,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
