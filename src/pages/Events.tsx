import './Events.css'
import { useState, useMemo } from 'react'
import { useData } from '../context/useDataContext'
import type { Event as ArenaEvent } from '../context/DataContext'

type PendingEvent = Omit<ArenaEvent, 'id'>

function Events() {
  const { events, addEvent, updateEventWithMembers } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [originalEventName, setOriginalEventName] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('Hack Fight')
  const [hackFightType, setHackFightType] = useState('Stag')
  const [noPerEntry, setNoPerEntry] = useState(1)
  const [eventDate, setEventDate] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null)
  const itemsPerPage = 10

  const getTodayInPhilippines = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date())

    const year = parts.find((part) => part.type === 'year')?.value ?? ''
    const month = parts.find((part) => part.type === 'month')?.value ?? ''
    const day = parts.find((part) => part.type === 'day')?.value ?? ''

    return `${year}-${month}-${day}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const normalizeDateForInput = (dateString: string) => {
    if (!dateString) return ''

    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      return dateString.slice(0, 10)
    }

    const parsed = new Date(dateString)
    if (Number.isNaN(parsed.getTime())) {
      return ''
    }

    return parsed.toISOString().split('T')[0]
  }

  const handleAddEvent = () => {
    setEventDate(getTodayInPhilippines())
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingEventId(null)
    setOriginalEventName('')
    setEventName('')
    setEventType('Hack Fight')
    setHackFightType('Stag')
    setNoPerEntry(1)
    setEventDate('')
  }

  const handleEditEvent = (event: ArenaEvent) => {
    // Parse per-entry count from both current and legacy formats.
    const parsedNoPerEntry = parseInt(event.derby_info.match(/(\d+)\s*per\s*Entry/i)?.[1] || '1')

    const categoryFromDerbyInfo = event.derby_info.split(' - ')[0]?.trim()
    if (categoryFromDerbyInfo && !/^\d+\s*per\s*Entry/i.test(categoryFromDerbyInfo)) {
      setHackFightType(categoryFromDerbyInfo)
    } else {
      setHackFightType('Stag')
    }

    setNoPerEntry(parsedNoPerEntry)

    // Determine event type based on per-entry count.
    if (parsedNoPerEntry === 1) {
      setEventType('Hack Fight')
    } else if (parsedNoPerEntry === 2) {
      setEventType('2 Wins')
    } else if (parsedNoPerEntry === 3) {
      setEventType('3 Wins')
    } else {
      setEventType(event.type || 'Hack Fight')
    }

    setOriginalEventName(event.name)
    setEventName(event.name)
    setEventDate(normalizeDateForInput(event.date))
    setEditingEventId(event.id)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    const normalizedEventName = eventName.trim()

    if (!normalizedEventName || !noPerEntry || !eventDate) {
      alert('Please fill in all required fields')
      return
    }

    if (isEditMode && editingEventId) {
      const updatedEvent: PendingEvent = {
        name: normalizedEventName,
        type: eventType,
        derby_info: `${hackFightType} - ${noPerEntry} per Entry`,
        date: eventDate,
      }
      setPendingEvent(updatedEvent)
    } else {
      const newEvent: PendingEvent = {
        name: normalizedEventName,
        type: eventType,
        derby_info: `${hackFightType} - ${noPerEntry} per Entry`,
        date: eventDate,
      }
      setPendingEvent(newEvent)
    }
    setShowConfirmation(true)
  }

  const handleConfirmEvent = async () => {
    if (pendingEvent) {
      try {
        if (isEditMode && editingEventId) {
          await updateEventWithMembers(editingEventId, originalEventName, {
            name: pendingEvent.name,
            type: pendingEvent.type,
            derby_info: pendingEvent.derby_info,
            date: pendingEvent.date,
          })
        } else {
          await addEvent({
            name: pendingEvent.name,
            type: pendingEvent.type,
            derby_info: pendingEvent.derby_info,
            date: pendingEvent.date,
          })
        }
      } catch (error) {
        console.error('Event save error:', error)
        alert('Error saving event')
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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return sortedEvents
    return sortedEvents.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.derby_info.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, sortedEvents])

  const paginatedEvents = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return filteredEvents.slice(startIdx, endIdx)
  }, [filteredEvents, currentPage])

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)

  const getPaginationPages = () => {
    const pages: (number | string)[] = []
    const showPages = 3
    const showAround = 1

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first pages
    for (let i = 1; i <= showPages; i++) {
      pages.push(i)
    }

    // Add ellipsis and pages around current
    if (currentPage > showPages + showAround) {
      pages.push('...')
    }

    const start = Math.max(showPages + 1, currentPage - showAround)
    const end = Math.min(totalPages - showPages, currentPage + showAround)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    // Add ellipsis before last pages
    if (currentPage < totalPages - showPages - showAround) {
      pages.push('...')
    }

    // Always show last pages
    for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    return pages
  }

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
                <th>Entry Info</th>
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
                  <td>{event.derby_info.match(/(\d+) per Entry/)?.[1]} per Entry</td>
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
            {getPaginationPages().map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis">•••</span>
              ) : (
                <button
                  key={page}
                  className={`page-number-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </button>
              )
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
                  <label htmlFor="eventType">Event Type <span className="required-asterisk">*</span></label>
                  <select
                    id="eventType"
                    className="form-input"
                    value={eventType}
                    onChange={(e) => {
                      const selectedType = e.target.value
                      setEventType(selectedType)
                      if (selectedType === 'Hack Fight') {
                        setNoPerEntry(1)
                      } else if (selectedType === '2 Wins') {
                        setNoPerEntry(2)
                      } else if (selectedType === '3 Wins') {
                        setNoPerEntry(3)
                      }
                    }}
                  >
                    <option value="Hack Fight">Hack Fight</option>
                    <option value="2 Wins">2 Wins</option>
                    <option value="3 Wins">3 Wins</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="noPerEntry">No. of Entry <span className="required-asterisk">*</span></label>
                <input
                  id="noPerEntry"
                  type="number"
                  className="form-input"
                  placeholder="Automatic based on event type"
                  value={noPerEntry}
                  disabled
                  readOnly
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
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Event Type</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{pendingEvent.type}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Per Entry</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{pendingEvent.derby_info.match(/(\d+) per Entry/)?.[1]} per Entry</p>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Event Date</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatDate(pendingEvent.date)}</p>
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
