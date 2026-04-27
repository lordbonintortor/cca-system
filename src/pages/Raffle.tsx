import './Registration.css'
import { useState, useMemo } from 'react'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

interface Member {
  id: number
  entryName: string
  eventName: string
  handlerName: string
  cockType: string
  numberOfEntries: number
  registrationDate: string
}


interface RaffleWinner {
  id: number
  ticketNumber: string
  participantName: string
  eventName: string
  drawnAt: string
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

const INITIAL_MEMBERS: Member[] = [
  { id: 1, entryName: 'Juan Dela Cruz', eventName: 'Monday Night Match', handlerName: 'Carlos Santos', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 2, entryName: 'Maria Garcia', eventName: 'Monday Night Match', handlerName: 'Pedro Ramirez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 3, entryName: 'Antonio Reyes', eventName: 'Monday Night Match', handlerName: 'Miguel Torres', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 4, entryName: 'Rosa Lopez', eventName: 'Monday Night Match', handlerName: 'Juan Mendoza', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 5, entryName: 'Francisco Diaz', eventName: 'Weekend Championship', handlerName: 'Luis Fernandez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 6, entryName: 'Angela Morales', eventName: 'Weekend Championship', handlerName: 'Ricardo Gutierrez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 7, entryName: 'Roberto Flores', eventName: 'Weekend Championship', handlerName: 'Daniel Navarro', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 8, entryName: 'Elena Castillo', eventName: 'Weekend Championship', handlerName: 'Eduardo Vargas', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 9, entryName: 'Javier Romero', eventName: 'Weekend Championship', handlerName: 'Fernando Ortiz', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 10, entryName: 'Carmen Rodriguez', eventName: 'Local Tournament', handlerName: 'Guillermo Castro', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 11, entryName: 'Manuel Santos', eventName: 'Local Tournament', handlerName: 'Hector Moreno', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 12, entryName: 'Lucia Hernandez', eventName: 'Local Tournament', handlerName: 'Ignacio Ruiz', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 13, entryName: 'Raúl Perez', eventName: 'Spring Classic Derby', handlerName: 'Javier Molina', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 14, entryName: 'Isabel Martinez', eventName: 'Spring Classic Derby', handlerName: 'Karlo Fontanar', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 15, entryName: 'Diego Sanchez', eventName: 'Spring Classic Derby', handlerName: 'Luis Pacabay', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 16, entryName: 'Alfredo Reyes', eventName: 'Spring Classic Derby', handlerName: 'Marco Villareal', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 17, entryName: 'Vicente Gonzales', eventName: 'Inter-Club Battle', handlerName: 'Benigno Torres', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 18, entryName: 'Benito Reyes', eventName: 'Inter-Club Battle', handlerName: 'Amadeo Santos', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 19, entryName: 'Gina Lopez', eventName: 'Inter-Club Battle', handlerName: 'Damian Flores', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 20, entryName: 'Hector Cruz', eventName: 'Regional Qualifier', handlerName: 'Ernesto Vargas', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 21, entryName: 'Iris Martinez', eventName: 'Regional Qualifier', handlerName: 'Frederic Ortiz', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 22, entryName: 'Jasper Torres', eventName: 'Regional Qualifier', handlerName: 'Gregory Ruiz', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 23, entryName: 'Karen Diaz', eventName: 'Regional Qualifier', handlerName: 'Harold Castro', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 24, entryName: 'Leo Fernandez', eventName: 'Friendly Match Series', handlerName: 'Ivan Navarro', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 25, entryName: 'Monica Garcia', eventName: 'Friendly Match Series', handlerName: 'Julio Moreno', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 26, entryName: 'Nicolas Ramirez', eventName: 'Friendly Match Series', handlerName: 'Kevin Gutierrez', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 27, entryName: 'Olivia Santos', eventName: 'Championship Round', handlerName: 'Luis Molina', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 28, entryName: 'Pablo Reyes', eventName: 'Championship Round', handlerName: 'Marco Fontanar', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 29, entryName: 'Quintin Lopez', eventName: 'Championship Round', handlerName: 'Napoleon Pacabay', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 30, entryName: 'Rita Flores', eventName: 'Championship Round', handlerName: 'Oscar Villareal', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 31, entryName: 'Samuel Cruz', eventName: 'Rising Stars Tournament', handlerName: 'Pablo Torres', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 32, entryName: 'Teresa Martinez', eventName: 'Rising Stars Tournament', handlerName: 'Quentin Reyes', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 33, entryName: 'Ulises Gonzales', eventName: 'Rising Stars Tournament', handlerName: 'Rodolfo Santos', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 34, entryName: 'Vanessa Rodriguez', eventName: 'Rising Stars Tournament', handlerName: 'Salvador Garcia', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 35, entryName: 'Walter Diaz', eventName: 'Elite Division Match', handlerName: 'Tomas Ramirez', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 36, entryName: 'Ximena Lopez', eventName: 'Elite Division Match', handlerName: 'Ulysses Fernandez', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 37, entryName: 'Yolanda Flores', eventName: 'Elite Division Match', handlerName: 'Valerian Navarro', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 38, entryName: 'Zane Castillo', eventName: 'April Opener', handlerName: 'Walter Vargas', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 39, entryName: 'Aurora Santos', eventName: 'April Opener', handlerName: 'Xavier Ortiz', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 40, entryName: 'Brenno Reyes', eventName: 'April Opener', handlerName: 'Yusuf Moreno', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 41, entryName: 'Ciara Martinez', eventName: 'Grand Festival Battle', handlerName: 'Zacharias Gutierrez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 42, entryName: 'Damien Garcia', eventName: 'Grand Festival Battle', handlerName: 'Abelardo Molina', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 43, entryName: 'Emilia Lopez', eventName: 'Grand Festival Battle', handlerName: 'Baltazar Fontanar', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 44, entryName: 'Fabio Diaz', eventName: 'Grand Festival Battle', handlerName: 'Camillo Pacabay', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 45, entryName: 'Gloria Fernandez', eventName: 'Provincial Challenge', handlerName: 'Dorian Villareal', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 46, entryName: 'Hernando Reyes', eventName: 'Provincial Challenge', handlerName: 'Efrain Torres', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 47, entryName: 'Iris Gonzales', eventName: 'Provincial Challenge', handlerName: 'Faustino Reyes', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 48, entryName: 'Jacobo Santos', eventName: 'Provincial Challenge', handlerName: 'Gaudencio Santos', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 49, entryName: 'Karla Flores', eventName: 'Spring Warmup Series', handlerName: 'Hilario Garcia', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 50, entryName: 'Lorenzo Martinez', eventName: 'Spring Warmup Series', handlerName: 'Isidro Ramirez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 51, entryName: 'Mariana Lopez', eventName: 'Spring Warmup Series', handlerName: 'Jacinto Fernandez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 52, entryName: 'Norberto Reyes', eventName: 'National Preliminaries', handlerName: 'Kirkland Navarro', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
  { id: 53, entryName: 'Ornella Garcia', eventName: 'National Preliminaries', handlerName: 'Lamberto Vargas', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
  { id: 54, entryName: 'Paco Diaz', eventName: 'National Preliminaries', handlerName: 'Magno Ortiz', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
]

function Raffle() {
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_EVENTS[0].name)
  const [winners, setWinners] = useState<RaffleWinner[]>([])
  const [drawnWinner, setDrawnWinner] = useState<RaffleWinner | null>(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showWheel, setShowWheel] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)

  const sortedEvents = useMemo(() => {
    return [...INITIAL_EVENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const eventMembers = useMemo(() => {
    return INITIAL_MEMBERS.filter((m) => m.eventName === selectedEvent)
  }, [selectedEvent])

  const eventTickets = useMemo(() => {
    return eventMembers.map((member, index) => ({
      id: member.id,
      ticketNumber: `R-${String(index + 1).padStart(3, '0')}`,
      participantName: member.handlerName,
      entryName: member.entryName,
      eventName: member.eventName,
      createdAt: member.registrationDate,
    }))
  }, [eventMembers])

  const eventWinners = useMemo(() => {
    return winners
      .filter((w) => w.eventName === selectedEvent)
      .sort((a, b) => new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime())
  }, [winners, selectedEvent])

  const handleDraw = () => {
    if (eventTickets.length === 0) {
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
        const randomIndex = Math.floor(Math.random() * eventTickets.length)
        const winner = eventTickets[randomIndex]

        // Calculate final rotation to land on winner
        const degreesPerTicket = 360 / eventTickets.length
        const finalRotation = totalRotation + (360 - degreesPerTicket * randomIndex - degreesPerTicket / 2)

        setWheelRotation(finalRotation)
        setIsSpinning(false)

        // Keep wheel displayed for 2 seconds while it stays on winner, then show modal
        setTimeout(() => {
          const newWinner: RaffleWinner = {
            id: Date.now(),
            ticketNumber: winner.ticketNumber,
            participantName: winner.participantName,
            eventName: winner.eventName,
            drawnAt: new Date().toISOString(),
          }

          setDrawnWinner(newWinner)
          setWinners([...winners, newWinner])
          setShowWinnerModal(true)

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
                  <td>${ticket.ticketNumber}</td>
                  <td>${ticket.participantName}</td>
                  <td>${ticket.entryName}</td>
                  <td>${ticket.createdAt}</td>
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
                    <td>${winner.ticketNumber}</td>
                    <td>${winner.participantName}</td>
                    <td>${new Date(winner.drawnAt).toLocaleString()}</td>
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

        <div className="search-action-row">
          <div className="search-container">
            <select
              className="search-input"
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
            className="btn-add-event" 
            onClick={handleDraw}
            disabled={isSpinning}
            style={{ 
              backgroundColor: '#ff9800',
              opacity: isSpinning ? 0.5 : 1,
              cursor: isSpinning ? 'not-allowed' : 'pointer'
            }}
          >
            🎲 Draw Winner
          </button>
          <button className="btn-add-event" onClick={handlePrint} style={{ backgroundColor: '#2196F3', marginLeft: '0.5rem' }}>
            🖨️ Print Results
          </button>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {showWheel && eventTickets.length > 0 && (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <div style={{
                position: 'relative',
                width: '350px',
                height: '350px',
                marginBottom: '2rem'
              }}>
                {/* Spinning wheel */}
                <svg
                  width="350"
                  height="350"
                  viewBox="0 0 350 350"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? 'none' : 'transform 0.3s ease-out',
                  }}
                >
                  {/* Circle background */}
                  <circle cx="175" cy="175" r="165" fill="#fff" stroke="#333" strokeWidth="3" />
                  
                  {/* Draw segments for each ticket */}
                  {eventTickets.map((ticket, index) => {
                    const total = eventTickets.length
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
                          {ticket.ticketNumber}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* Center circle */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#fff',
                  border: '3px solid #333',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  zIndex: 10
                }}>
                  🎲
                </div>

                {/* Pointer */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '15px solid transparent',
                  borderRight: '15px solid transparent',
                  borderTop: '20px solid #FF6B6B',
                  zIndex: 11
                }}/>
              </div>

              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                🎯 Spinning... {Math.floor((4500 - (isSpinning ? 0 : 4500)) / 1000) + 1}s
              </p>
            </div>
          )}

          <div className="events-table-wrapper">
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Raffle Participants ({eventTickets.length})</h3>
            <table className="events-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Participant</th>
                  <th>Entry</th>
                </tr>
              </thead>
              <tbody>
                {eventTickets.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>No registered members for this event</td>
                  </tr>
                ) : (
                  eventTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td style={{ fontWeight: 'bold' }}>{ticket.ticketNumber}</td>
                      <td>{ticket.participantName}</td>
                      <td>{ticket.entryName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="events-table-wrapper">
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Draw Winners ({eventWinners.length})</h3>
            <table className="events-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Winner</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {eventWinners.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>No winners yet</td>
                  </tr>
                ) : (
                  eventWinners.map((winner) => (
                    <tr key={winner.id} style={{ backgroundColor: '#e8f5e9' }}>
                      <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>{winner.ticketNumber}</td>
                      <td style={{ fontWeight: 'bold', color: '#2e7d32' }}>{winner.participantName}</td>
                      <td style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(winner.drawnAt).toLocaleDateString()}</td>
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
          <div className="modal-content" style={{ textAlign: 'center', backgroundColor: '#e8f5e9' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: '#2e7d32', color: 'white' }}>
              <h2 style={{ margin: 0, color: 'white' }}>🎉 WINNER! 🎉</h2>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32', margin: '1rem 0' }}>
                {drawnWinner.participantName}
              </p>
              <p style={{ fontSize: '1.1rem', color: '#666', margin: '0.5rem 0' }}>
                Ticket #: <strong>{drawnWinner.ticketNumber}</strong>
              </p>
              <p style={{ fontSize: '0.9rem', color: '#999' }}>
                {new Date(drawnWinner.drawnAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Raffle
