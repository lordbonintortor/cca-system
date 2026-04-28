import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  getEvents,
  getMembers,
  getPairings,
  getTaggedFights,
  getReleasedFights,
  getRaffleWinners,
  createMember,
  createMultipleMembers,
  createEvent,
  createPairing,
  createRaffleWinner,
} from '../lib/supabaseService'

export interface Event {
  id: number
  name: string
  type: string
  derby_info: string
  date: string
}

export interface Member {
  id: number
  entry_name: string
  event_name: string
  handler_name: string
  cock_type: string
  number_of_entries: number
  registration_date: string
}

export interface Pairing {
  id: number
  event_id: number
  fight_number: number
  sultada_number: string
  mayron_entry_id: number
  mayron_handler: string
  wala_entry_id: number
  wala_handler: string
  parada_amount?: number
}

export interface TaggedFight {
  id: number
  pairing_id: number
  fight_number: number
  status: string
  outcome?: string
  outcome_winner?: string
}

export interface ReleasedFight {
  id: number
  pairing_id: number
  release_status: string
  released_at?: string
}

export interface RaffleWinner {
  id: number
  ticket_number: string
  participant_name: string
  entry_name: string
  event_name: string
  drawn_at: string
}

interface DataContextType {
  events: Event[]
  members: Member[]
  pairings: Pairing[]
  taggedFights: TaggedFight[]
  releasedFights: ReleasedFight[]
  raffleWinners: RaffleWinner[]
  isLoading: boolean
  
  // Actions
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>
  addMember: (member: Omit<Member, 'id'>) => Promise<void>
  addMultipleMembers: (members: Array<Omit<Member, 'id'>>) => Promise<void>
  addPairing: (pairing: Omit<Pairing, 'id'>) => Promise<void>
  addRaffleWinner: (winner: Omit<RaffleWinner, 'id'>) => Promise<void>
  
  // Refresh
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [pairings, setPairings] = useState<Pairing[]>([])
  const [taggedFights, setTaggedFights] = useState<TaggedFight[]>([])
  const [releasedFights, setReleasedFights] = useState<ReleasedFight[]>([])
  const [raffleWinners, setRaffleWinners] = useState<RaffleWinner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = async () => {
    try {
      const [eventsData, membersData, pairingsData, taggedData, releasedData, raffleData] = await Promise.all([
        getEvents(),
        getMembers(),
        getPairings(),
        getTaggedFights(),
        getReleasedFights(),
        getRaffleWinners(),
      ])

      setEvents(eventsData || [])
      setMembers(membersData || [])
      setPairings(pairingsData || [])
      setTaggedFights(taggedData || [])
      setReleasedFights(releasedData || [])
      setRaffleWinners(raffleData || [])
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await refreshData()
      setIsLoading(false)
    }

    loadData()
  }, [])

  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      await createEvent({
        name: event.name,
        type: event.type,
        derby_info: event.derby_info,
        date: event.date,
      })
      await refreshData()
    } catch (error) {
      console.error('Error adding event:', error)
      throw error
    }
  }

  const addMember = async (member: Omit<Member, 'id'>) => {
    try {
      await createMember({
        entry_name: member.entry_name,
        event_name: member.event_name,
        handler_name: member.handler_name,
        cock_type: member.cock_type,
        number_of_entries: member.number_of_entries,
        registration_date: member.registration_date,
      })
      await refreshData()
    } catch (error) {
      console.error('Error adding member:', error)
      throw error
    }
  }

  const addMultipleMembers = async (members: Array<Omit<Member, 'id'>>) => {
    try {
      await createMultipleMembers(
        members.map(member => ({
          entry_name: member.entry_name,
          event_name: member.event_name,
          handler_name: member.handler_name,
          cock_type: member.cock_type,
          number_of_entries: member.number_of_entries,
          registration_date: member.registration_date,
        }))
      )
      await refreshData()
    } catch (error) {
      console.error('Error adding multiple members:', error)
      throw error
    }
  }

  const addPairing = async (pairing: Omit<Pairing, 'id'>) => {
    try {
      await createPairing({
        event_id: pairing.event_id,
        fight_number: pairing.fight_number,
        sultada_number: pairing.sultada_number,
        mayron_entry_id: pairing.mayron_entry_id,
        mayron_handler: pairing.mayron_handler,
        wala_entry_id: pairing.wala_entry_id,
        wala_handler: pairing.wala_handler,
        parada_amount: pairing.parada_amount,
      })
      await refreshData()
    } catch (error) {
      console.error('Error adding pairing:', error)
      throw error
    }
  }

  const addRaffleWinner = async (winner: Omit<RaffleWinner, 'id'>) => {
    try {
      await createRaffleWinner({
        ticket_number: winner.ticket_number,
        participant_name: winner.participant_name,
        entry_name: winner.entry_name,
        event_name: winner.event_name,
        drawn_at: winner.drawn_at,
      })
      await refreshData()
    } catch (error) {
      console.error('Error adding raffle winner:', error)
      throw error
    }
  }

  const value: DataContextType = {
    events,
    members,
    pairings,
    taggedFights,
    releasedFights,
    raffleWinners,
    isLoading,
    addEvent,
    addMember,
    addMultipleMembers,
    addPairing,
    addRaffleWinner,
    refreshData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
