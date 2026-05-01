import './Registration.css'
import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import type { Member } from '../context/DataContext'



function Registration() {
  const { events, members, addMultipleMembers } = useData()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entryName, setEntryName] = useState('')
  const [selectedEventName, setSelectedEventName] = useState('')
  const [eventName, setEventName] = useState('')
  const [cockType, setCockType] = useState('Stag')
  const [numberOfEntries, setNumberOfEntries] = useState('')
  const [registrationDate, setRegistrationDate] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
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

  // Sort events so newest (most recent dates) are at the top
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedEventName((currentEventName) => {
      if (sortedEvents.length === 0) {
        return ''
      }

      if (currentEventName && sortedEvents.some((event) => event.name === currentEventName)) {
        return currentEventName
      }

      return sortedEvents[0].name
    })
  }, [sortedEvents])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [searchQuery, selectedEventName])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleRegisterMember = () => {
    setRegistrationDate(getTodayInPhilippines())
    const selectedEvent = events.find(e => e.name === selectedEventName) || sortedEvents[0]
    if (selectedEvent) {
      setEventName(selectedEvent.name)
      const cockTypeFromEvent = selectedEvent.derby_info.split(' - ')[0]
      setCockType(cockTypeFromEvent)
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
    setCockType('Stag')
    setRegistrationDate('')
  }

  const handleSaveMember = () => {
    if (!entryName.trim() || !eventName.trim() || !numberOfEntries || !registrationDate) {
      alert('Please fill in all required fields')
      return
    }

    const numEntries = parseInt(numberOfEntries)
    const newMembers: Member[] = []

    // Create multiple member records based on number of entries
    for (let i = 1; i <= numEntries; i++) {
      const newMember: Member = {
        id: Math.max(...members.map(m => m.id), 0) + i,
        entry_name: `${entryName} - Entry ${i}`,
        event_name: eventName,
        handler_name: '',
        cock_type: cockType,
        number_of_entries: 1,
        registration_date: registrationDate,
      }
      newMembers.push(newMember)
    }

    setPendingMembers(newMembers)
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
    const eventMembers = selectedEventName
      ? members.filter((member) => member.event_name === selectedEventName)
      : members

    let result = eventMembers
    if (searchQuery) {
      result = result.filter((member) =>
        member.entry_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.handler_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return [...result].sort((a, b) => b.id - a.id)
  }, [searchQuery, selectedEventName, members])

  const paginatedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return filteredMembers.slice(startIdx, endIdx)
  }, [filteredMembers, currentPage])

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)

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
        <div className="search-action-row registration-controls">
          <div className="registration-event-filter">
            <label htmlFor="registrationEventSelect">Select Event</label>
            <select
              id="registrationEventSelect"
              className="form-input"
              value={selectedEventName}
              onChange={(e) => setSelectedEventName(e.target.value)}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={event.name}>
                  {event.name}
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
                <th>Entry Name</th>
                <th>Event Name</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.entry_name}</td>
                  <td>{member.event_name}</td>
                  <td>{formatDate(member.registration_date)}</td>
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
                <label htmlFor="numberOfEntries">No. of Entries</label>
                <input
                  id="numberOfEntries"
                  type="number"
                  className="form-input"
                  placeholder="—"
                  value={numberOfEntries}
                  disabled
                  readOnly
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Event Name</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{eventName}</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Number of Entries</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{numberOfEntries}</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Registration Date</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>{formatDate(registrationDate)}</p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '5px', border: '2px solid #2196F3' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Entries to be created</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2196F3' }}>{pendingMembers.length} {pendingMembers.length === 1 ? 'entry' : 'entries'}</p>
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
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Registration
