import { useMemo, useContext } from 'react'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'
import './Results.css'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

type GameResultRow = {
  id: string
  fightNumber: number
  mayronEntry: string
  mayronBetting: string
  walaEntry: string
  walaBetting: string
  diferencia: string
  result: string
  resultType: 'mayron' | 'wala' | 'draw' | 'cancelled'
  outcome: string
}

const displayValue = (value: string | number | undefined) => {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  return String(value)
}

const displayPeso = (value: string | number | undefined) => {
  const display = displayValue(value)
  return display === '-' ? display : `PHP ${display}`
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

  const eventResults = useMemo<GameResultRow[]>(() => {
    const getGameResult = (outcome: string | undefined, winner: string | undefined) => {
      if (outcome === 'draw') {
        return { result: 'Draw', resultType: 'draw' as const }
      }

      if (outcome === 'cancelled') {
        return { result: 'Cancelled', resultType: 'cancelled' as const }
      }

      if ((outcome === 'winner' || outcome === 'loser') && winner) {
        return winner === 'mayron'
          ? { result: 'Mayron wins', resultType: 'mayron' as const }
          : { result: 'Wala wins', resultType: 'wala' as const }
      }

      return { result: '-', resultType: 'cancelled' as const }
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
        const gameResult = getGameResult(fight.outcome, fight.outcomeWinner)

        return {
          id: String(pairing.id),
          fightNumber: pairing.fight_number,
          mayronEntry: mayronMember?.entry_name || 'N/A',
          mayronBetting: displayPeso(pairing.mayron_betting),
          walaEntry: walaMember?.entry_name || 'N/A',
          walaBetting: displayPeso(pairing.wala_betting),
          diferencia: displayPeso(pairing.diferencia),
          result: gameResult.result,
          resultType: gameResult.resultType,
          outcome: fight.outcome || ''
        }
      })
      .filter((row): row is GameResultRow => Boolean(row))
      .sort((a, b) => b.fightNumber - a.fightNumber)
  }, [events, members, pairings, selectedEventId, taggedFights])

  const summary = useMemo(() => {
    const wins = eventResults.filter(row => row.outcome === 'winner' || row.outcome === 'loser').length
    const draws = eventResults.filter(row => row.outcome === 'draw').length
    const cancelled = eventResults.filter(row => row.outcome === 'cancelled').length

    return { wins, draws, cancelled, total: eventResults.length }
  }, [eventResults])

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fight Results - ${selectedEventLabel}</title>
        <style>
          @page { size: auto; margin: 10mm; }
          body { font-family: Arial, sans-serif; margin: 0; background: white; color: #111; font-size: 11px; }
          h1 { text-align: center; margin: 0 0 4px; font-size: 18px; letter-spacing: 0.5px; }
          .event-info { text-align: center; margin-bottom: 8px; color: #555; font-size: 11px; }
          .summary { display: flex; justify-content: center; gap: 14px; margin: 0 0 8px; font-size: 10px; color: #333; }
          .summary strong { font-size: 12px; color: #111; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th { background: #f1f1f1; padding: 5px 7px; text-align: left; border: 1px solid #ccc; font-weight: 700; }
          td { padding: 4px 7px; border: 1px solid #ccc; line-height: 1.2; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          tr:nth-child(even) { background: #fafafa; }
          .fight-cell { width: 54px; text-align: center; font-weight: 700; }
          .entry-name { font-weight: 600; }
          .betting-cell { width: 122px; font-size: 10px; }
          .betting-line { display: flex; justify-content: space-between; gap: 8px; }
          .betting-line strong { font-weight: 700; }
          .result-cell { width: 110px; text-align: center; font-weight: 700; }
          .result-mayron, .result-wala { color: #1f6f3f; }
          .result-draw { color: #a65f00; }
          .result-cancelled { color: #a32020; }
        </style>
      </head>
      <body>
        <h1>FIGHT RESULTS</h1>
        <div class="event-info">${selectedEventLabel}</div>
        <div class="summary">
          <span>Total: <strong>${summary.total}</strong></span>
          <span>Decisive: <strong>${summary.wins}</strong></span>
          <span>Draws: <strong>${summary.draws}</strong></span>
          <span>Cancelled: <strong>${summary.cancelled}</strong></span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sultada</th>
              <th>Mayron</th>
              <th>Wala</th>
              <th>Betting</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${eventResults.map((row) => `
              <tr>
                <td class="fight-cell">${row.fightNumber}</td>
                <td class="entry-name">${row.mayronEntry}</td>
                <td class="entry-name">${row.walaEntry}</td>
                <td class="betting-cell">
                  <span class="betting-line"><strong>M</strong> ${row.mayronBetting}</span>
                  <span class="betting-line"><strong>W</strong> ${row.walaBetting}</span>
                  <span class="betting-line"><strong>Dif</strong> ${row.diferencia}</span>
                </td>
                <td class="result-cell result-${row.resultType}">${row.result}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
        <p>View the final result of each game</p>
        <div className="results-toolbar">
          <div className="results-event-filter">
            <label htmlFor="resultsEventSelect">Select Event</label>
            <select
              id="resultsEventSelect"
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
          <button className="btn-add-event results-print-button" onClick={handlePrint}>
            Print Results
          </button>
        </div>

        {eventResults.length === 0 ? (
          <p style={{ marginTop: '2rem', color: '#666' }}>No tagged results for this event yet.</p>
        ) : (
          <>
            <div className="results-summary">
              <div className="results-summary-item">
                <span>Total Fights</span>
                <strong>{summary.total}</strong>
              </div>
              <div className="results-summary-item results-summary-win">
                <span>Decisive</span>
                <strong>{summary.wins}</strong>
              </div>
              <div className="results-summary-item results-summary-draw">
                <span>Draws</span>
                <strong>{summary.draws}</strong>
              </div>
              <div className="results-summary-item results-summary-cancelled">
                <span>Cancelled</span>
                <strong>{summary.cancelled}</strong>
              </div>
            </div>

            <div className="events-table-wrapper results-table-wrapper">
              <table className="events-table results-table">
                <thead>
                  <tr>
                    <th>Sultada</th>
                    <th>Mayron</th>
                    <th>Wala</th>
                    <th>Betting</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {eventResults.map((row) => (
                    <tr key={row.id}>
                      <td className="results-fight-number">{row.fightNumber}</td>
                      <td>
                        <span className="results-side-label">M</span>
                        <span className="results-entry-name">{row.mayronEntry}</span>
                      </td>
                      <td>
                        <span className="results-side-label results-side-label-wala">W</span>
                        <span className="results-entry-name">{row.walaEntry}</span>
                      </td>
                      <td>
                        <div className="results-betting-stack">
                          <span><strong>M</strong>{row.mayronBetting}</span>
                          <span><strong>W</strong>{row.walaBetting}</span>
                          <span><strong>Dif</strong>{row.diferencia}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`results-badge results-badge-${row.resultType}`}>
                          {row.result}
                        </span>
                      </td>
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
