import { supabase } from './supabaseClient'

// ===== EVENTS =====
export const getEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data
}

export const createEvent = async (event: {
  name: string
  type: string
  derby_info: string
  date: string
}) => {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()

  if (error) {
    console.error('Error creating event:', error)
    throw error
  }
  return data[0]
}

export const updateEvent = async (
  id: number,
  event: {
    name: string
    type: string
    derby_info: string
    date: string
  }
) => {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating event:', error)
    throw error
  }
  return data[0]
}

export const deleteEvent = async (id: number) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

export const isForeignKeyUpdateError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as { code?: string; message?: string }
  return (
    maybeError.code === '23503' ||
    maybeError.message?.toLowerCase().includes('foreign key constraint') === true
  )
}

// ===== MEMBERS =====
export const getMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching members:', error)
    return []
  }
  return data
}

export const getMembersByEvent = async (eventName: string) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('event_name', eventName)
    .order('id', { ascending: false })

  if (error) {
    console.error('Error fetching members:', error)
    return []
  }
  return data
}

export const createMember = async (member: {
  entry_name: string
  event_name: string
  handler_name: string
  cock_type: string
  number_of_entries: number
  registration_date: string
}) => {
  const { data, error } = await supabase
    .from('members')
    .insert([member])
    .select()

  if (error) {
    console.error('Error creating member:', error)
    throw error
  }
  return data[0]
}

export const createMultipleMembers = async (members: Array<{
  entry_name: string
  event_name: string
  handler_name: string
  cock_type: string
  number_of_entries: number
  registration_date: string
}>) => {
  const { data, error } = await supabase
    .from('members')
    .insert(members)
    .select()

  if (error) {
    console.error('Error creating multiple members:', error)
    throw error
  }
  return data
}

export const updateMembersByEventName = async (
  oldEventName: string,
  newEventName: string
) => {
  if (oldEventName === newEventName) {
    return []
  }

  const candidateOldNames = Array.from(new Set([oldEventName, oldEventName.trim()]))
  const updatedRows: Array<{ id: number }> = []

  for (const candidateOldName of candidateOldNames) {
    if (!candidateOldName) {
      continue
    }

    const { data, error } = await supabase
      .from('members')
      .update({ event_name: newEventName })
      .eq('event_name', candidateOldName)
      .select('id')

    if (error) {
      console.error('Error updating members event name:', error)
      throw error
    }

    if (data) {
      updatedRows.push(...data)
    }
  }

  return updatedRows
}

// ===== PAIRINGS =====
export const getPairings = async () => {
  const { data, error } = await supabase
    .from('pairings')
    .select('*')
    .order('fight_number', { ascending: false })

  if (error) {
    console.error('Error fetching pairings:', error)
    return []
  }
  return data
}

export const getPairingsByEvent = async (eventId: number) => {
  const { data, error } = await supabase
    .from('pairings')
    .select('*')
    .eq('event_id', eventId)
    .order('fight_number', { ascending: false })

  if (error) {
    console.error('Error fetching pairings:', error)
    return []
  }
  return data
}

export const createPairing = async (pairing: {
  event_id: number
  fight_number: number
  sultada_number: string
  mayron_entry_id: number
  mayron_handler: string
  mayron_weight: string
  mayron_betting: string
  wala_entry_id: number
  wala_handler: string
  wala_weight: string
  wala_betting: string
  diferencia: string
  parada_amount?: number
}) => {
  const { data, error } = await supabase
    .from('pairings')
    .insert([pairing])
    .select()

  if (error) {
    console.error('Error creating pairing:', error)
    throw error
  }
  return data[0]
}

export const updatePairingsByEventId = async (
  oldEventId: number,
  newEventId: number
) => {
  if (oldEventId === newEventId) {
    return []
  }

  const { data, error } = await supabase
    .from('pairings')
    .update({ event_id: newEventId })
    .eq('event_id', oldEventId)
    .select('id')

  if (error) {
    console.error('Error updating pairings event id:', error)
    throw error
  }

  return data || []
}

// ===== TAGGED FIGHTS =====
export const getTaggedFights = async () => {
  const { data, error } = await supabase
    .from('tagged_fights')
    .select('*')

  if (error) {
    console.error('Error fetching tagged fights:', error)
    return []
  }
  return data
}

export const updateTaggedFight = async (
  pairingId: number,
  updates: {
    status?: string
    outcome?: string
    outcome_winner?: string
  }
) => {
  const { data, error } = await supabase
    .from('tagged_fights')
    .update(updates)
    .eq('pairing_id', pairingId)
    .select()

  if (error) {
    console.error('Error updating tagged fight:', error)
    throw error
  }
  return data
}

export const createTaggedFight = async (fight: {
  pairing_id: number
  fight_number: number
  status: string
  outcome?: string
  outcome_winner?: string
}) => {
  const { data, error } = await supabase
    .from('tagged_fights')
    .insert([fight])
    .select()

  if (error) {
    console.error('Error creating tagged fight:', error)
    throw error
  }
  return data[0]
}

// ===== RELEASED FIGHTS =====
export const getReleasedFights = async () => {
  const { data, error } = await supabase
    .from('released_fights')
    .select('*')

  if (error) {
    console.error('Error fetching released fights:', error)
    return []
  }
  return data
}

export const updateReleasedFight = async (
  pairingId: number,
  releaseStatus: string
) => {
  const { data, error } = await supabase
    .from('released_fights')
    .update({
      release_status: releaseStatus,
      released_at: releaseStatus === 'released' ? new Date().toISOString() : null,
    })
    .eq('pairing_id', pairingId)
    .select()

  if (error) {
    console.error('Error updating released fight:', error)
    throw error
  }
  return data
}

export const createReleasedFight = async (fight: {
  pairing_id: number
  release_status: string
}) => {
  const { data, error } = await supabase
    .from('released_fights')
    .insert([fight])
    .select()

  if (error) {
    console.error('Error creating released fight:', error)
    throw error
  }
  return data[0]
}

// ===== RAFFLE WINNERS =====
export const getRaffleWinners = async () => {
  const { data, error } = await supabase
    .from('raffle_winners')
    .select('*')
    .order('drawn_at', { ascending: false })

  if (error) {
    console.error('Error fetching raffle winners:', error)
    return []
  }
  return data
}

export const createRaffleWinner = async (winner: {
  ticket_number: string
  participant_name: string
  entry_name: string
  event_name: string
  drawn_at: string
}) => {
  const { data, error } = await supabase
    .from('raffle_winners')
    .insert([winner])
    .select()

  if (error) {
    console.error('Error creating raffle winner:', error)
    throw error
  }
  return data[0]
}

export const updateRaffleWinnersByEventName = async (
  oldEventName: string,
  newEventName: string
) => {
  if (oldEventName === newEventName) {
    return []
  }

  const candidateOldNames = Array.from(new Set([oldEventName, oldEventName.trim()]))
  const updatedRows: Array<{ id: number }> = []

  for (const candidateOldName of candidateOldNames) {
    if (!candidateOldName) {
      continue
    }

    const { data, error } = await supabase
      .from('raffle_winners')
      .update({ event_name: newEventName })
      .eq('event_name', candidateOldName)
      .select('id')

    if (error) {
      console.error('Error updating raffle winners event name:', error)
      throw error
    }

    if (data) {
      updatedRows.push(...data)
    }
  }

  return updatedRows
}
