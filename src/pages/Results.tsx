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
  eventName: string
  entryName: string
  firstFight: string
  secondFight: string
  thirdFight: string
  result: string
  totalWins: number
  firstFightNumber: number
}

const escapeHtml = (value: string | number) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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
    const event = events.find(e => String(e.id) === selectedEventId)
    if (!event) {
      return []
    }

    const getFightMark = (
      side: 'mayron' | 'wala',
      outcome: string | undefined,
      winner: string | undefined
    ) => {
      if (outcome === 'draw') return 'D'
      if (outcome === 'cancelled') return 'C'
      if ((outcome === 'winner' || outcome === 'loser') && winner) {
        return winner === side ? 'W' : 'L'
      }

      return '-'
    }

    return members
      .filter(member => member.event_id === event.id || member.event_name === event.name)
      .map(member => {
        const memberFights = pairings
          .filter(pairing => pairing.event_id === event.id)
          .map(pairing => {
            const side = pairing.mayron_entry_id === member.id
              ? 'mayron'
              : pairing.wala_entry_id === member.id
                ? 'wala'
                : null
            const fight = taggedFights.find((f) => f.pairingId === pairing.id)

            if (!side || !fight || fight.status !== 'tagged') {
              return null
            }

            return {
              fightNumber: pairing.fight_number,
              mark: getFightMark(side, fight.outcome, fight.outcomeWinner)
            }
          })
          .filter((fight): fight is { fightNumber: number; mark: string } => Boolean(fight))
          .sort((a, b) => a.fightNumber - b.fightNumber)

        if (memberFights.length === 0) {
          return null
        }

        const fightMarks = memberFights.slice(0, 3).map(fight => fight.mark)
        const totalWins = fightMarks.filter(mark => mark === 'W').length

        return {
          id: String(member.id),
          eventName: event.name,
          entryName: member.entry_name,
          firstFight: fightMarks[0] || '-',
          secondFight: fightMarks[1] || '-',
          thirdFight: fightMarks[2] || '-',
          result: fightMarks.length ? fightMarks.join('') : '-',
          totalWins,
          firstFightNumber: memberFights[0].fightNumber
        }
      })
      .filter((row): row is GameResultRow => Boolean(row))
      .sort((a, b) => a.firstFightNumber - b.firstFightNumber || a.entryName.localeCompare(b.entryName))
  }, [events, members, pairings, selectedEventId, taggedFights])

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fight Results - ${escapeHtml(selectedEventLabel)}</title>
        <style>
          @page { size: auto; margin: 10mm; }
          body { font-family: Arial, sans-serif; margin: 0; background: white; color: #111; font-size: 11px; }
          h1 { text-align: center; margin: 0 0 4px; font-size: 18px; letter-spacing: 0.5px; }
          .event-info { text-align: center; margin-bottom: 8px; color: #555; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th { background: #f1f1f1; padding: 5px 7px; text-align: left; border: 1px solid #ccc; font-weight: 700; }
          td { padding: 5px 7px; border: 1px solid #ccc; line-height: 1.2; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          tr:nth-child(even) { background: #fafafa; }
          .event-cell strong { display: block; }
          .event-cell span { display: block; color: #555; font-size: 10px; margin-top: 2px; }
          .fight-cell, .result-cell, .wins-cell { text-align: center; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>FIGHT RESULTS</h1>
        <div class="event-info">${escapeHtml(selectedEventLabel)}</div>
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>First Fight</th>
              <th>2nd Fight</th>
              <th>3rd Fight</th>
              <th>Result</th>
              <th>Total Wins</th>
            </tr>
          </thead>
          <tbody>
            ${eventResults.map((row) => `
              <tr>
                <td class="event-cell"><strong>${escapeHtml(row.eventName)}</strong><span>${escapeHtml(row.entryName)}</span></td>
                <td class="fight-cell">${row.firstFight}</td>
                <td class="fight-cell">${row.secondFight}</td>
                <td class="fight-cell">${row.thirdFight}</td>
                <td class="result-cell">${row.result}</td>
                <td class="wins-cell">${row.totalWins}</td>
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
            <div className="events-table-wrapper results-table-wrapper">
              <table className="events-table results-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>1st Fight</th>
                    <th>2nd Fight</th>
                    <th>3rd Fight</th>
                    <th>Result</th>
                    <th>Total Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {eventResults.map((row) => (
                    <tr key={row.id}>
                      <td className="results-event-name">
                        <strong>{row.eventName}</strong>
                        <span>{row.entryName}</span>
                      </td>
                      <td><span className={`results-mark results-mark-${row.firstFight.toLowerCase()}`}>{row.firstFight}</span></td>
                      <td><span className={`results-mark results-mark-${row.secondFight.toLowerCase()}`}>{row.secondFight}</span></td>
                      <td><span className={`results-mark results-mark-${row.thirdFight.toLowerCase()}`}>{row.thirdFight}</span></td>
                      <td className="results-result-text">{row.result}</td>
                      <td className="results-total-wins">{row.totalWins}</td>
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
