import { useContext } from 'react'
import { DataContext } from './DataContext'
import type { DataContextType } from './DataContext'

export function useData(): DataContextType {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
