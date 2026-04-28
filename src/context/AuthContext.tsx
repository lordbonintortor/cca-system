import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type User } from './auth'
import { validateCredentials } from '../lib/credentials'

export function AuthProvider({ children }: { children: ReactNode }) {
  const rememberedRaw = typeof window !== 'undefined' ? localStorage.getItem('rememberedUser') : null
  let initialUser: User | null = null
  let initialExpires = 0
  if (rememberedRaw) {
    try {
      const parsed = JSON.parse(rememberedRaw)
      if (parsed && parsed.user && parsed.expiresAt) {
        const expiresAt = Number(parsed.expiresAt) || 0
        if (expiresAt > Date.now()) {
          initialUser = parsed.user as User
          initialExpires = expiresAt
        } else {
          localStorage.removeItem('rememberedUser')
        }
      }
    } catch (e) {
      localStorage.removeItem('rememberedUser')
    }
  }

  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialUser)
  const logoutTimer = useRef<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = (username: string, password: string, remember = false) => {
    setIsLoading(true)
    setError(null)

    const validatedUser = validateCredentials(username, password)

    if (!validatedUser) {
      setError('Invalid username or password')
      setIsLoading(false)
      return
    }

    const loggedInUser: User = {
      username: validatedUser.username,
      fullName: validatedUser.fullName,
      role: validatedUser.role
    }

    setUser(loggedInUser)
    setIsLoggedIn(true)
    setError(null)
    setIsLoading(false)

    if (remember) {
      const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minutes
      localStorage.setItem('rememberedUser', JSON.stringify({ user: loggedInUser, expiresAt }))
      // set auto-logout timer
      if (logoutTimer.current) window.clearTimeout(logoutTimer.current)
      const ms = expiresAt - Date.now()
      logoutTimer.current = window.setTimeout(() => {
        logout()
      }, ms) as unknown as number
    }
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setError(null)
    localStorage.removeItem('rememberedUser')
    if (logoutTimer.current) {
      window.clearTimeout(logoutTimer.current)
      logoutTimer.current = null
    }
  }

  // if initialized from storage, start timer for remaining time
  useEffect(() => {
    if (initialUser && initialExpires) {
      const ms = initialExpires - Date.now()
      if (ms > 0) {
        logoutTimer.current = window.setTimeout(() => {
          logout()
        }, ms) as unknown as number
      } else {
        // expired
        localStorage.removeItem('rememberedUser')
        setUser(null)
        setIsLoggedIn(false)
      }
    }
    // cleanup on unmount
    return () => {
      if (logoutTimer.current) window.clearTimeout(logoutTimer.current)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}
