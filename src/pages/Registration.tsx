import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import type { Event, Member } from '../context/DataContext'

const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const dateOnly = dateString.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  const date = new Date(dateOnly ? `${dateOnly}T00:00:00` : dateString)
  if (Number.isNaN(date.getTime())) return dateString

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatEventOption = (event: Event) => {
  return `${event.name} - ${formatDate(event.date)}`
}

const getBaseEntryName = (entryName: string) => {
  return entryName.replace(/\s+-\s+Entry\s+\d+$/i, '').trim()
}



function Registration() {
  const { events, members, addMultipleMembers, selectedEventId, setSelectedEventId } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entryName, setEntryName] = useState('')
  const [eventName, setEventName] = useState('')
  const [numberOfEntries, setNumberOfEntries] = useState('')
  const [registrationDate, setRegistrationDate] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const itemsPerPage = 15

  // Sort events so newest (most recent dates) are at the top
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const selectedEvent = useMemo(() => {
    return events.find((event) => String(event.id) === selectedEventId)
  }, [events, selectedEventId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [searchQuery, selectedEventId])

  const handleRegisterMember = () => {
    const selectedEvent = events.find(e => String(e.id) === selectedEventId) || sortedEvents[0]
    if (selectedEvent) {
      setEventName(selectedEvent.name)
      setRegistrationDate(selectedEvent.date.slice(0, 10))
      const perEntryMatch = selectedEvent.derby_info.match(/(\d+) per Entry/)
      if (perEntryMatch) {
        setNumberOfEntries(perEntryMatch[1])
      }
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEntryName('')
    setEventName('')
    setRegistrationDate('')
  }

  const handleSaveMember = () => {
    if (!entryName.trim() || !eventName.trim() || !numberOfEntries || !registrationDate) {
      alert('Please fill in all required fields')
      return
    }

    const normalizedEntryName = entryName.trim().toLowerCase()
    const selectedEvent = events.find(e => e.name === eventName && String(e.id) === selectedEventId)
    const duplicateEntry = members.some((member) => {
      const baseEntryName = member.entry_name.replace(/\s+-\s+Entry\s+\d+$/i, '').trim().toLowerCase()
      const sameEvent = selectedEvent
        ? member.event_id === selectedEvent.id || (!member.event_id && member.event_name === selectedEvent.name)
        : member.event_name === eventName
      return sameEvent && baseEntryName === normalizedEntryName
    })

    if (duplicateEntry) {
      alert('This entry is already registered for the selected event')
      return
    }

    const newMember: Member = {
      id: Math.max(...members.map(m => m.id), 0) + 1,
      event_id: selectedEvent?.id,
      entry_name: entryName.trim(),
      event_name: eventName,
      number_of_entries: parseInt(numberOfEntries),
      registration_date: registrationDate,
    }

    setPendingMembers([newMember])
    setShowConfirmation(true)
  }

  const handleConfirmMember = async () => {
    try {
      await addMultipleMembers(pendingMembers)
      setShowConfirmation(false)
      setPendingMembers([])
      setSearchQuery('')
      setCurrentPage(1)
      handleCloseModal()
    } catch (error) {
      console.error('Error adding members:', error)
      alert('Error adding members to database')
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setPendingMembers([])
  }

  const filteredMembers = useMemo(() => {
    const eventMembers = selectedEvent
      ? members.filter((member) => member.event_id === selectedEvent.id || (!member.event_id && member.event_name === selectedEvent.name))
      : members

    let result = eventMembers
    if (searchQuery) {
      result = result.filter((member) =>
        member.entry_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.event_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return [...result].sort((a, b) => a.id - b.id)
  }, [searchQuery, selectedEvent, members])

  const uniqueMembers = useMemo(() => {
    const groupedMembers = new Map<string, Member>()

    filteredMembers.forEach((member) => {
      const baseEntryName = getBaseEntryName(member.entry_name)
      const key = `${member.event_id ?? member.event_name.toLowerCase()}::${baseEntryName.toLowerCase()}`
      const existingMember = groupedMembers.get(key)

      if (existingMember) {
        existingMember.number_of_entries += member.number_of_entries
        if (member.id > existingMember.id) {
          existingMember.id = member.id
          existingMember.registration_date = member.registration_date
        }
      } else {
        groupedMembers.set(key, {
          ...member,
          entry_name: baseEntryName,
        })
      }
    })

    return [...groupedMembers.values()]
  }, [filteredMembers])

  const registeredCount = useMemo(() => {
    const selectedEvent = events.find(e => String(e.id) === selectedEventId)
    const names = new Set(
      (selectedEvent
        ? members.filter((member) => member.event_id === selectedEvent.id || (!member.event_id && member.event_name === selectedEvent.name))
        : members
      ).map((member) => getBaseEntryName(member.entry_name).toLowerCase())
    )
    return names.size
  }, [selectedEventId, members, events])

  const paginatedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return uniqueMembers.slice(startIdx, endIdx)
  }, [uniqueMembers, currentPage])

  const totalPages = Math.ceil(uniqueMembers.length / itemsPerPage)

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
        <h1>Registration</h1>
        <p>Manage member registrations</p>
        <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0f8ff', border: '1px solid #2196F3', borderRadius: '5px' }}>
            <strong>Registered:</strong> {registeredCount}
          </div>
        </div>
        <div className="search-action-row registration-controls">
          <div className="registration-event-filter">
            <label htmlFor="registrationEventSelect">Select Event</label>
            <select
              id="registrationEventSelect"
              className="form-input"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={String(event.id)}>
                  {formatEventOption(event)}
                </option>
              ))}
            </select>
          </div>
          <div className="search-container registration-search">
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
                <th>Entry Number</th>
                <th>Entry Name</th>
                <th>Event Name</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member, index) => (
                <tr key={member.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{member.entry_name}</td>
                  <td>{member.event_name}</td>
                  <td>{formatDate(selectedEvent?.date || member.registration_date)}</td>
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
                  <label htmlFor="eventName">Event Name</label>
                  <input
                    id="eventName"
                    type="text"
                    className="form-input"
                    value={eventName}
                    readOnly
                    disabled
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="registrationDate">Registration Date <span className="required-asterisk">*</span></label>
                <input
                  id="registrationDate"
                  type="date"
                  className="form-input"
                  value={registrationDate}
                  readOnly
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

      {showConfirmation && pendingMembers.length > 0 && (
        <div className="modal-overlay" onClick={handleCancelConfirmation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Member Registration</h2>
              <button className="modal-close" onClick={handleCancelConfirmation}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Entry Name</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>{entryName}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Event Name</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{eventName}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Registration Date</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatDate(registrationDate)}</p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '5px', border: '2px solid #2196F3' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Registration to be created</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2196F3' }}>1 registration</p>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
                  {pendingMembers.map((member, idx) => (
                    <div key={idx} style={{ marginBottom: '0.5rem' }}>• {member.entry_name}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCancelConfirmation}>Cancel</button>
              <button className="btn-add" onClick={handleConfirmMember}>Okay</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-copyright">
        © {new Date().getFullYear()} Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Registration
