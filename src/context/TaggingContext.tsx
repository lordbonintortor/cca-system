import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { TaggingContext, type TaggedFight, type ReleasedFight } from './tagging'
import {
  getTaggedFights,
  getReleasedFights,
  createTaggedFight,
  createReleasedFight,
  deleteTaggedFight,
  deleteReleasedFight,
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

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagged, released] = await Promise.all([
          getTaggedFights(),
          getReleasedFights()
        ])
        setTaggedFights((tagged as TaggedFightRow[]).map(mapTaggedFight))
        setReleasedFights((released as ReleasedFightRow[]).map(mapReleasedFight))
      } catch (error) {
        console.error('Failed to load tagging data:', error)
      }
    }

    loadData()
  }, [])

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

      // Update local state
      const existingIndex = taggedFights.findIndex(t => t.pairingId === fight.pairingId)
      if (existingIndex >= 0) {
        const updated = [...taggedFights]
        updated[existingIndex] = fight
        setTaggedFights(updated)
      } else {
        setTaggedFights([...taggedFights, fight])
      }
    } catch (error) {
      console.error('Failed to update tagged fight:', error)
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

      // Update local state
      const existingIndex = releasedFights.findIndex(r => r.pairingId === pairingId)
      if (existingIndex >= 0) {
        const updated = [...releasedFights]
        updated[existingIndex] = {
          ...updated[existingIndex],
          releaseStatus,
          releasedAt
        }
        setReleasedFights(updated)
      } else {
        setReleasedFights([...releasedFights, {
          pairingId,
          releaseStatus,
          releasedAt
        }])
      }
    } catch (error) {
      console.error('Failed to update released fight:', error)
    }
  }

  const resetFight = async (pairingId: number) => {
    try {
      await deleteTaggedFight(pairingId)
      await deleteReleasedFight(pairingId)
      setTaggedFights(taggedFights.filter(t => t.pairingId !== pairingId))
      setReleasedFights(releasedFights.filter(r => r.pairingId !== pairingId))
    } catch (error) {
      console.error('Failed to reset fight:', error)
    }
  }

  return (
    <TaggingContext.Provider value={{ taggedFights, releasedFights, updateTaggedFight, updateReleasedFight, resetFight }}>
      {children}
    </TaggingContext.Provider>
  )
}
