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

function Events() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('Hack Fight')
  const [hackFightType, setHackFightType] = useState('Stag')
  const [weightRangeMin, setWeightRangeMin] = useState('')
  const [weightRangeMax, setWeightRangeMax] = useState('')
  const [noPerEntry, setNoPerEntry] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingEvent, setPendingEvent] = useState<Event | null>(null)
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
    setIsEditMode(false)
    setEditingEventId(null)
    setEventName('')
    setEventType('Hack Fight')
    setHackFightType('Stag')
    setWeightRangeMin('')
    setWeightRangeMax('')
    setNoPerEntry('')
    setEventDate('')
  }

  const handleEditEvent = (event: Event) => {
    const derbyInfoParts = event.derbyInfo.match(/(.*?) - (\d+) per Entry \((\d+)-(\d+) lbs\)/)
    if (derbyInfoParts) {
      setHackFightType(derbyInfoParts[1])
      setNoPerEntry(derbyInfoParts[2])
      setWeightRangeMin(derbyInfoParts[3])
      setWeightRangeMax(derbyInfoParts[4])
    }
    setEventName(event.name)
    setEventDate(event.date)
    setEditingEventId(event.id)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    if (!eventName.trim() || !weightRangeMin || !weightRangeMax || !noPerEntry || !eventDate) {
      alert('Please fill in all required fields')
      return
    }

    if (isEditMode && editingEventId) {
      const updatedEvent: Event = {
        id: editingEventId,
        name: eventName,
        type: eventType,
        derbyInfo: `${hackFightType} - ${noPerEntry} per Entry (${weightRangeMin}-${weightRangeMax} lbs)`,
        date: eventDate,
      }
      setPendingEvent(updatedEvent)
    } else {
      const newEvent: Event = {
        id: Math.max(...events.map(e => e.id), 0) + 1,
        name: eventName,
        type: eventType,
        derbyInfo: `${hackFightType} - ${noPerEntry} per Entry (${weightRangeMin}-${weightRangeMax} lbs)`,
        date: eventDate,
      }
      setPendingEvent(newEvent)
    }
    setShowConfirmation(true)
  }

  const handleConfirmEvent = () => {
    if (pendingEvent) {
      if (isEditMode && editingEventId) {
        const updatedEvents = events.map((e) =>
          e.id === editingEventId ? pendingEvent : e
        )
        setEvents(updatedEvents)
      } else {
        setEvents([pendingEvent, ...events])
      }
    }
    setShowConfirmation(false)
    setPendingEvent(null)
    handleCloseModal()
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setPendingEvent(null)
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
                  <td>
                    <span
                      className="event-name-editable"
                      onClick={() => handleEditEvent(event)}
                    >
                      {event.name}
                    </span>
                  </td>
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
              <h2>{isEditMode ? 'Edit Event' : 'Add New Event'}</h2>
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
              <button className="btn-add" onClick={handleSaveEvent}>{isEditMode ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && pendingEvent && (
        <div className="modal-overlay" onClick={handleCancelConfirmation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Event Details</h2>
              <button className="modal-close" onClick={handleCancelConfirmation}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Event Name</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>{pendingEvent.name}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Cock Type</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{pendingEvent.derbyInfo.split(' - ')[0]}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Per Entry</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{pendingEvent.derbyInfo.match(/(\d+) per Entry/)?.[1]} per Entry</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Weight Range (lbs)</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    {pendingEvent.derbyInfo.match(/\((\d+)-(\d+) lbs\)/)?.[1]}-{pendingEvent.derbyInfo.match(/\((\d+)-(\d+) lbs\)/)?.[2]}
                  </p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Event Date</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatDate(pendingEvent.date)}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCancelConfirmation}>Cancel</button>
              <button className="btn-add" onClick={handleConfirmEvent}>Okay</button>
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
