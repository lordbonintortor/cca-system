import './Events.css'
import { useState, useMemo } from 'react'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

const EVENTS_DATA: Event[] = [
  { id: 1, name: 'Spring Derby Championship', type: 'Championship', derbyInfo: 'Senior Division', date: '2026-05-15' },
  { id: 2, name: 'Weekend Cockpit Battle', type: 'Regular', derbyInfo: 'Open Division', date: '2026-05-20' },
  { id: 3, name: 'Summer Grand Event', type: 'Premium', derbyInfo: 'All Divisions', date: '2026-06-10' },
  { id: 4, name: 'Rookie Training Match', type: 'Training', derbyInfo: 'Beginners Only', date: '2026-05-25' },
  { id: 5, name: 'Inter-Region Challenge', type: 'Championship', derbyInfo: 'Regional Qualifiers', date: '2026-06-15' },
  { id: 6, name: 'Youth Division Tournament', type: 'Regular', derbyInfo: 'Youth Only', date: '2026-07-02' },
  { id: 7, name: 'National Championships', type: 'Championship', derbyInfo: 'All Divisions', date: '2026-07-10' },
  { id: 8, name: 'Exhibition Match', type: 'Premium', derbyInfo: 'Featured Fighters', date: '2026-07-15' },
  { id: 9, name: 'Regional Qualifier Round 1', type: 'Championship', derbyInfo: 'Regional Divisions', date: '2026-07-20' },
  { id: 10, name: 'Friendly Match Series', type: 'Regular', derbyInfo: 'Mixed Divisions', date: '2026-07-25' },
  { id: 11, name: 'Fall Classic Derby', type: 'Premium', derbyInfo: 'Senior Division', date: '2026-08-05' },
  { id: 12, name: 'State Championship Finals', type: 'Championship', derbyInfo: 'State Qualifiers', date: '2026-08-15' },
  { id: 13, name: 'Beginner Fundamentals', type: 'Training', derbyInfo: 'New Players', date: '2026-08-20' },
  { id: 14, name: 'Inter-Club Challenge', type: 'Regular', derbyInfo: 'Club Representatives', date: '2026-08-28' },
  { id: 15, name: 'Season Finale Bash', type: 'Premium', derbyInfo: 'All Divisions', date: '2026-09-10' },
]

function Events() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventName, setEventName] = useState('')
  const itemsPerPage = 5

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleAddEvent = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEventName('')
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

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Events</h1>
        <p>Manage your events here</p>
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
          <button className="btn-add-event" onClick={handleAddEvent}>+ Add New Event</button>
        </div>
        <div className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Event Type</th>
                <th>Derby Information</th>
                <th>Event Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{event.type}</td>
                  <td>{event.derbyInfo}</td>
                  <td>{formatDate(event.date)}</td>
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
              <h2>Add New Event</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="eventName">Event Name <span className="required-asterisk">*</span></label>
                <input
                  id="eventName"
                  type="text"
                  className="form-input"
                  placeholder="Enter event name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-add">Add</button>
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

export default Events
