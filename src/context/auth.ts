import { createContext } from 'react'

export interface User {
  username: string
  fullName: string
  role: string
}

export interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (username: string, password: string, remember?: boolean) => void
  logout: () => void
  isLoading?: boolean
  error?: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
