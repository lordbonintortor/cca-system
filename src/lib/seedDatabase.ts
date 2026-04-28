import {
  createEvent,
  createMember,
  getEvents,
} from './supabaseService'

// Sample data (from your INITIAL constants)
const INITIAL_EVENTS = [
  { id: 1, name: 'Monday Night Match', type: 'Hack Fight', derbyInfo: 'Stag - 2 per Entry (45-50 lbs)', date: '2026-04-20' },
  { id: 2, name: 'Weekend Championship', type: 'Hack Fight', derbyInfo: 'Bullstag - 3 per Entry (55-65 lbs)', date: '2026-04-19' },
  { id: 3, name: 'Local Tournament', type: 'Hack Fight', derbyInfo: 'Cock - 2 per Entry (70-80 lbs)', date: '2026-04-18' },
  { id: 4, name: 'Spring Classic Derby', type: 'Hack Fight', derbyInfo: 'Stag / Bullstag - 4 per Entry (50-60 lbs)', date: '2026-04-17' },
  { id: 5, name: 'Inter-Club Battle', type: 'Hack Fight', derbyInfo: 'Bullstag - 2 per Entry (60-75 lbs)', date: '2026-04-16' },
  { id: 6, name: 'Regional Qualifier', type: 'Hack Fight', derbyInfo: 'Cock - 3 per Entry (75-90 lbs)', date: '2026-04-15' },
  { id: 7, name: 'Friendly Match Series', type: 'Hack Fight', derbyInfo: 'Stag - 3 per Entry (40-55 lbs)', date: '2026-04-14' },
  { id: 8, name: 'Championship Round', type: 'Hack Fight', derbyInfo: 'Bullstag / Cock - 2 per Entry (65-80 lbs)', date: '2026-04-13' },
  { id: 9, name: 'Rising Stars Tournament', type: 'Hack Fight', derbyInfo: 'Stag - 4 per Entry (35-50 lbs)', date: '2026-04-12' },
  { id: 10, name: 'Elite Division Match', type: 'Hack Fight', derbyInfo: 'Cock - 2 per Entry (80-95 lbs)', date: '2026-04-11' },
  { id: 11, name: 'April Opener', type: 'Hack Fight', derbyInfo: 'Stag / Bullstag - 3 per Entry (48-62 lbs)', date: '2026-04-10' },
  { id: 12, name: 'Grand Festival Battle', type: 'Hack Fight', derbyInfo: 'Bullstag - 3 per Entry (58-72 lbs)', date: '2026-04-09' },
  { id: 13, name: 'Provincial Challenge', type: 'Hack Fight', derbyInfo: 'Cock - 4 per Entry (72-88 lbs)', date: '2026-04-08' },
  { id: 14, name: 'Spring Warmup Series', type: 'Hack Fight', derbyInfo: 'Stag - 2 per Entry (42-58 lbs)', date: '2026-04-07' },
  { id: 15, name: 'National Preliminaries', type: 'Hack Fight', derbyInfo: 'Bullstag / Cock - 3 per Entry (60-78 lbs)', date: '2026-04-06' },
]

const INITIAL_MEMBERS = [
  { id: 1, entryName: 'Juan Dela Cruz', eventName: 'Monday Night Match', handlerName: 'Carlos Santos', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 2, entryName: 'Maria Garcia', eventName: 'Monday Night Match', handlerName: 'Pedro Ramirez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 3, entryName: 'Antonio Reyes', eventName: 'Monday Night Match', handlerName: 'Miguel Torres', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 4, entryName: 'Rosa Lopez', eventName: 'Monday Night Match', handlerName: 'Juan Mendoza', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 5, entryName: 'Francisco Diaz', eventName: 'Weekend Championship', handlerName: 'Luis Fernandez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 6, entryName: 'Angela Morales', eventName: 'Weekend Championship', handlerName: 'Ricardo Gutierrez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 7, entryName: 'Roberto Flores', eventName: 'Weekend Championship', handlerName: 'Daniel Navarro', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 8, entryName: 'Elena Castillo', eventName: 'Weekend Championship', handlerName: 'Eduardo Vargas', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 9, entryName: 'Javier Romero', eventName: 'Weekend Championship', handlerName: 'Fernando Ortiz', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 10, entryName: 'Carmen Rodriguez', eventName: 'Local Tournament', handlerName: 'Guillermo Castro', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 11, entryName: 'Manuel Santos', eventName: 'Local Tournament', handlerName: 'Hector Moreno', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 12, entryName: 'Lucia Hernandez', eventName: 'Local Tournament', handlerName: 'Ignacio Ruiz', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 13, entryName: 'Raúl Perez', eventName: 'Spring Classic Derby', handlerName: 'Javier Molina', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 14, entryName: 'Isabel Martinez', eventName: 'Spring Classic Derby', handlerName: 'Karlo Fontanar', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 15, entryName: 'Diego Sanchez', eventName: 'Spring Classic Derby', handlerName: 'Luis Pacabay', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 16, entryName: 'Alfredo Reyes', eventName: 'Spring Classic Derby', handlerName: 'Marco Villareal', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 17, entryName: 'Vicente Gonzales', eventName: 'Inter-Club Battle', handlerName: 'Benigno Torres', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 18, entryName: 'Benito Reyes', eventName: 'Inter-Club Battle', handlerName: 'Amadeo Santos', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 19, entryName: 'Gina Lopez', eventName: 'Inter-Club Battle', handlerName: 'Damian Flores', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 20, entryName: 'Hector Cruz', eventName: 'Regional Qualifier', handlerName: 'Ernesto Vargas', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 21, entryName: 'Iris Martinez', eventName: 'Regional Qualifier', handlerName: 'Frederic Ortiz', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 22, entryName: 'Jasper Torres', eventName: 'Regional Qualifier', handlerName: 'Gregory Ruiz', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 23, entryName: 'Karen Diaz', eventName: 'Regional Qualifier', handlerName: 'Harold Castro', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 24, entryName: 'Leo Fernandez', eventName: 'Friendly Match Series', handlerName: 'Ivan Navarro', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 25, entryName: 'Monica Garcia', eventName: 'Friendly Match Series', handlerName: 'Julio Moreno', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 26, entryName: 'Nicolas Ramirez', eventName: 'Friendly Match Series', handlerName: 'Kevin Gutierrez', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 27, entryName: 'Olivia Santos', eventName: 'Championship Round', handlerName: 'Luis Molina', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 28, entryName: 'Pablo Reyes', eventName: 'Championship Round', handlerName: 'Marco Fontanar', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 29, entryName: 'Quintin Lopez', eventName: 'Championship Round', handlerName: 'Napoleon Pacabay', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 30, entryName: 'Rita Flores', eventName: 'Championship Round', handlerName: 'Oscar Villareal', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 31, entryName: 'Samuel Cruz', eventName: 'Rising Stars Tournament', handlerName: 'Pablo Torres', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 32, entryName: 'Teresa Martinez', eventName: 'Rising Stars Tournament', handlerName: 'Quentin Reyes', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 33, entryName: 'Ulises Gonzales', eventName: 'Rising Stars Tournament', handlerName: 'Rodolfo Santos', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 34, entryName: 'Vanessa Rodriguez', eventName: 'Rising Stars Tournament', handlerName: 'Salvador Garcia', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 35, entryName: 'Walter Diaz', eventName: 'Elite Division Match', handlerName: 'Tomas Ramirez', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 36, entryName: 'Ximena Lopez', eventName: 'Elite Division Match', handlerName: 'Ulysses Fernandez', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 37, entryName: 'Yolanda Flores', eventName: 'Elite Division Match', handlerName: 'Valerian Navarro', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 38, entryName: 'Zane Castillo', eventName: 'April Opener', handlerName: 'Walter Vargas', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 39, entryName: 'Aurora Santos', eventName: 'April Opener', handlerName: 'Xavier Ortiz', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 40, entryName: 'Brenno Reyes', eventName: 'April Opener', handlerName: 'Yusuf Moreno', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 41, entryName: 'Ciara Martinez', eventName: 'Grand Festival Battle', handlerName: 'Zacharias Gutierrez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 42, entryName: 'Damien Garcia', eventName: 'Grand Festival Battle', handlerName: 'Abelardo Molina', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 43, entryName: 'Emilia Lopez', eventName: 'Grand Festival Battle', handlerName: 'Baltazar Fontanar', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 44, entryName: 'Fabio Diaz', eventName: 'Grand Festival Battle', handlerName: 'Camillo Pacabay', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 45, entryName: 'Gloria Fernandez', eventName: 'Provincial Challenge', handlerName: 'Dorian Villareal', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 46, entryName: 'Hernando Reyes', eventName: 'Provincial Challenge', handlerName: 'Efrain Torres', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 47, entryName: 'Iris Gonzales', eventName: 'Provincial Challenge', handlerName: 'Faustino Reyes', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 48, entryName: 'Jacobo Santos', eventName: 'Provincial Challenge', handlerName: 'Gaudencio Santos', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 49, entryName: 'Karla Flores', eventName: 'Spring Warmup Series', handlerName: 'Hilario Garcia', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 50, entryName: 'Lorenzo Martinez', eventName: 'Spring Warmup Series', handlerName: 'Isidro Fernandez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 51, entryName: 'Mariana Lopez', eventName: 'Spring Warmup Series', handlerName: 'Jacinto Fernandez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 52, entryName: 'Norberto Reyes', eventName: 'National Preliminaries', handlerName: 'Kirkland Navarro', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
  { id: 53, entryName: 'Ornella Garcia', eventName: 'National Preliminaries', handlerName: 'Lamberto Vargas', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
  { id: 54, entryName: 'Paco Diaz', eventName: 'National Preliminaries', handlerName: 'Magno Ortiz', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
]

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
    const createdEvents: any = {}

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
        handler_name: member.handlerName,
        cock_type: member.cockType,
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
