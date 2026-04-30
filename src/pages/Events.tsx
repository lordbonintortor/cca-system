import './Events.css'
import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import type { Event as ArenaEvent } from '../context/DataContext'

type PendingEvent = Omit<ArenaEvent, 'id'>

function Events() {
  const { events, addEvent, updateEventWithMembers } = useData()
  const [displayEvents, setDisplayEvents] = useState(events)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [originalEventName, setOriginalEventName] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('Hack Fight')
  const [hackFightType, setHackFightType] = useState('Stag')
  const [weightRangeMin, setWeightRangeMin] = useState('')
  const [weightRangeMax, setWeightRangeMax] = useState('')
  const [noPerEntry, setNoPerEntry] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingEvent, setPendingEvent] = useState<PendingEvent | null>(null)
  const itemsPerPage = 10

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
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setEventDate(formattedDate)
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
    setWeightRangeMin('')
    setWeightRangeMax('')
    setNoPerEntry('')
    setEventDate('')
  }

  const handleEditEvent = (event: ArenaEvent) => {
    const derbyInfoParts = event.derby_info.match(/(.*?)\s*-\s*(\d+)\s*per\s*Entry\s*\((\d+)\s*-\s*(\d+)\s*(?:kilos|kg)\)/i)
    if (derbyInfoParts) {
      setHackFightType(derbyInfoParts[1].trim())
      setNoPerEntry(derbyInfoParts[2])
      setWeightRangeMin(derbyInfoParts[3])
      setWeightRangeMax(derbyInfoParts[4])
    } else {
      const fallbackHackFightType = event.derby_info.split(' - ')[0]?.trim() || 'Stag'
      const fallbackPerEntry = event.derby_info.match(/(\d+)\s*per\s*Entry/i)?.[1] || ''
      const fallbackWeightRange = event.derby_info.match(/(\d+)\s*-\s*(\d+)/)

      setHackFightType(fallbackHackFightType)
      setNoPerEntry(fallbackPerEntry)
      setWeightRangeMin(fallbackWeightRange?.[1] || '')
      setWeightRangeMax(fallbackWeightRange?.[2] || '')
    }

    setEventType(event.type || 'Hack Fight')
    setOriginalEventName(event.name)
    setEventName(event.name)
    setEventDate(normalizeDateForInput(event.date))
    setEditingEventId(event.id)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleSaveEvent = () => {
    const normalizedEventName = eventName.trim()

    if (!normalizedEventName || !weightRangeMin || !weightRangeMax || !noPerEntry || !eventDate) {
      alert('Please fill in all required fields')
      return
    }

    if (isEditMode && editingEventId) {
      const updatedEvent: PendingEvent = {
        name: normalizedEventName,
        type: eventType,
        derby_info: `${hackFightType} - ${noPerEntry} per Entry (${weightRangeMin}-${weightRangeMax} kilos)`,
        date: eventDate,
      }
      setPendingEvent(updatedEvent)
    } else {
      const newEvent: PendingEvent = {
        name: normalizedEventName,
        type: eventType,
        derby_info: `${hackFightType} - ${noPerEntry} per Entry (${weightRangeMin}-${weightRangeMax} kilos)`,
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

  useEffect(() => {
    setDisplayEvents(events)
  }, [events])

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return displayEvents
    return displayEvents.filter((event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.derby_info.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, displayEvents])

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
                  <td>{event.derby_info}</td>
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
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{pendingEvent.derby_info.split(' - ')[0]}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Per Entry</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{pendingEvent.derby_info.match(/(\d+) per Entry/)?.[1]} per Entry</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Weight Range (kilos)</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    {pendingEvent.derby_info.match(/\((\d+)-(\d+) (?:kilos|kg)\)/)?.[1]}-{pendingEvent.derby_info.match(/\((\d+)-(\d+) (?:kilos|kg)\)/)?.[2]}
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
