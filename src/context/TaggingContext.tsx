import { useState } from 'react'
import type { ReactNode } from 'react'
import { TaggingContext, type TaggedFight, type ReleasedFight } from './tagging'

export function TaggingProvider({ children }: { children: ReactNode }) {
  const [taggedFights, setTaggedFights] = useState<TaggedFight[]>([])
  const [releasedFights, setReleasedFights] = useState<ReleasedFight[]>([])

  const updateTaggedFight = (fight: TaggedFight) => {
    const existingIndex = taggedFights.findIndex(t => t.pairingId === fight.pairingId)
    if (existingIndex >= 0) {
      const updated = [...taggedFights]
      updated[existingIndex] = fight
      setTaggedFights(updated)
    } else {
      setTaggedFights([...taggedFights, fight])
    }
  }

  const updateReleasedFight = (pairingId: number, releaseStatus: 'unreleased' | 'released') => {
    const existingIndex = releasedFights.findIndex(r => r.pairingId === pairingId)
    if (existingIndex >= 0) {
      const updated = [...releasedFights]
      updated[existingIndex] = {
        ...updated[existingIndex],
        releaseStatus,
        releasedAt: releaseStatus === 'released' ? new Date().toISOString() : undefined
      }
      setReleasedFights(updated)
    } else {
      setReleasedFights([...releasedFights, {
        pairingId,
        releaseStatus,
        releasedAt: releaseStatus === 'released' ? new Date().toISOString() : undefined
      }])
    }
  }

  const resetFight = (pairingId: number) => {
    setTaggedFights(taggedFights.filter(t => t.pairingId !== pairingId))
    setReleasedFights(releasedFights.filter(r => r.pairingId !== pairingId))
  }

  return (
    <TaggingContext.Provider value={{ taggedFights, releasedFights, updateTaggedFight, updateReleasedFight, resetFight }}>
      {children}
    </TaggingContext.Provider>
  )
}
