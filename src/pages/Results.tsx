import { useMemo, useContext } from 'react'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

type ResultRow = {
  id: string
  pairingId: number
  fightNumber: number
  entryName: string
  side: string
  opponent: string
  opponentSide: string
  result: string
  resultColor: string
  outcome: string
}

function Results() {
  const { events, members, pairings, selectedEventId, setSelectedEventId } = useData()

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Results must be used within TaggingProvider')
  }
  const { taggedFights } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const selectedEvent = useMemo(() => {
    return events.find((event) => String(event.id) === selectedEventId)
  }, [events, selectedEventId])

  const selectedEventLabel = selectedEvent ? formatEventOption(selectedEvent) : ''

  const eventResults = useMemo<ResultRow[]>(() => {
    const getEntryResult = (outcome: string | undefined, winner: string | undefined, side: 'mayron' | 'wala') => {
      if (outcome === 'draw') {
        return { result: 'Draw', resultColor: '#e65100' }
      }

      if (outcome === 'cancelled') {
        return { result: 'Cancelled', resultColor: '#c62828' }
      }

      if ((outcome === 'winner' || outcome === 'loser') && winner) {
        return winner === side
          ? { result: 'Win', resultColor: '#2e7d32' }
          : { result: 'Loss', resultColor: '#555' }
      }

      return { result: '-', resultColor: '#777' }
    }

    const event = events.find(e => String(e.id) === selectedEventId)
    if (!event) {
      return []
    }

    return pairings
      .filter(pairing => pairing.event_id === event.id)
      .map(pairing => {
        const fight = taggedFights.find((f) => f.pairingId === pairing.id)
        if (!fight || fight.status !== 'tagged') {
          return null
        }

        const mayronMember = members.find(m => m.id === pairing.mayron_entry_id)
        const walaMember = members.find(m => m.id === pairing.wala_entry_id)

        const mayronResult = getEntryResult(fight.outcome, fight.outcomeWinner, 'mayron')
        const walaResult = getEntryResult(fight.outcome, fight.outcomeWinner, 'wala')

        return [
          {
            id: `${pairing.id}-mayron`,
            pairingId: pairing.id,
            fightNumber: pairing.fight_number,
            entryName: mayronMember?.entry_name || 'N/A',
            side: 'Mayron',
            opponent: walaMember?.entry_name || 'N/A',
            opponentSide: 'Wala',
            result: mayronResult.result,
            resultColor: mayronResult.resultColor,
            outcome: fight.outcome || ''
          },
          {
            id: `${pairing.id}-wala`,
            pairingId: pairing.id,
            fightNumber: pairing.fight_number,
            entryName: walaMember?.entry_name || 'N/A',
            side: 'Wala',
            opponent: mayronMember?.entry_name || 'N/A',
            opponentSide: 'Mayron',
            result: walaResult.result,
            resultColor: walaResult.resultColor,
            outcome: fight.outcome || ''
          }
        ]
      })
      .flatMap((row) => row ?? [])
      .sort((a, b) => b.fightNumber - a.fightNumber)
  }, [events, members, pairings, selectedEventId, taggedFights])

  const summary = useMemo(() => {
    const uniqueFightRows = eventResults.filter((row, index, rows) => {
      return rows.findIndex((item) => item.pairingId === row.pairingId) === index
    })
    const wins = uniqueFightRows.filter(row => row.outcome === 'winner' || row.outcome === 'loser').length
    const draws = uniqueFightRows.filter(row => row.outcome === 'draw').length
    const cancelled = uniqueFightRows.filter(row => row.outcome === 'cancelled').length

    return { wins, draws, cancelled, total: uniqueFightRows.length }
  }, [eventResults])

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fight Results - ${selectedEventLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
          h1 { text-align: center; margin-bottom: 10px; }
          .event-info { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8f8f8; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
          td { padding: 10px 12px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
          .result-cell { text-align: left; font-weight: bold; }
          .entry-name { font-weight: 600; }
          .side-cell { text-align: left; }
          .summary { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 0.9rem; color: #666; margin-bottom: 8px; }
          .summary-value { font-size: 1.3rem; font-weight: bold; color: #333; }
        </style>
      </head>
      <body>
        <h1>FIGHT RESULTS</h1>
        <div class="event-info">${selectedEventLabel}</div>
        <table>
          <thead>
            <tr>
              <th>Sultada</th>
              <th>Entry Name</th>
              <th>Side</th>
              <th>Opponent</th>
              <th>Opponent Side</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${eventResults.map((row) => `
              <tr>
                <td>${row.fightNumber}</td>
                <td class="entry-name">${row.entryName}</td>
                <td class="side-cell">${row.side}</td>
                <td>${row.opponent}</td>
                <td class="side-cell">${row.opponentSide}</td>
                <td class="result-cell" style="color: ${row.resultColor};">${row.result}</td>
              </tr>
            `).join('')}
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
        <div style={{ display: 'flex', gap: '1rem', margin: '0.75rem auto 0', alignItems: 'flex-end', width: '100%', maxWidth: '1000px', justifyContent: 'space-between' }}>
          <div style={{ flex: '0 0 220px', textAlign: 'center' }}>
            <label htmlFor="resultsEventSelect" style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.8rem', fontWeight: '600', color: '#333' }}>Select Event</label>
            <select
              id="resultsEventSelect"
              className="form-input"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ width: '220px', maxWidth: '220px', textAlign: 'center' }}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={String(event.id)}>
                  {formatEventOption(event)}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-add-event"
            onClick={handlePrint}
            style={{
              backgroundColor: '#2e7d32',
              height: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#256b2b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2e7d32'}
          >
            Print Results
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
                    <th>Entry Name</th>
                    <th>Side</th>
                    <th>Opponent</th>
                    <th>Opponent Side</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {eventResults.map((row) => (
                    <tr key={row.id}>
                      <td>{row.fightNumber}</td>
                      <td style={{ fontWeight: '600' }}>{row.entryName}</td>
                      <td>{row.side}</td>
                      <td>{row.opponent}</td>
                      <td>{row.opponentSide}</td>
                      <td style={{ fontWeight: 'bold', color: row.resultColor }}>{row.result}</td>
                    </tr>
                  ))}
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
