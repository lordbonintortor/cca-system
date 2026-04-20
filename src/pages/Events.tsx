import './Events.css'
import { useState, useMemo } from 'react'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

const INITIAL_EVENTS: Event[] = [
  { id: 1, name: 'Monday Night Match', type: 'Hack Fight', derbyInfo: 'Stag - 2 per Entry (45-50 lbs)', date: '2026-04-20' },
  { id: 2, name: 'Weekend Championship', type: 'Hack Fight', derbyInfo: 'Bullstag - 3 per Entry (55-65 lbs)', date: '2026-04-21' },
  { id: 3, name: 'Local Tournament', type: 'Hack Fight', derbyInfo: 'Cock - 2 per Entry (70-80 lbs)', date: '2026-04-22' },
]

function Events() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('Hack Fight')
  const [hackFightType, setHackFightType] = useState('Stag')
  const [weightRangeMin, setWeightRangeMin] = useState('')
  const [weightRangeMax, setWeightRangeMax] = useState('')
  const [noPerEntry, setNoPerEntry] = useState('')
  const [eventDate, setEventDate] = useState('')
  const itemsPerPage = 10

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleAddEvent = () => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setEventDate(formattedDate)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEventName('')
    setEventType('Hack Fight')
    setHackFightType('Stag')
    setWeightRangeMin('')
    setWeightRangeMax('')
    setNoPerEntry('')
    setEventDate('')
  }

  const handleSaveEvent = () => {
    if (!eventName.trim() || !weightRangeMin || !weightRangeMax || !noPerEntry || !eventDate) {
      alert('Please fill in all required fields')
      return
    }

    const newEvent: Event = {
      id: Math.max(...events.map(e => e.id), 0) + 1,
      name: eventName,
      type: eventType,
      derbyInfo: `${hackFightType} - ${noPerEntry} per Entry (${weightRangeMin}-${weightRangeMax} lbs)`,
      date: eventDate,
    }

    setEvents([newEvent, ...events])
    handleCloseModal()
  }

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events
    return events.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.derbyInfo.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, events])

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
                <th>Hack Fight Info</th>
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
              <div className="form-row">
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
                <div className="form-group">
                  <label htmlFor="eventType">Event Type</label>
                  <input
                    id="eventType"
                    type="text"
                    className="form-input"
                    value={eventType}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="hackFightType">Type of Hack Fight <span className="required-asterisk">*</span></label>
                <select
                  id="hackFightType"
                  className="form-input"
                  value={hackFightType}
                  onChange={(e) => setHackFightType(e.target.value)}
                >
                  <option value="Stag">Stag</option>
                  <option value="Bullstag">Bullstag</option>
                  <option value="Cock">Cock</option>
                  <option value="Stag / Bullstag">Stag / Bullstag</option>
                  <option value="Bullstag / Cock">Bullstag / Cock</option>
                </select>
              </div>
              <div className="form-group">
                <label>Weight Range: <span className="required-asterisk">*</span></label>
                <div className="weight-range-container">
                  <input
                    type="number"
                    className="form-input form-input-weight"
                    placeholder=""
                    value={weightRangeMin}
                    onChange={(e) => setWeightRangeMin(e.target.value)}
                  />
                  <span className="weight-separator">-</span>
                  <input
                    type="number"
                    className="form-input form-input-weight"
                    placeholder=""
                    value={weightRangeMax}
                    onChange={(e) => setWeightRangeMax(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="noPerEntry">No. of (Stag/Bullstag/Cock) per Entry <span className="required-asterisk">*</span></label>
                <input
                  id="noPerEntry"
                  type="number"
                  className="form-input"
                  placeholder="Enter number"
                  value={noPerEntry}
                  onChange={(e) => setNoPerEntry(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="eventDate">Event Date <span className="required-asterisk">*</span></label>
                <input
                  id="eventDate"
                  type="date"
                  className="form-input"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-add" onClick={handleSaveEvent}>Add</button>
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
