import { useContext, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'
import type { TaggedFight } from '../context/tagging'
import './Dashboard.css'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

const formatNumber = (value: number) => {
  return value.toLocaleString('en-US')
}

const formatPercent = (value: number) => {
  return `${Math.round(value)}%`
}

const formatMonthLabel = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

const getWinnerSideMark = (tag: TaggedFight) => {
  if (tag.outcome === 'draw') return 'D'
  if (tag.outcome === 'cancelled') return 'C'
  if (tag.outcomeWinner === 'mayron') return 'M'
  if (tag.outcomeWinner === 'wala') return 'W'
  return '-'
}

const getFightResult = (tag: TaggedFight) => {
  if (tag.outcomeWinner === 'mayron') return 'Mayron wins'
  if (tag.outcomeWinner === 'wala') return 'Wala wins'
  return 'Draw / Cancelled'
}

type MonthlyFight = {
  eventName: string
  eventDate: string
  fightNumber: number
  mark: string
}

type PatternRow = {
  id: string
  eventName: string
  fightNumber: number
  mayronEntry: string
  walaEntry: string
  resultMark: string
  result: string
}

function Dashboard() {
  const { user } = useAuth()
  const { events, members, pairings, selectedEventId, setSelectedEventId } = useData()

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Dashboard must be used within TaggingProvider')
  }
  const { taggedFights, releasedFights } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const selectedEvent = useMemo(() => {
    return events.find((event) => String(event.id) === selectedEventId)
  }, [events, selectedEventId])

  const eventPairings = useMemo(() => {
    if (!selectedEvent) return []
    return pairings
      .filter((pairing) => pairing.event_id === selectedEvent.id)
      .sort((a, b) => b.fight_number - a.fight_number)
  }, [pairings, selectedEvent])

  const selectedMonthEvents = useMemo(() => {
    if (!selectedEvent) return []

    const selectedDate = new Date(selectedEvent.date)
    const selectedYear = selectedDate.getFullYear()
    const selectedMonth = selectedDate.getMonth()

    return events
      .filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate.getFullYear() === selectedYear && eventDate.getMonth() === selectedMonth
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id)
  }, [events, selectedEvent])

  const selectedMonthLabel = selectedEvent ? formatMonthLabel(selectedEvent.date) : '-'

  const monthlyFights = useMemo<MonthlyFight[]>(() => {
    const eventById = new Map(selectedMonthEvents.map((event) => [event.id, event]))

    return pairings
      .filter((pairing) => eventById.has(pairing.event_id))
      .map((pairing) => {
        const tag = taggedFights.find((fight) => fight.pairingId === pairing.id)
        const event = eventById.get(pairing.event_id)

        if (!tag || tag.status !== 'tagged' || !event) {
          return null
        }

        return {
          eventName: event.name,
          eventDate: event.date,
          fightNumber: pairing.fight_number,
          mark: getWinnerSideMark(tag)
        }
      })
      .filter((fight): fight is MonthlyFight => fight !== null)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime() || a.fightNumber - b.fightNumber)
  }, [pairings, selectedMonthEvents, taggedFights])

  const patternRows = useMemo<PatternRow[]>(() => {
    return selectedMonthEvents
      .flatMap((event) => pairings
        .filter((pairing) => pairing.event_id === event.id)
        .sort((a, b) => a.fight_number - b.fight_number)
        .map((pairing) => {
          const tag = taggedFights.find((fight) => fight.pairingId === pairing.id)
          if (!tag || tag.status !== 'tagged') return null

          const mayronMember = members.find((item) => item.id === pairing.mayron_entry_id)
          const walaMember = members.find((item) => item.id === pairing.wala_entry_id)

          return {
            id: String(pairing.id),
            eventName: event.name,
            fightNumber: pairing.fight_number,
            mayronEntry: mayronMember?.entry_name || 'N/A',
            walaEntry: walaMember?.entry_name || 'N/A',
            resultMark: getWinnerSideMark(tag),
            result: getFightResult(tag)
          }
        })
        .filter((row): row is PatternRow => row !== null)
      )
      .reverse()
  }, [members, pairings, selectedMonthEvents, taggedFights])

  const dashboardStats = useMemo(() => {
    const taggedPairings = eventPairings
      .map((pairing) => {
        const tag = taggedFights.find((fight) => fight.pairingId === pairing.id)
        return tag && tag.status === 'tagged' ? { pairing, tag } : null
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)

    const decisiveFights = taggedPairings.filter(({ tag }) => tag.outcome === 'winner' || tag.outcome === 'loser')
    const mayronWins = decisiveFights.filter(({ tag }) => tag.outcomeWinner === 'mayron').length
    const walaWins = decisiveFights.filter(({ tag }) => tag.outcomeWinner === 'wala').length
    const draws = taggedPairings.filter(({ tag }) => tag.outcome === 'draw').length
    const cancelled = taggedPairings.filter(({ tag }) => tag.outcome === 'cancelled').length
    const released = eventPairings.filter((pairing) => {
      const release = releasedFights.find((fight) => fight.pairingId === pairing.id)
      return release?.releaseStatus === 'released'
    }).length

    const totalFights = eventPairings.length
    const taggedCount = taggedPairings.length
    const pendingCount = Math.max(totalFights - taggedCount, 0)
    const decisiveTotal = mayronWins + walaWins
    const mayronWinRate = decisiveTotal > 0 ? (mayronWins / decisiveTotal) * 100 : 0
    const walaWinRate = decisiveTotal > 0 ? (walaWins / decisiveTotal) * 100 : 0

    return {
      totalFights,
      taggedCount,
      pendingCount,
      released,
      mayronWins,
      walaWins,
      draws,
      cancelled,
      decisiveTotal,
      mayronWinRate,
      walaWinRate
    }
  }, [eventPairings, taggedFights, releasedFights])

  const monthlyStats = useMemo(() => {
    const mayronWins = monthlyFights.filter((fight) => fight.mark === 'M').length
    const walaWins = monthlyFights.filter((fight) => fight.mark === 'W').length
    const draws = monthlyFights.filter((fight) => fight.mark === 'D').length
    const cancelled = monthlyFights.filter((fight) => fight.mark === 'C').length
    const decisiveTotal = mayronWins + walaWins
    const leader = mayronWins === walaWins
      ? 'Even month'
      : mayronWins > walaWins
        ? 'Mayron leads this month'
        : 'Wala leads this month'

    return {
      mayronWins,
      walaWins,
      draws,
      cancelled,
      decisiveTotal,
      leader,
      totalTagged: monthlyFights.length
    }
  }, [monthlyFights])

  return (
    <div className="page-content">
      <div className="page-main dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Monthly winning patterns and event activity for {user?.fullName || 'Admin'}</p>
          </div>
          <div className="dashboard-event-filter">
            <label htmlFor="dashboardEventSelect">Select Event</label>
            <select
              id="dashboardEventSelect"
              className="form-input"
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={String(event.id)}>
                  {formatEventOption(event)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <div className="dashboard-kpi-card dashboard-kpi-card-strong">
            <span>Mayron Wins</span>
            <strong>{dashboardStats.mayronWins}</strong>
            <small>{formatPercent(dashboardStats.mayronWinRate)} of decisive fights</small>
          </div>
          <div className="dashboard-kpi-card dashboard-kpi-card-strong">
            <span>Wala Wins</span>
            <strong>{dashboardStats.walaWins}</strong>
            <small>{formatPercent(dashboardStats.walaWinRate)} of decisive fights</small>
          </div>
          <div className="dashboard-kpi-card">
            <span>Draws / Cancelled</span>
            <strong>{dashboardStats.draws} / {dashboardStats.cancelled}</strong>
            <small>{dashboardStats.decisiveTotal} decisive fights</small>
          </div>
          <div className="dashboard-kpi-card">
            <span>Fight Status</span>
            <strong>{dashboardStats.taggedCount}/{dashboardStats.totalFights}</strong>
            <small>{dashboardStats.pendingCount} pending results</small>
          </div>
        </div>

        <div className="dashboard-month-layout">
          <section className="dashboard-panel dashboard-month-summary">
            <div className="dashboard-panel-heading">
              <h2>Monthly Summary</h2>
              <span>{selectedMonthLabel}</span>
            </div>
            <div className="dashboard-month-grid">
              <div>
                <span>Tagged Fights</span>
                <strong>{formatNumber(monthlyStats.totalTagged)}</strong>
              </div>
              <div>
                <span>Mayron Wins</span>
                <strong>{formatNumber(monthlyStats.mayronWins)}</strong>
              </div>
              <div>
                <span>Wala Wins</span>
                <strong>{formatNumber(monthlyStats.walaWins)}</strong>
              </div>
              <div>
                <span>Draw / Cancelled</span>
                <strong>{monthlyStats.draws} / {monthlyStats.cancelled}</strong>
              </div>
              <div>
                <span>Monthly Read</span>
                <strong>{monthlyStats.leader}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-panel dashboard-pattern-panel">
            <div className="dashboard-panel-heading">
              <h2>Winning Pattern</h2>
              <span>Monthly by event</span>
            </div>
            <div className="dashboard-legend">
              <span><strong className="dashboard-mark dashboard-mark-m" /> Mayron</span>
              <span><strong className="dashboard-mark dashboard-mark-w" /> Wala</span>
              <span><strong className="dashboard-mark dashboard-mark-neutral" /> Draw / Cancelled</span>
            </div>
            {patternRows.length === 0 ? (
              <p className="dashboard-empty">No tagged fights yet for this month.</p>
            ) : (
              <div className="dashboard-pattern-table-wrap">
                <table className="dashboard-pattern-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Fight #</th>
                      <th>Entry</th>
                      <th aria-label="Result color"></th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patternRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.eventName}</td>
                        <td className="dashboard-fight-number">#{row.fightNumber}</td>
                        <td className="dashboard-matchup-cell">
                          <strong>{row.mayronEntry}</strong>
                          <span>vs {row.walaEntry}</span>
                        </td>
                        <td className="dashboard-result-color-cell">
                          <span
                            className={`dashboard-fight-chip ${row.resultMark === 'D' || row.resultMark === 'C'
                              ? 'dashboard-mark-neutral'
                              : `dashboard-mark-${row.resultMark.toLowerCase()}`}`}
                          />
                        </td>
                        <td className="dashboard-result-text-cell">
                          <strong>{row.result}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="dashboard-pattern-note">
              Each row is one fight matchup. The color indicator and result text show the tagged outcome.
            </p>
          </section>
        </div>
      </div>
      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Dashboard
