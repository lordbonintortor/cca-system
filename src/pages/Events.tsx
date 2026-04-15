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
]

function Events() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return EVENTS_DATA
    return EVENTS_DATA.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.derbyInfo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

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
          <button className="btn-add-event">+ Add New Event</button>
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
              {filteredEvents.map((event) => (
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
            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <span className="page-info">{currentPage}</span>
            <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Events
