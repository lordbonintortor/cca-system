import './Registration.css'
import { useState, useMemo, useContext } from 'react'
import { TaggingContext } from '../context/tagging'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

interface PairingRecord {
  id: number
  fightNumber: number
  mayronEntry: string
  mayronHandler: string
  mayronWeight: string
  mayronBetting: string
  walaEntry: string
  walaHandler: string
  walaWeight: string
  walaBetting: string
  diferencia: string
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

const INITIAL_PAIRINGS: PairingRecord[] = [
  { id: 1, fightNumber: 1, mayronEntry: 'Juan Dela Cruz', mayronHandler: 'Carlos Santos', mayronWeight: '47 lbs', mayronBetting: '2000', walaEntry: 'Maria Garcia', walaHandler: 'Pedro Ramirez', walaWeight: '46 lbs', walaBetting: '2000', diferencia: '₱0' },
  { id: 2, fightNumber: 2, mayronEntry: 'Antonio Reyes', mayronHandler: 'Miguel Torres', mayronWeight: '73 lbs', mayronBetting: '3500', walaEntry: 'Rosa Lopez', walaHandler: 'Juan Mendoza', walaWeight: '72 lbs', walaBetting: '3500', diferencia: '₱0' },
  { id: 3, fightNumber: 3, mayronEntry: 'Francisco Diaz', mayronHandler: 'Luis Fernandez', mayronWeight: '62 lbs', mayronBetting: '2750', walaEntry: 'Angela Morales', walaHandler: 'Ricardo Gutierrez', walaWeight: '61 lbs', walaBetting: '3000', diferencia: '₱250' },
]

function Results() {
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_EVENTS[0].name)
  const { taggedFights } = useContext(TaggingContext)!

  const sortedEvents = useMemo(() => {
    return [...INITIAL_EVENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const eventResults = useMemo(() => {
    return INITIAL_PAIRINGS.filter((pairing) => {
      const event = INITIAL_EVENTS.find(e => e.name === selectedEvent)
      if (!event) return false
      const taggedFight = taggedFights.find((f) => f.pairingId === pairing.id)
      return taggedFight && taggedFight.status === 'tagged'
    }).sort((a, b) => b.fightNumber - a.fightNumber)
  }, [taggedFights, selectedEvent])

  const getOutcomeEmoji = (outcome?: string) => {
    switch (outcome) {
      case 'mayronWinner':
        return '✓'
      case 'walaWinner':
        return '✓'
      case 'draw':
        return '⚔️'
      case 'cancelled':
        return '❌'
      default:
        return '?'
    }
  }

  const getOutcomeText = (pairingId: number) => {
    const fight = taggedFights.find((f) => f.pairingId === pairingId)
    if (!fight) return '—'

    if (fight.outcome === 'draw') return '0 - 0'
    if (fight.outcome === 'cancelled') return 'N/A'
    if (fight.outcome === 'winner' || fight.outcome === 'loser') {
      if (fight.outcomeWinner === 'mayron') return '1 - 0'
      if (fight.outcomeWinner === 'wala') return '0 - 1'
    }
    
    return '—'
  }

  const summary = useMemo(() => {
    const wins = eventResults.filter((p) => {
      const fight = taggedFights.find((f) => f.pairingId === p.id)
      return fight?.outcome === 'winner' || fight?.outcome === 'loser'
    }).length

    const draws = eventResults.filter((p) => {
      const fight = taggedFights.find((f) => f.pairingId === p.id)
      return fight?.outcome === 'draw'
    }).length

    const cancelled = eventResults.filter((p) => {
      const fight = taggedFights.find((f) => f.pairingId === p.id)
      return fight?.outcome === 'cancelled'
    }).length

    return { wins, draws, cancelled, total: eventResults.length }
  }, [eventResults, taggedFights])

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fight Results - ${selectedEvent}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
          h1 { text-align: center; margin-bottom: 10px; }
          .event-info { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8f8f8; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
          td { padding: 10px 12px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .result-cell { text-align: center; font-weight: bold; }
          .summary { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 0.9rem; color: #666; margin-bottom: 8px; }
          .summary-value { font-size: 1.3rem; font-weight: bold; color: #333; }
          .outcome-badge { padding: 4px 8px; border-radius: 3px; font-size: 0.9rem; }
          .winner { background: #e8f5e9; color: #2e7d32; }
          .draw { background: #fff3e0; color: #e65100; }
          .cancelled { background: #ffebee; color: #c62828; }
        </style>
      </head>
      <body>
        <h1>FIGHT RESULTS</h1>
        <div class="event-info">${selectedEvent}</div>
        <table>
          <thead>
            <tr>
              <th>Sultada</th>
              <th>Mayron Entry</th>
              <th>Mayron Handler</th>
              <th>Wala Entry</th>
              <th>Wala Handler</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${eventResults.map((pairing) => {
              const fight = taggedFights.find((f) => f.pairingId === pairing.id)
              const outcomeText = getOutcomeText(pairing.id)
              return `
                <tr>
                  <td>${pairing.fightNumber}</td>
                  <td>${pairing.mayronEntry}</td>
                  <td>${pairing.mayronHandler}</td>
                  <td>${pairing.walaEntry}</td>
                  <td>${pairing.walaHandler}</td>
                  <td class="result-cell">${outcomeText}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Fights</div>
              <div class="summary-value">${summary.total}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Decisive</div>
              <div class="summary-value">${summary.wins}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Draws</div>
              <div class="summary-value">${summary.draws}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Cancelled</div>
              <div class="summary-value">${summary.cancelled}</div>
            </div>
          </div>
        </div>
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
        <h1>Results</h1>
        <p>View fight results and outcomes</p>
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
          <button className="btn-add-event" onClick={handlePrint}>
            🖨️ Print Results
          </button>
        </div>

        {eventResults.length === 0 ? (
          <p style={{ marginTop: '2rem', color: '#666' }}>No tagged results for this event yet.</p>
        ) : (
          <>
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Fights</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{summary.total}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Decisive</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>{summary.wins}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Draws</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e65100' }}>{summary.draws}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Cancelled</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c62828' }}>{summary.cancelled}</div>
                </div>
              </div>
            </div>

            <div className="events-table-wrapper">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Sultada</th>
                    <th>Mayron Entry</th>
                    <th>Mayron Handler</th>
                    <th>Wala Entry</th>
                    <th>Wala Handler</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {eventResults.map((pairing) => {
                    const fight = taggedFights.find((f) => f.pairingId === pairing.id)
                    const outcomeText = getOutcomeText(pairing.id)
                    return (
                      <tr key={pairing.id}>
                        <td>{pairing.fightNumber}</td>
                        <td>{pairing.mayronEntry}</td>
                        <td>{pairing.mayronHandler}</td>
                        <td>{pairing.walaEntry}</td>
                        <td>{pairing.walaHandler}</td>
                        <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{outcomeText}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Results
