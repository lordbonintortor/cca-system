import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type User } from './auth'
import { signOutUser, validateCredentials } from '../lib/credentials'

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000
const LOGIN_SUCCESS_DELAY_MS = 1800
const AUTH_SESSION_KEY = 'rememberedUser'

type StoredAuthSession = {
  user: User
  lastActivityAt: number
}

const readStoredSession = (): StoredAuthSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const rememberedRaw = localStorage.getItem(AUTH_SESSION_KEY)
  if (!rememberedRaw) {
    return null
  }

  try {
    const parsed = JSON.parse(rememberedRaw) as Partial<StoredAuthSession>
    if (!parsed.user || !parsed.lastActivityAt) {
      localStorage.removeItem(AUTH_SESSION_KEY)
      return null
    }

    if (Date.now() - parsed.lastActivityAt > INACTIVITY_LIMIT_MS) {
      localStorage.removeItem(AUTH_SESSION_KEY)
      return null
    }

    return {
      user: parsed.user,
      lastActivityAt: parsed.lastActivityAt
    }
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

const writeStoredSession = (user: User, lastActivityAt = Date.now()) => {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ user, lastActivityAt }))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedSession = readStoredSession()
  const initialUser = storedSession?.user ?? null

  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoutReason, setLogoutReason] = useState<'expired' | null>(null)
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const inactivityTimerRef = useRef<number | null>(null)
  const loginTimerRef = useRef<number | null>(null)

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
  }, [])

  const clearLoginTimer = useCallback(() => {
    if (loginTimerRef.current !== null) {
      window.clearTimeout(loginTimerRef.current)
      loginTimerRef.current = null
    }
  }, [])

  const logout = useCallback((reason?: 'expired') => {
    void signOutUser()
    clearInactivityTimer()
    clearLoginTimer()
    setIsLoggedIn(false)
    setUser(null)
    setError(null)
    setLogoutReason(reason || null)
    setLoginStatus('idle')
    localStorage.removeItem(AUTH_SESSION_KEY)
  }, [clearInactivityTimer, clearLoginTimer])

  const startInactivityTimer = useCallback((timeoutMs = INACTIVITY_LIMIT_MS) => {
    clearInactivityTimer()

    inactivityTimerRef.current = window.setTimeout(() => {
      logout('expired')
    }, Math.max(0, timeoutMs))
  }, [clearInactivityTimer, logout])

  const handleUserActivity = useCallback(() => {
    if (isLoggedIn && user) {
      writeStoredSession(user)
      startInactivityTimer()
    }
  }, [isLoggedIn, startInactivityTimer, user])

  const login = async (username: string, password: string) => {
    clearLoginTimer()
    setIsLoading(true)
    setError(null)
    setLogoutReason(null)
    setLoginStatus('loading')

    const validatedUser = await validateCredentials(username, password)

    if (!validatedUser) {
      setError('Invalid email or password')
      setIsLoading(false)
      setLoginStatus('idle')
      return
    }

    const loggedInUser: User = {
      username: validatedUser.username,
      fullName: validatedUser.fullName,
      role: validatedUser.role,
    }

    setLoginStatus('success')
    setIsLoading(false)

    loginTimerRef.current = window.setTimeout(() => {
      setUser(loggedInUser)
      setIsLoggedIn(true)
      setError(null)
      setLoginStatus('idle')

      try {
        writeStoredSession(loggedInUser)
      } catch {
        // ignore storage errors
      }
    }, LOGIN_SUCCESS_DELAY_MS)
  }

  useEffect(() => {
    if (!isLoggedIn) {
      clearInactivityTimer()
      return
    }

    const stored = readStoredSession()
    if (!stored) {
      window.setTimeout(() => logout('expired'), 0)
      return
    }

    const elapsedMs = Date.now() - stored.lastActivityAt
    startInactivityTimer(INACTIVITY_LIMIT_MS - elapsedMs)

    const activityEvents: Array<keyof WindowEventMap> = [
      'click',
      'keydown',
      'mousemove',
      'mousedown',
      'scroll',
      'touchstart',
      'focus',
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true })
    })

    return () => {
      clearInactivityTimer()
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity)
      })
    }
  }, [isLoggedIn, clearInactivityTimer, startInactivityTimer, handleUserActivity, logout])

  useEffect(() => {
    return () => {
      clearInactivityTimer()
      clearLoginTimer()
    }
  }, [clearInactivityTimer, clearLoginTimer])

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, error, logoutReason, loginStatus }}>
      {children}
    </AuthContext.Provider>
  )
}
