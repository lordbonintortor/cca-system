import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type User } from './auth'
import { validateCredentials } from '../lib/credentials'

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
  const login = (username: string, password: string) => {
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

    // persist until explicit logout
    try {
      localStorage.setItem('rememberedUser', JSON.stringify({ user: loggedInUser }))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore storage errors
    }
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setError(null)
    localStorage.removeItem('rememberedUser')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}
