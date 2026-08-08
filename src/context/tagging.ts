import { createContext } from 'react'

export interface TaggedFight {
  pairingId: number
  fightNumber: number
  status: 'pending' | 'tagged' | 'completed'
  outcome?: 'winner' | 'loser' | 'draw' | 'cancelled'
  outcomeWinner?: 'mayron' | 'wala'
  taggedAt?: string
}

export interface ReleasedFight {
  pairingId: number
  releaseStatus: 'unreleased' | 'released'
  releasedAt?: string
}

export interface TaggingContextType {
  taggedFights: TaggedFight[]
  releasedFights: ReleasedFight[]
  refreshFightData: () => Promise<void>
  updateTaggedFight: (fight: TaggedFight) => Promise<void>
  updateReleasedFight: (pairingId: number, releaseStatus: 'unreleased' | 'released') => Promise<void>
  resetFight: (pairingId: number) => Promise<void>
}

export const TaggingContext = createContext<TaggingContextType | undefined>(undefined)
