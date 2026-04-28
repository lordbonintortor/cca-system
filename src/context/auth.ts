import { createContext } from 'react'

export interface AuthContextType {
  isLoggedIn: boolean
  user: string | null
  login: (username: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
