import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type User } from './auth'
import { validateCredentials } from '../lib/credentials'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
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

    setUser({
      username: validatedUser.username,
      fullName: validatedUser.fullName,
      role: validatedUser.role
    })
    setIsLoggedIn(true)
    setError(null)
    setIsLoading(false)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}
