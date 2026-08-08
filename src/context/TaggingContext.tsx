import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TaggingContext, type TaggedFight, type ReleasedFight } from './tagging'
import {
  getTaggedFights,
  getReleasedFights,
  createTaggedFight,
  createReleasedFight,
  deleteTaggedFight,
  deleteReleasedFight,
  createAuditLog,
  updateTaggedFight as updateTaggedFightDB,
  updateReleasedFight as updateReleasedFightDB
} from '../lib/supabaseService'

type TaggedFightRow = {
  pairing_id: number
  fight_number: number
  status: TaggedFight['status']
  outcome?: TaggedFight['outcome']
  outcome_winner?: TaggedFight['outcomeWinner']
  tagged_at?: string
}

type ReleasedFightRow = {
  pairing_id: number
  release_status: ReleasedFight['releaseStatus']
  released_at?: string
}

const mapTaggedFight = (fight: TaggedFightRow): TaggedFight => ({
  pairingId: fight.pairing_id,
  fightNumber: fight.fight_number,
  status: fight.status,
  outcome: fight.outcome,
  outcomeWinner: fight.outcome_winner,
  taggedAt: fight.tagged_at
})

const mapReleasedFight = (fight: ReleasedFightRow): ReleasedFight => ({
  pairingId: fight.pairing_id,
  releaseStatus: fight.release_status,
  releasedAt: fight.released_at
})

export function TaggingProvider({ children }: { children: ReactNode }) {
  const [taggedFights, setTaggedFights] = useState<TaggedFight[]>([])
  const [releasedFights, setReleasedFights] = useState<ReleasedFight[]>([])

  const refreshFightData = useCallback(async () => {
    const [tagged, released] = await Promise.all([
      getTaggedFights(),
      getReleasedFights()
    ])
    setTaggedFights((tagged as TaggedFightRow[]).map(mapTaggedFight))
    setReleasedFights((released as ReleasedFightRow[]).map(mapReleasedFight))
  }, [])

  // Keep fight status synchronized across the tagging, releasing, report, and monitor screens.
  useEffect(() => {
    const refreshSafely = async () => {
      try {
        await refreshFightData()
      } catch (error) {
        console.error('Failed to load tagging data:', error)
      }
    }

    void refreshSafely()
    const interval = window.setInterval(() => void refreshSafely(), 5000)
    const handleFocus = () => void refreshSafely()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshSafely()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshFightData])

  const updateTaggedFight = async (fight: TaggedFight) => {
    try {
      const dbFight = {
        status: fight.status,
        outcome: fight.outcome,
        outcome_winner: fight.outcomeWinner
      }
      const updatedRows = await updateTaggedFightDB(fight.pairingId, dbFight)
      if (!updatedRows || updatedRows.length === 0) {
        await createTaggedFight({
          pairing_id: fight.pairingId,
          fight_number: fight.fightNumber,
          ...dbFight
        })
      }
      await createAuditLog({
        action: 'tagged',
        entity_type: 'fight',
        entity_id: fight.pairingId,
        details: dbFight,
      })
      await refreshFightData()
    } catch (error) {
      console.error('Failed to update tagged fight:', error)
      throw error
    }
  }

  const updateReleasedFight = async (pairingId: number, releaseStatus: 'unreleased' | 'released') => {
    try {
      const releasedAt = releaseStatus === 'released' ? new Date().toISOString() : undefined
      const updatedRows = await updateReleasedFightDB(pairingId, releaseStatus, releasedAt)
      if (!updatedRows || updatedRows.length === 0) {
        await createReleasedFight({
          pairing_id: pairingId,
          release_status: releaseStatus,
          released_at: releasedAt || null
        })
      }
      await createAuditLog({
        action: releaseStatus === 'released' ? 'released' : 'unreleased',
        entity_type: 'fight',
        entity_id: pairingId,
        details: { releaseStatus, releasedAt },
      })
      await refreshFightData()
    } catch (error) {
      console.error('Failed to update released fight:', error)
      throw error
    }
  }

  const resetFight = async (pairingId: number) => {
    try {
      await deleteTaggedFight(pairingId)
      await deleteReleasedFight(pairingId)
      await createAuditLog({
        action: 'reset',
        entity_type: 'fight',
        entity_id: pairingId,
      })
      await refreshFightData()
    } catch (error) {
      console.error('Failed to reset fight:', error)
      throw error
    }
  }

  return (
    <TaggingContext.Provider value={{ taggedFights, releasedFights, refreshFightData, updateTaggedFight, updateReleasedFight, resetFight }}>
      {children}
    </TaggingContext.Provider>
  )
}
