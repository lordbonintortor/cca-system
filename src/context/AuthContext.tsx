import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type User } from './auth'
import { validateCredentials } from '../lib/credentials'

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000
const LOGIN_SUCCESS_DELAY_MS = 1800

export function AuthProvider({ children }: { children: ReactNode }) {
  const rememberedRaw = typeof window !== 'undefined' ? localStorage.getItem('rememberedUser') : null
  let initialUser: User | null = null
  if (rememberedRaw) {
    try {
      const parsed = JSON.parse(rememberedRaw)
      // support both { user } shape and legacy direct user object
      if (parsed && parsed.user) initialUser = parsed.user as User
      else if (parsed && parsed.username) initialUser = parsed as User
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      localStorage.removeItem('rememberedUser')
    }
  }

  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const logout = useCallback(() => {
    clearInactivityTimer()
    clearLoginTimer()
    setIsLoggedIn(false)
    setUser(null)
    setError(null)
    setLoginStatus('idle')
    localStorage.removeItem('rememberedUser')
  }, [clearInactivityTimer, clearLoginTimer])

  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer()

    inactivityTimerRef.current = window.setTimeout(() => {
      logout()
    }, INACTIVITY_LIMIT_MS)
  }, [clearInactivityTimer, logout])

  const handleUserActivity = useCallback(() => {
    if (isLoggedIn) {
      startInactivityTimer()
    }
  }, [isLoggedIn, startInactivityTimer])

  const login = (username: string, password: string) => {
    clearLoginTimer()
    setIsLoading(true)
    setError(null)
    setLoginStatus('loading')

    const validatedUser = validateCredentials(username, password)

    if (!validatedUser) {
      setError('Invalid username or password')
      setIsLoading(false)
      setLoginStatus('idle')
      return
    }

    const loggedInUser: User = {
      username: validatedUser.username,
      fullName: validatedUser.fullName,
      role: validatedUser.role
    }

    setLoginStatus('success')
    setIsLoading(false)

    loginTimerRef.current = window.setTimeout(() => {
      setUser(loggedInUser)
      setIsLoggedIn(true)
      setError(null)
      setLoginStatus('idle')

      // persist until explicit logout
      try {
        localStorage.setItem('rememberedUser', JSON.stringify({ user: loggedInUser }))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore storage errors
      }
    }, LOGIN_SUCCESS_DELAY_MS)
  }

  useEffect(() => {
    if (!isLoggedIn) {
      clearInactivityTimer()
      return
    }

    startInactivityTimer()

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
  }, [isLoggedIn, clearInactivityTimer, startInactivityTimer, handleUserActivity])

  useEffect(() => {
    return () => {
      clearInactivityTimer()
      clearLoginTimer()
    }
  }, [clearInactivityTimer, clearLoginTimer])

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, error, loginStatus }}>
      {children}
    </AuthContext.Provider>
  )
}
