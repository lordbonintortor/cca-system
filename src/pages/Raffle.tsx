import './Registration.css'
import './Raffle.css'
import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import type { RaffleWinner } from '../context/DataContext'

interface Ticket {
  id: number
  ticket_number: string
  participant_name: string
  entry_name: string
  event_name: string
  created_at: string
}

function Raffle() {
  const { events, members, raffleWinners, addRaffleWinner } = useData()
  const [selectedEvent, setSelectedEvent] = useState('')
  const [isAddingWinner, setIsAddingWinner] = useState(false)
  const [drawnWinner, setDrawnWinner] = useState<Omit<RaffleWinner, 'id'> | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showWheel, setShowWheel] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [raffleSearch, setRaffleSearch] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedEvent((currentEvent) => {
      if (events.length === 0) {
        return ''
      }

      if (currentEvent && events.some((event) => event.name === currentEvent)) {
        return currentEvent
      }

      return events[0].name
    })
  }, [events])

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const eventMembers = useMemo(() => {
    return members.filter((m) => m.event_name === selectedEvent)
  }, [selectedEvent, members])

  const eventTickets: Ticket[] = useMemo(() => {
    return eventMembers.map((member, index) => ({
      id: member.id,
      ticket_number: `R-${String(index + 1).padStart(3, '0')}`,
      participant_name: member.entry_name,
      entry_name: member.entry_name,
      event_name: member.event_name,
      created_at: member.registration_date,
    }))
  }, [eventMembers])

  const eventWinners = useMemo(() => {
    return raffleWinners
      .filter((w) => w.event_name === selectedEvent)
      .sort((a, b) => new Date(b.drawn_at).getTime() - new Date(a.drawn_at).getTime())
  }, [raffleWinners, selectedEvent])

  const selectedEventDetails = useMemo(() => {
    return events.find((event) => event.name === selectedEvent)
  }, [events, selectedEvent])

  const winnerTicketNumbers = useMemo(() => {
    return new Set(eventWinners.map((winner) => winner.ticket_number))
  }, [eventWinners])

  const eligibleTickets = useMemo(() => {
    return eventTickets.filter((ticket) => !winnerTicketNumbers.has(ticket.ticket_number))
  }, [eventTickets, winnerTicketNumbers])

  const filteredTickets = useMemo(() => {
    if (!raffleSearch.trim()) return eventTickets

    const search = raffleSearch.toLowerCase()
    return eventTickets.filter((ticket) =>
      ticket.ticket_number.toLowerCase().includes(search) ||
      ticket.participant_name.toLowerCase().includes(search) ||
      ticket.entry_name.toLowerCase().includes(search)
    )
  }, [eventTickets, raffleSearch])

  const filteredWinners = useMemo(() => {
    if (!raffleSearch.trim()) return eventWinners

    const search = raffleSearch.toLowerCase()
    return eventWinners.filter((winner) =>
      winner.ticket_number.toLowerCase().includes(search) ||
      winner.participant_name.toLowerCase().includes(search) ||
      winner.entry_name.toLowerCase().includes(search)
    )
  }, [eventWinners, raffleSearch])

  const handleDraw = () => {
    if (eligibleTickets.length === 0) {
      if (eventTickets.length > 0) {
        alert('All raffle tickets for this event already have winners')
        return
      }

      alert('No raffle tickets available for this event')
      return
    }

    setIsSpinning(true)
    setShowWheel(true)
    setWheelRotation(0)

    // Spin for 7 seconds
    const spinDuration = 7000
    const spinRevolutions = 12
    const totalRotation = 360 * spinRevolutions

    const startTime = Date.now()

    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / spinDuration, 1)

      // Easing: start fast, slow down near the end
      const easeProgress = progress < 0.7 ? progress : 0.7 + (progress - 0.7) * 0.3

      setWheelRotation(totalRotation * easeProgress)

      if (progress >= 1) {
        clearInterval(spinInterval)

        // Select random winner
        const randomIndex = Math.floor(Math.random() * eligibleTickets.length)
        const winner = eligibleTickets[randomIndex]

        // Calculate final rotation to land on winner
        const degreesPerTicket = 360 / eligibleTickets.length
        const finalRotation = totalRotation + (360 - degreesPerTicket * randomIndex - degreesPerTicket / 2)

        setWheelRotation(finalRotation)
        setIsSpinning(false)

        // Keep wheel displayed for 2 seconds while it stays on winner, then show modal
        setTimeout(() => {
          const newWinner: Omit<RaffleWinner, 'id'> = {
            ticket_number: winner.ticket_number,
            participant_name: winner.participant_name,
            entry_name: winner.entry_name,
            event_name: winner.event_name,
            drawn_at: new Date().toISOString(),
          }

          setDrawnWinner(newWinner)
          setShowWinnerModal(true)
          setIsAddingWinner(true)

          // Save to Supabase
          addRaffleWinner(newWinner)
            .then(() => {
              setIsAddingWinner(false)
            })
            .catch((error) => {
              console.error('Error saving winner:', error)
              setIsAddingWinner(false)
            })

          setTimeout(() => {
            setShowWinnerModal(false)
            setDrawnWinner(null)
            setShowWheel(false)
          }, 2000)
        }, 2000)
      }
    }, 30)
  }

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Raffle Results - ${selectedEvent}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
          h1 { text-align: center; margin-bottom: 10px; }
          .event-info { text-align: center; margin-bottom: 20px; color: #666; }
          .section { margin-bottom: 30px; }
          h2 { font-size: 1.2rem; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8f8f8; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
          td { padding: 10px 12px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .winner-highlight { background: #e8f5e9 !important; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>RAFFLE RESULTS</h1>
        <div class="event-info">${selectedEvent}</div>
        
        <div class="section">
          <h2>Raffle Participants (${eventTickets.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Participant Name</th>
                <th>Entry Name</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              ${eventTickets.map((ticket) => `
                <tr>
                  <td>${ticket.ticket_number}</td>
                  <td>${ticket.participant_name}</td>
                  <td>${ticket.entry_name}</td>
                  <td>${ticket.created_at}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${eventWinners.length > 0 ? `
          <div class="section">
            <h2>Draw Winners (${eventWinners.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Winner Name</th>
                  <th>Date Won</th>
                </tr>
              </thead>
              <tbody>
                ${eventWinners.map((winner) => `
                  <tr class="winner-highlight">
                    <td>${winner.ticket_number}</td>
                    <td>${winner.participant_name}</td>
                    <td>${new Date(winner.drawn_at).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </body>
      </html>
    `
    const printWindow = window.open('', '', 'width=900,height=600')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      setTimeout(() => printWindow.close(), 500)
    }
  }

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Raffle</h1>
        <p>Manage raffle drawings and track winners</p>

        <div className="raffle-toolbar">
          <div className="raffle-event-control">
            <label htmlFor="raffleEventSelect">Select Event</label>
            <select
              id="raffleEventSelect"
              className="search-input raffle-event-select"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={event.name}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <button 
            className="btn-add-event raffle-draw-button" 
            onClick={handleDraw}
            disabled={isSpinning || eligibleTickets.length === 0}
          >
            🎲 Draw Winner
          </button>
          <button className="btn-add-event raffle-print-button" onClick={handlePrint}>
            🖨️ Print Results
          </button>
        </div>

        <div className="raffle-summary-grid">
          <div className="raffle-summary-card">
            <span>Participants</span>
            <strong>{eventTickets.length}</strong>
            <small>{selectedEventDetails ? new Date(selectedEventDetails.date).toLocaleDateString() : 'No event selected'}</small>
          </div>
          <div className="raffle-summary-card">
            <span>Eligible Tickets</span>
            <strong>{eligibleTickets.length}</strong>
            <small>{eventWinners.length} winner{eventWinners.length === 1 ? '' : 's'} already drawn</small>
          </div>
          <div className="raffle-summary-card">
            <span>Last Winner</span>
            <strong>{eventWinners[0]?.participant_name || 'None'}</strong>
            <small>{eventWinners[0] ? `${eventWinners[0].ticket_number} · ${new Date(eventWinners[0].drawn_at).toLocaleTimeString()}` : 'Draw a winner to start'}</small>
          </div>
          <div className="raffle-summary-card raffle-search-card">
            <label htmlFor="raffleSearch">Find Ticket</label>
            <input
              id="raffleSearch"
              className="search-input"
              type="text"
              placeholder="Search ticket, participant, entry"
              value={raffleSearch}
              onChange={(e) => setRaffleSearch(e.target.value)}
            />
          </div>
        </div>

        {eligibleTickets.length === 0 && eventTickets.length > 0 && (
          <div className="raffle-notice">
            All registered raffle tickets for this event have already been drawn.
          </div>
        )}

        <div className="raffle-content-grid">
          {showWheel && eligibleTickets.length > 0 && (
            <div className="raffle-wheel-panel">
              <div className="raffle-wheel">
                {/* Spinning wheel */}
                <svg
                  width="350"
                  height="350"
                  viewBox="0 0 350 350"
                  className="raffle-wheel-svg"
                  style={{ transform: `rotate(${wheelRotation}deg)`, transition: isSpinning ? 'none' : 'transform 0.3s ease-out' }}
                >
                  {/* Circle background */}
                  <circle cx="175" cy="175" r="165" fill="#fff" stroke="#333" strokeWidth="3" />
                  
                  {/* Draw segments for each ticket */}
                  {eligibleTickets.map((ticket, index) => {
                    const total = eligibleTickets.length
                    const angle = (360 / total) * index
                    const startAngle = angle * (Math.PI / 180)
                    const endAngle = ((angle + 360 / total) * Math.PI) / 180
                    const radius = 165

                    const x1 = 175 + radius * Math.cos(startAngle)
                    const y1 = 175 + radius * Math.sin(startAngle)
                    const x2 = 175 + radius * Math.cos(endAngle)
                    const y2 = 175 + radius * Math.sin(endAngle)

                    const labelAngle = startAngle + (endAngle - startAngle) / 2
                    const labelRadius = 120
                    const labelX = 175 + labelRadius * Math.cos(labelAngle)
                    const labelY = 175 + labelRadius * Math.sin(labelAngle)

                    const colors = [
                      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
                      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#6C5CE7'
                    ]
                    const color = colors[index % colors.length]

                    return (
                      <g key={index}>
                        <path
                          d={`M 175 175 L ${x1} ${y1} A 165 165 0 ${360 / total > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
                          fill={color}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#fff"
                          fontSize="11"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {ticket.ticket_number}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* Center circle */}
                <div className="raffle-wheel-center">
                  🎲
                </div>

                {/* Pointer */}
                <div className="raffle-wheel-pointer" />
              </div>

              <p className="raffle-wheel-caption">
                {isSpinning ? 'Drawing a winner...' : 'Winner selected'}
              </p>
            </div>
          )}

          <div className="events-table-wrapper raffle-table-panel">
            <div className="raffle-table-heading">
              <h3>Raffle Participants ({filteredTickets.length})</h3>
              <span>{eligibleTickets.length} eligible</span>
            </div>
            <table className="events-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Participant</th>
                  <th>Entry</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>No raffle tickets found</td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className={winnerTicketNumbers.has(ticket.ticket_number) ? 'raffle-ticket-drawn' : ''}>
                      <td style={{ fontWeight: 'bold' }}>{ticket.ticket_number}</td>
                      <td>{ticket.participant_name}</td>
                      <td>{ticket.entry_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="events-table-wrapper raffle-table-panel">
            <div className="raffle-table-heading">
              <h3>Draw Winners ({filteredWinners.length})</h3>
              <span>{eventWinners.length} total</span>
            </div>
            <table className="events-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Winner</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredWinners.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>No winners yet</td>
                  </tr>
                ) : (
                  filteredWinners.map((winner) => (
                    <tr key={winner.id} className="raffle-winner-row">
                      <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>{winner.ticket_number}</td>
                      <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>{winner.participant_name}</td>
                      <td style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(winner.drawn_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showWinnerModal && drawnWinner && (
        <div className="modal-overlay">
          <div className="modal-content raffle-winner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header raffle-winner-modal-header">
              <h2>🎉 WINNER! 🎉</h2>
            </div>
            <div className="modal-body">
              <p className="raffle-winner-name">
                {drawnWinner.participant_name}
              </p>
              <p className="raffle-winner-ticket">
                Ticket #: <strong>{drawnWinner.ticket_number}</strong>
              </p>
              <p className="raffle-winner-entry">{drawnWinner.entry_name}</p>
              <p className="raffle-winner-time">
                {new Date(drawnWinner.drawn_at).toLocaleTimeString()}
              </p>
              {isAddingWinner && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>Saving winner...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Raffle
