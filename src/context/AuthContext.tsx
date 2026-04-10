import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<string | null>(null)

  const login = (username: string) => {
    setIsLoggedIn(true)
    setUser(username)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
