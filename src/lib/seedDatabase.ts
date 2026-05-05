import {
  createEvent,
  createMember,
  getEvents,
} from './supabaseService'

// Sample data - empty by default
type SeedEvent = {
  name: string
  type: string
  derbyInfo: string
  date: string
}

type SeedMember = {
  entryName: string
  eventName: string
  numberOfEntries: number
  registrationDate: string
}

const INITIAL_EVENTS: SeedEvent[] = []

const INITIAL_MEMBERS: SeedMember[] = []

export const seedDatabase = async () => {
  try {
    console.log('Checking if database needs seeding...')

    // Check if events already exist
    const existingEvents = await getEvents()
    if (existingEvents && existingEvents.length > 0) {
      console.log('Database already seeded, skipping...')
      return
    }

    console.log('Seeding events...')
    const createdEvents: Record<string, number> = {}

    for (const event of INITIAL_EVENTS) {
      const created = await createEvent({
        name: event.name,
        type: event.type,
        derby_info: event.derbyInfo,
        date: event.date,
      })
      createdEvents[event.name] = created.id
      console.log(`✓ Created event: ${event.name}`)
    }

    console.log('Seeding members...')
    for (const member of INITIAL_MEMBERS) {
      await createMember({
        entry_name: member.entryName,
        event_name: member.eventName,
        number_of_entries: member.numberOfEntries,
        registration_date: member.registrationDate,
      })
    }
    console.log(`✓ Created ${INITIAL_MEMBERS.length} members`)

    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
