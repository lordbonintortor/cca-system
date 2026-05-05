import { createContext } from 'react'

export interface User {
  username: string
  fullName: string
  role: string
}

export interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (username: string, password: string) => void
  logout: () => void
  isLoading?: boolean
  error?: string | null
  logoutReason?: 'expired' | null
  loginStatus?: 'idle' | 'loading' | 'success'
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
