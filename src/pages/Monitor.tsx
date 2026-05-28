import { useContext, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'
import type { TaggedFight } from '../context/tagging'
import './Monitor.css'

type WinnerMark = 'M' | 'W' | 'N'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

const getWinnerMark = (fight: TaggedFight): WinnerMark => {
  if (fight.outcomeWinner === 'mayron') return 'M'
  if (fight.outcomeWinner === 'wala') return 'W'
  return 'N'
}

const getTrend = (marks: WinnerMark[]) => {
  const decisiveMarks = marks.filter((mark) => mark === 'M' || mark === 'W')
  const latestFive = decisiveMarks.slice(-5)
  const latestThree = decisiveMarks.slice(-3)

  if (latestThree.length < 3) {
    return {
      pattern: latestFive.join('-') || '-',
      trend: 'No clear trend',
      lean: 'Hindi pa klaro'
    }
  }

  const latest = latestThree[latestThree.length - 1]
  const isStreak = latestThree.every((mark) => mark === latest)
  const isAlternating = latestThree.every((mark, index) => index === 0 || mark !== latestThree[index - 1])

  if (isStreak) {
    return {
      pattern: latestFive.join('-'),
      trend: latest === 'M' ? 'Mayron streak' : 'Wala streak',
      lean: latest === 'M' ? 'Mayron' : 'Wala'
    }
  }

  if (isAlternating) {
    return {
      pattern: latestFive.join('-'),
      trend: 'Alternating',
      lean: latest === 'M' ? 'Wala' : 'Mayron'
    }
  }

  return {
    pattern: latestFive.join('-'),
    trend: 'No clear trend',
    lean: 'Hindi pa klaro'
  }
}

function Monitor() {
  const navigate = useNavigate()
  const { events, pairings, selectedEventId, setSelectedEventId, refreshData } = useData()

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Monitor must be used within TaggingProvider')
  }
  const { taggedFights } = context

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshData()
    }, 10000)

    return () => window.clearInterval(interval)
  }, [refreshData])

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const selectedEvent = useMemo(() => {
    return events.find((event) => String(event.id) === selectedEventId) || sortedEvents[0]
  }, [events, selectedEventId, sortedEvents])

  const monitorRows = useMemo(() => {
    if (!selectedEvent) return []

    return pairings
      .filter((pairing) => pairing.event_id === selectedEvent.id)
      .map((pairing) => {
        const tag = taggedFights.find((fight) => fight.pairingId === pairing.id)
        if (!tag || tag.status !== 'tagged') return null

        return {
          fightNumber: pairing.fight_number,
          mark: getWinnerMark(tag)
        }
      })
      .filter((row): row is { fightNumber: number; mark: WinnerMark } => row !== null)
      .sort((a, b) => a.fightNumber - b.fightNumber)
  }, [pairings, selectedEvent, taggedFights])

  const latestPattern = monitorRows.slice(-12)
  const latestFight = latestPattern[latestPattern.length - 1]
  const trend = getTrend(monitorRows.map((row) => row.mark))

  const summary = useMemo(() => {
    return {
      mayron: monitorRows.filter((row) => row.mark === 'M').length,
      wala: monitorRows.filter((row) => row.mark === 'W').length,
      neutral: monitorRows.filter((row) => row.mark === 'N').length
    }
  }, [monitorRows])

  const latestResultLabel = latestFight
    ? latestFight.mark === 'M'
      ? 'Mayron wins'
      : latestFight.mark === 'W'
        ? 'Wala wins'
        : 'Draw / Cancelled'
    : 'Waiting for tagged results'

  return (
    <div className="monitor-screen">
      <header className="monitor-header">
        <div>
          <span>Live Monitor</span>
          <h1>{selectedEvent?.name || 'No event selected'}</h1>
          <p>{selectedEvent ? new Date(selectedEvent.date).toLocaleDateString() : '-'}</p>
        </div>
        <div className="monitor-controls">
          <select
            value={selectedEvent ? String(selectedEvent.id) : ''}
            onChange={(event) => setSelectedEventId(event.target.value)}
          >
            {sortedEvents.map((event) => (
              <option key={event.id} value={String(event.id)}>
                {formatEventOption(event)}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => navigate('/dashboard')}>
            Admin
          </button>
        </div>
      </header>

      <section className="monitor-scoreboard">
        <div className="monitor-score monitor-score-mayron">
          <span>Mayron</span>
          <strong>{summary.mayron}</strong>
        </div>
        <div className="monitor-score monitor-score-wala">
          <span>Wala</span>
          <strong>{summary.wala}</strong>
        </div>
        <div className="monitor-score monitor-score-neutral">
          <span>Draw / Cancelled</span>
          <strong>{summary.neutral}</strong>
        </div>
      </section>

      <section className="monitor-latest">
        <div>
          <span>Latest Fight</span>
          <strong>{latestFight ? `#${latestFight.fightNumber}` : '-'}</strong>
        </div>
        <h2>{latestResultLabel}</h2>
      </section>

      <section className="monitor-pattern-panel">
        <div className="monitor-section-heading">
          <h2>Latest Pattern</h2>
          <span>Latest 12 tagged fights</span>
        </div>
        <div className="monitor-legend" aria-label="Color legend">
          <span><strong className="monitor-legend-color monitor-color-m" /> Mayron</span>
          <span><strong className="monitor-legend-color monitor-color-w" /> Wala</span>
          <span><strong className="monitor-legend-color monitor-color-n" /> Draw / Cancelled</span>
        </div>
        {latestPattern.length === 0 ? (
          <p className="monitor-empty">No tagged fights yet.</p>
        ) : (
          <div className="monitor-pattern-strip">
            {latestPattern.map((row) => (
              <div className="monitor-pattern-item" key={row.fightNumber}>
                <span>#{row.fightNumber}</span>
                <strong className={`monitor-color monitor-color-${row.mark.toLowerCase()}`} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="monitor-trend-panel">
        <div>
          <span>Pattern</span>
          <strong>{trend.pattern}</strong>
        </div>
        <div>
          <span>Trend</span>
          <strong>{trend.trend}</strong>
        </div>
        <div>
          <span>Posibleng Sunod</span>
          <strong>{trend.lean}</strong>
        </div>
      </section>
    </div>
  )
}

export default Monitor
