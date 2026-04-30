import './Registration.css'
import { useState, useMemo, useContext, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'

type ReportRow = {
  fightNumber: number
  entryName: string
  handlerName: string
  winningBet: number
  operatorsShare: number
  lguShare: number
  largada: number
  netWinnings: number
  dateReleased: string
}

const tableHeaderStyle = {
  padding: '1rem',
  fontWeight: '700',
  fontSize: '0.85rem',
  borderBottom: '2px solid #f2c7cf',
  color: '#333',
  backgroundColor: '#fff5f7',
  textTransform: 'uppercase' as const
}

const currencyCellStyle = {
  padding: '1rem',
  textAlign: 'right' as const,
  fontSize: '0.95rem'
}

function Reports() {
  const { events, members, pairings } = useData()
  const [selectedEvent, setSelectedEvent] = useState('')

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

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Reports must be used within TaggingProvider')
  }
  const { taggedFights, releasedFights } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const reportData = useMemo<ReportRow[]>(() => {
    const event = events.find(e => e.name === selectedEvent)
    if (!event) {
      return []
    }

    return pairings
      .filter((p) => p.event_id === event.id)
      .map(pairing => {
        const tagged = taggedFights.find(t => t.pairingId === pairing.id)
        const released = releasedFights.find(r => r.pairingId === pairing.id)

        if (!tagged || !released || released.releaseStatus !== 'released') {
          return null
        }

        // Look up member names from IDs
        const mayronMember = members.find(m => m.id === pairing.mayron_entry_id)
        const walaMember = members.find(m => m.id === pairing.wala_entry_id)

        const winnerBetting = tagged.outcomeWinner === 'mayron'
          ? pairing.mayron_betting
          : pairing.wala_betting
        const winnerEntry = tagged.outcomeWinner === 'mayron'
          ? mayronMember?.entry_name || 'N/A'
          : walaMember?.entry_name || 'N/A'
        const winnerHandler = tagged.outcomeWinner === 'mayron'
          ? pairing.mayron_handler
          : pairing.wala_handler

        const winningBetNum = parseFloat(String(winnerBetting).replace(/,/g, ''))
        const operatorsShare = winningBetNum * 0.10
        const lguShare = winningBetNum * 0.01
        const largada = 500
        const netWinnings = winningBetNum - operatorsShare - lguShare - largada

        return {
          fightNumber: pairing.fight_number,
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
      .filter((row): row is ReportRow => row !== null)
      .sort((a, b) => b.fightNumber - a.fightNumber)
  }, [pairings, selectedEvent, events, members, taggedFights, releasedFights])

  const totals = useMemo(() => {
    return {
      operatorsShare: reportData.reduce((sum, r) => sum + r.operatorsShare, 0),
      lguShare: reportData.reduce((sum, r) => sum + r.lguShare, 0),
      largada: reportData.reduce((sum, r) => sum + r.largada, 0),
      netWinnings: reportData.reduce((sum, r) => sum + r.netWinnings, 0)
    }
  }, [reportData])

  const handlePrintReport = () => {
    const printWindow = window.open('', '', 'height=800,width=1200')
    if (printWindow) {
      const tableRows = reportData.map(row => `
        <tr>
          <td>${row.fightNumber}</td>
          <td>${row.entryName}</td>
          <td>${row.handlerName}</td>
          <td>₱${row.winningBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row.operatorsShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row.lguShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row.largada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>₱${row.netWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${row.dateReleased}</td>
        </tr>
      `).join('')

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reports - ${selectedEvent}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; color: #333; }
            h1 { text-align: center; margin-bottom: 1rem; color: #e94560; }
            .subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #fff5f7; color: #333; padding: 0.8rem; text-align: left; font-weight: 700; border: 1px solid #f2c7cf; }
            td { padding: 0.8rem; border: 1px solid #ddd; }
            tr:nth-child(even) { background: #fffafb; }
            tr.total { background: #e94560; color: white; font-weight: 700; }
            tr.total td { border: 1px solid #d63047; }
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

        <div style={{ display: 'flex', gap: '1rem', margin: '0.75rem auto 2rem', alignItems: 'flex-end', width: '100%', maxWidth: '1000px', justifyContent: 'space-between' }}>
          <div style={{ flex: '0 0 220px', textAlign: 'center' }}>
            <label htmlFor="eventSelect" style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.8rem', fontWeight: '600', color: '#333' }}>Select Event</label>
            <select
              id="eventSelect"
              className="form-input"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{ width: '220px', maxWidth: '220px', textAlign: 'center' }}
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
              padding: '0.7rem 1rem',
              backgroundColor: '#2e7d32',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              height: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#256b2b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2e7d32'}
          >
            Print Report
          </button>
        </div>

        {reportData.length > 0 ? (
          <div style={{ overflowX: 'auto', marginBottom: '2rem', width: '100%', maxWidth: '1200px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#fff',
              boxShadow: '0 6px 18px rgba(233, 69, 96, 0.08)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid #f1d3d8'
            }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>Fight Number</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>Entry Name</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'left' }}>Handler Name</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Winning Bet</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Operators Share</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>LGU Share</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Largada</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Net Winnings Released</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Date Released</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f0d7dc', backgroundColor: idx % 2 === 0 ? '#fff' : '#fffafb' }}>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{row.fightNumber}</td>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{row.entryName}</td>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>{row.handlerName}</td>
                    <td style={currencyCellStyle}>₱{row.winningBet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={currencyCellStyle}>₱{row.operatorsShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={currencyCellStyle}>₱{row.lguShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={currencyCellStyle}>₱{row.largada.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ ...currencyCellStyle, fontWeight: '700', color: 'var(--accent-red)' }}>₱{row.netWinnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.95rem' }}>{row.dateReleased}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: 'var(--accent-red)', color: '#fff', fontWeight: '700' }}>
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
