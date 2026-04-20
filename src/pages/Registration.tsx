import './Registration.css'
import { useState, useMemo } from 'react'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

interface RegistrationData {
  id: string
  eventId: number
  eventName: string
  entryName: string
  handlerName: string
  numberOfEntries: string
  addedDate: string
}

const EVENTS_DATA: Event[] = [
  { id: 1, name: 'Spring Derby Championship', type: 'Championship', derbyInfo: 'Senior Division', date: '2026-03-15' },
  { id: 2, name: 'Weekend Cockpit Battle', type: 'Regular', derbyInfo: 'Open Division', date: '2026-02-20' },
  { id: 3, name: 'Summer Grand Event', type: 'Premium', derbyInfo: 'All Divisions', date: '2026-06-10' },
  { id: 4, name: 'Rookie Training Match', type: 'Training', derbyInfo: 'Beginners Only', date: '2026-01-25' },
  { id: 5, name: 'Inter-Region Challenge', type: 'Championship', derbyInfo: 'Regional Qualifiers', date: '2026-06-15' },
  { id: 6, name: 'Youth Division Tournament', type: 'Regular', derbyInfo: 'Youth Only', date: '2026-07-02' },
  { id: 7, name: 'National Championships', type: 'Championship', derbyInfo: 'All Divisions', date: '2026-07-10' },
  { id: 8, name: 'Exhibition Match', type: 'Premium', derbyInfo: 'Featured Fighters', date: '2026-02-15' },
  { id: 9, name: 'Regional Qualifier Round 1', type: 'Championship', derbyInfo: 'Regional Divisions', date: '2026-07-20' },
  { id: 10, name: 'Friendly Match Series', type: 'Regular', derbyInfo: 'Mixed Divisions', date: '2026-07-25' },
  { id: 11, name: 'Fall Classic Derby', type: 'Premium', derbyInfo: 'Senior Division', date: '2026-08-05' },
  { id: 12, name: 'State Championship Finals', type: 'Championship', derbyInfo: 'State Qualifiers', date: '2026-08-15' },
  { id: 13, name: 'Beginner Fundamentals', type: 'Training', derbyInfo: 'New Players', date: '2026-08-20' },
  { id: 14, name: 'Inter-Club Challenge', type: 'Regular', derbyInfo: 'Club Representatives', date: '2026-08-28' },
  { id: 15, name: 'Season Finale Bash', type: 'Premium', derbyInfo: 'All Divisions', date: '2026-09-10' },
]

function Registration() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [entryName, setEntryName] = useState('')
  const [handlerName, setHandlerName] = useState('')
  const [numberOfEntries, setNumberOfEntries] = useState('')
  const [registrations, setRegistrations] = useState<RegistrationData[]>([])
  const itemsPerPage = 5

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const isEventPassed = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  }

  const handleRegisterClick = (eventId: number) => {
    setSelectedEventId(eventId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEntryName('')
    setHandlerName('')
    setNumberOfEntries('')
    setSelectedEventId(null)
  }

  const handleSubmitRegistration = () => {
    if (!entryName || !handlerName || !numberOfEntries || !selectedEventId) {
      alert('Please fill out all fields')
      return
    }

    const selectedEvent = EVENTS_DATA.find((event) => event.id === selectedEventId)
    if (!selectedEvent) return

    const newRegistration: RegistrationData = {
      id: Date.now().toString(),
      eventId: selectedEventId,
      eventName: selectedEvent.name,
      entryName,
      handlerName,
      numberOfEntries,
      addedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }

    setRegistrations([...registrations, newRegistration])
    handleCloseModal()
  }

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return EVENTS_DATA
    return EVENTS_DATA.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.derbyInfo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const paginatedEvents = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return filteredEvents.slice(startIdx, endIdx)
  }, [filteredEvents, currentPage])

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)

  const selectedEvent = EVENTS_DATA.find((event) => event.id === selectedEventId)

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Registration</h1>
        <p>Register participants for events</p>
        <div className="search-action-row">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>
        </div>
        <div className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Event Type</th>
                <th>Hack Fight Info</th>
                <th>Event Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.type}</td>
                  <td>{event.derbyInfo}</td>
                  <td>{formatDate(event.date)}</td>
                  <td>
                    <button 
                      className="btn-register"
                      onClick={() => handleRegisterClick(event.id)}
                      disabled={isEventPassed(event.date)}
                      title={isEventPassed(event.date) ? 'Event date has passed' : 'Register for this event'}
                    >
                      {isEventPassed(event.date) ? 'Expired' : 'Register'}
                    </button>
                  </td>
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

        {registrations.length > 0 && (
          <>
            {/* Registered Entries - Upcoming Events */}
            {EVENTS_DATA.filter(event => 
              registrations.some(reg => reg.eventId === event.id) && !isEventPassed(event.date)
            ).length > 0 && (
              <div className="registrations-section">
                <h2>Registered Entries</h2>
                {EVENTS_DATA.filter(event => 
                  registrations.some(reg => reg.eventId === event.id) && !isEventPassed(event.date)
                ).map((event) => {
                  const eventRegistrations = registrations.filter(reg => reg.eventId === event.id)
                  return (
                    <div key={event.id} className="event-registrations">
                      <h3>{event.name}</h3>
                      <div className="registrations-table-wrapper">
                        <table className="registrations-table">
                          <thead>
                            <tr>
                              <th>Entry Name</th>
                              <th>Handler Name</th>
                              <th>Number of Entries</th>
                              <th>Added Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventRegistrations.map((registration) => (
                              <tr key={registration.id}>
                                <td>{registration.entryName}</td>
                                <td>{registration.handlerName}</td>
                                <td>{registration.numberOfEntries}</td>
                                <td>{registration.addedDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Past Event Registrations - Expired Events */}
            {EVENTS_DATA.filter(event => 
              registrations.some(reg => reg.eventId === event.id) && isEventPassed(event.date)
            ).length > 0 && (
              <div className="past-registrations-section">
                <h2>Past Event Registrations</h2>
                {EVENTS_DATA.filter(event => 
                  registrations.some(reg => reg.eventId === event.id) && isEventPassed(event.date)
                ).map((event) => {
                  const eventRegistrations = registrations.filter(reg => reg.eventId === event.id)
                  return (
                    <div key={event.id} className="event-registrations past-event-registrations">
                      <h3>{event.name} <span className="closed-badge">CLOSED</span></h3>
                      <div className="registrations-table-wrapper">
                        <table className="registrations-table">
                          <thead>
                            <tr>
                              <th>Entry Name</th>
                              <th>Handler Name</th>
                              <th>Number of Entries</th>
                              <th>Added Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventRegistrations.map((registration) => (
                              <tr key={registration.id}>
                                <td>{registration.entryName}</td>
                                <td>{registration.handlerName}</td>
                                <td>{registration.numberOfEntries}</td>
                                <td>{registration.addedDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Register for Event</h2>
              <p className="event-title">{selectedEvent.name}</p>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Entry Name
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter entry name"
                  value={entryName}
                  onChange={(e) => setEntryName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  Handler Name
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter handler name"
                  value={handlerName}
                  onChange={(e) => setHandlerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  Number of Entries
                  <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter number of entries"
                  value={numberOfEntries}
                  onChange={(e) => setNumberOfEntries(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-add" onClick={handleSubmitRegistration}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Registration

