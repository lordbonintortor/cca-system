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
]

const INITIAL_PAIRINGS: PairingRecord[] = [
  {
    id: 1,
    fightNumber: 2,
    mayronEntry: 'Victor Martinez',
    mayronHandler: 'Alex Torres',
    mayronWeight: '48',
    mayronBetting: '5,000',
    walaEntry: 'Sophia Gonzales',
    walaHandler: 'Mark Fernandez',
    walaWeight: '47',
    walaBetting: '4,500',
    diferencia: '500'
  },
  {
    id: 2,
    fightNumber: 1,
    mayronEntry: 'Juan Dela Cruz',
    mayronHandler: 'Carlos Santos',
    mayronWeight: '49',
    mayronBetting: '6,000',
    walaEntry: 'Victor Martinez',
    walaHandler: 'Alex Torres',
    walaWeight: '48',
    walaBetting: '5,500',
    diferencia: '500'
  }
]

function Reports() {
  const [events] = useState<Event[]>(INITIAL_EVENTS)
  const [pairings] = useState<PairingRecord[]>(INITIAL_PAIRINGS)
  const [selectedEvent, setSelectedEvent] = useState('Monday Night Match')

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Reports must be used within TaggingProvider')
  }
  const { taggedFights, releasedFights } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const reportData = useMemo(() => {
    return pairings
      .filter(() => {
        const event = events.find(e => e.name === selectedEvent)
        return event !== undefined
      })
      .map(pairing => {
        const tagged = taggedFights.find(t => t.pairingId === pairing.id)
        const released = releasedFights.find(r => r.pairingId === pairing.id)

        if (!tagged || !released || released.releaseStatus !== 'released') {
          return null
        }

        const winnerBetting = tagged.outcomeWinner === 'mayron'
          ? pairing.mayronBetting
          : pairing.walaBetting
        const winnerEntry = tagged.outcomeWinner === 'mayron'
          ? pairing.mayronEntry
          : pairing.walaEntry
        const winnerHandler = tagged.outcomeWinner === 'mayron'
          ? pairing.mayronHandler
          : pairing.walaHandler

        const winningBetNum = parseFloat(winnerBetting.replace(/,/g, ''))
        const operatorsShare = winningBetNum * 0.10
        const lguShare = winningBetNum * 0.01
        const largada = 500
        const netWinnings = winningBetNum - operatorsShare - lguShare - largada

        return {
          fightNumber: pairing.fightNumber,
          entryName: winnerEntry,
          handlerName: winnerHandler,
          winningBet: winningBetNum,
          operatorsShare,
          lguShare,
          largada,
          netWinnings,
          dateReleased: released.releasedAt ? new Date(released.releasedAt).toISOString().split('T')[0] : '-'
        }
      })
      .filter(Boolean)
      .sort((a, b) => a!.fightNumber - b!.fightNumber)
  }, [pairings, selectedEvent, events, taggedFights, releasedFights])

  const totals = useMemo(() => {
    return {
      operatorsShare: reportData.reduce((sum, r) => sum + r!.operatorsShare, 0),
      lguShare: reportData.reduce((sum, r) => sum + r!.lguShare, 0),
      largada: reportData.reduce((sum, r) => sum + r!.largada, 0),
      netWinnings: reportData.reduce((sum, r) => sum + r!.netWinnings, 0)
    }
  }, [reportData])

  const handlePrintReport = () => {
    const printWindow = window.open('', '', 'height=800,width=1200')
    if (printWindow) {
      const tableRows = reportData.map(row => `
        <tr>
          <td>${row!.fightNumber}</td>
          <td>${row!.entryName}</td>
          <td>${row!.handlerName}</td>
          <td>₱${row!.winningBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row!.operatorsShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row!.lguShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row!.largada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row!.netWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${row!.dateReleased}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reports - ${selectedEvent}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; }
            h1 { text-align: center; margin-bottom: 1rem; }
            .subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #333; color: white; padding: 0.8rem; text-align: left; font-weight: 600; border: 1px solid #999; }
            td { padding: 0.8rem; border: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
            tr.total { background: #333; color: white; font-weight: 600; }
            tr.total td { border: 1px solid #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>Reports Information</h1>
          <div class="subtitle">${selectedEvent}</div>
          <table>
            <thead>
              <tr>
                <th>Fight Number</th>
                <th>Entry Name</th>
                <th>Handler Name</th>
                <th>Winning Bet</th>
                <th>Operators Share</th>
                <th>LGU Share</th>
                <th>Largada</th>
                <th>Net Winnings Released</th>
                <th>Date Released</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total">
                <td colspan="3">TOTAL:</td>
                <td></td>
                <td>₱${totals.operatorsShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>₱${totals.lguShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>₱${totals.largada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>₱${totals.netWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => printWindow.print(), 250)
    }
  }

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Reports Information</h1>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 300px' }}>
            <label htmlFor="eventSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Select Event</label>
            <select
              id="eventSelect"
              className="form-input"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ width: '100%' }}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={event.name}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintReport}
            style={{
              padding: '0.8rem 1.2rem',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              height: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
          >
            🖨️ Print Report
          </button>
        </div>

        {reportData.length > 0 ? (
          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: '#fff' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Fight Number</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Entry Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Handler Name</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Winning Bet</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Operators Share</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>LGU Share</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Largada</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Net Winnings Released</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem', borderBottom: '2px solid #555' }}>Date Released</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{row!.fightNumber}</td>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{row!.entryName}</td>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{row!.handlerName}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.95rem' }}>₱{row!.winningBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.95rem' }}>₱{row!.operatorsShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.95rem' }}>₱{row!.lguShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.95rem' }}>₱{row!.largada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontSize: '0.95rem', fontWeight: '600', color: '#2e7d32' }}>₱{row!.netWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.95rem' }}>{row!.dateReleased}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#333', color: '#fff', fontWeight: '600' }}>
                  <td colSpan={3} style={{ padding: '1rem', textAlign: 'right' }}>TOTAL:</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>₱{totals.operatorsShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>₱{totals.lguShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>₱{totals.largada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>₱{totals.netWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            <p>No released fights found for this event.</p>
          </div>
        )}
      </div>

      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Reports
