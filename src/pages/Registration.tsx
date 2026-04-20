import './Registration.css'
import { useState, useMemo } from 'react'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

interface Member {
  id: number
  entryName: string
  eventName: string
  handlerName: string
  cockType: string
  numberOfEntries: number
  registrationDate: string
}

const INITIAL_EVENTS: Event[] = [
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

const INITIAL_MEMBERS: Member[] = [
  { id: 1, entryName: 'Juan Dela Cruz', eventName: 'Monday Night Match', handlerName: 'Carlos Santos', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 2, entryName: 'Maria Garcia', eventName: 'Weekend Championship', handlerName: 'Pedro Ramirez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 3, entryName: 'Antonio Reyes', eventName: 'Local Tournament', handlerName: 'Miguel Torres', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 4, entryName: 'Rosa Lopez', eventName: 'Spring Classic Derby', handlerName: 'Juan Mendoza', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 5, entryName: 'Francisco Diaz', eventName: 'Inter-Club Battle', handlerName: 'Luis Fernandez', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 6, entryName: 'Angela Morales', eventName: 'Regional Qualifier', handlerName: 'Ricardo Gutierrez', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 7, entryName: 'Roberto Flores', eventName: 'Friendly Match Series', handlerName: 'Daniel Navarro', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 8, entryName: 'Elena Castillo', eventName: 'Championship Round', handlerName: 'Eduardo Vargas', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 9, entryName: 'Javier Romero', eventName: 'Rising Stars Tournament', handlerName: 'Fernando Ortiz', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 10, entryName: 'Carmen Rodriguez', eventName: 'Elite Division Match', handlerName: 'Guillermo Castro', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 11, entryName: 'Manuel Santos', eventName: 'April Opener', handlerName: 'Hector Moreno', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 12, entryName: 'Lucia Hernandez', eventName: 'Grand Festival Battle', handlerName: 'Ignacio Ruiz', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 13, entryName: 'Raúl Perez', eventName: 'Provincial Challenge', handlerName: 'Javier Molina', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 14, entryName: 'Isabel Martinez', eventName: 'Spring Warmup Series', handlerName: 'Karlo Fontanar', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 15, entryName: 'Diego Sanchez', eventName: 'National Preliminaries', handlerName: 'Luis Pacabay', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
]

function Registration() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entryName, setEntryName] = useState('')
  const [eventName, setEventName] = useState('')
  const [handlerName, setHandlerName] = useState('')
  const [cockType, setCockType] = useState('Stag')
  const [numberOfEntries, setNumberOfEntries] = useState('')
  const [registrationDate, setRegistrationDate] = useState('')
  const itemsPerPage = 10

  // Sort events so newest (most recent dates) are at the top
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleRegisterMember = () => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setRegistrationDate(formattedDate)
    // Set event name to the newest event
    if (sortedEvents.length > 0) {
      setEventName(sortedEvents[0].name)
      // Extract cock type from the newest event's derbyInfo
      const cockTypeFromEvent = sortedEvents[0].derbyInfo.split(' - ')[0]
      setCockType(cockTypeFromEvent)
    }
    setIsModalOpen(true)
  }

  const handleEventChange = (selectedEventName: string) => {
    setEventName(selectedEventName)
    // Find the event and extract cock type from derbyInfo
    const selectedEvent = events.find(e => e.name === selectedEventName)
    if (selectedEvent) {
      const cockTypeFromEvent = selectedEvent.derbyInfo.split(' - ')[0]
      setCockType(cockTypeFromEvent)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEntryName('')
    setEventName('')
    setHandlerName('')
    setCockType('Stag')
    setNumberOfEntries('')
    setRegistrationDate('')
  }

  const handleSaveMember = () => {
    if (!entryName.trim() || !eventName.trim() || !handlerName.trim() || !numberOfEntries || !registrationDate) {
      alert('Please fill in all required fields')
      return
    }

    const numEntries = parseInt(numberOfEntries)
    const newMembers: Member[] = []

    // Create multiple member records based on number of entries
    for (let i = 1; i <= numEntries; i++) {
      const newMember: Member = {
        id: Math.max(...members.map(m => m.id), 0) + i,
        entryName: `${entryName} - Entry ${i}`,
        eventName,
        handlerName,
        cockType,
        numberOfEntries: 1,
        registrationDate,
      }
      newMembers.push(newMember)
    }

    setMembers([...newMembers, ...members])
    handleCloseModal()
  }

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members
    return members.filter((member) =>
      member.entryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.handlerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, members])

  const paginatedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return filteredMembers.slice(startIdx, endIdx)
  }, [filteredMembers, currentPage])

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Registration</h1>
        <p>Manage member registrations</p>
        <div className="search-action-row">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>
          <button className="btn-add-event" onClick={handleRegisterMember}>+ Register Member</button>
        </div>
        <div className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Entry Name</th>
                <th>Event Name</th>
                <th>Handler Name</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.entryName}</td>
                  <td>{member.eventName}</td>
                  <td>{member.handlerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-number-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register Member</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="entryName">Entry Name <span className="required-asterisk">*</span></label>
                  <input
                    id="entryName"
                    type="text"
                    className="form-input"
                    placeholder="Enter entry name"
                    value={entryName}
                    onChange={(e) => setEntryName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="eventName">Event Name <span className="required-asterisk">*</span></label>
                  <select
                    id="eventName"
                    className="form-input"
                    value={eventName}
                    onChange={(e) => handleEventChange(e.target.value)}
                    required
                  >
                    <option value="">Select an event</option>
                    {sortedEvents.map((event) => (
                      <option key={event.id} value={event.name}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="handlerName">Handler Name <span className="required-asterisk">*</span></label>
                <input
                  id="handlerName"
                  type="text"
                  className="form-input"
                  placeholder="Enter handler name"
                  value={handlerName}
                  onChange={(e) => setHandlerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cockType">Cock Type <span className="required-asterisk">*</span></label>
                <input
                  id="cockType"
                  type="text"
                  className="form-input"
                  value={cockType}
                  disabled
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="numberOfEntries">No. of Entries <span className="required-asterisk">*</span></label>
                <input
                  id="numberOfEntries"
                  type="number"
                  className="form-input"
                  placeholder="Enter number of entries"
                  value={numberOfEntries}
                  onChange={(e) => setNumberOfEntries(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="registrationDate">Registration Date <span className="required-asterisk">*</span></label>
                <input
                  id="registrationDate"
                  type="date"
                  className="form-input"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-add" onClick={handleSaveMember}>Register</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Registration

