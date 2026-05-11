import { useContext, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'
import './Dashboard.css'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

const parseAmount = (value: string | number | undefined) => {
  if (value === undefined || value === null) {
    return 0
  }

  const parsed = Number(String(value).replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatNumber = (value: number) => {
  return value.toLocaleString('en-US')
}

const formatCurrency = (value: number) => {
  return `PHP ${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

const formatPercent = (value: number) => {
  return `${Math.round(value)}%`
}

function Dashboard() {
  const { user } = useAuth()
  const { events, members, pairings, raffleWinners, selectedEventId, setSelectedEventId } = useData()

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

  const eventMembers = useMemo(() => {
    if (!selectedEvent) return []
    return members.filter((member) => (
      member.event_id === selectedEvent.id ||
      (!member.event_id && member.event_name === selectedEvent.name)
    ))
  }, [members, selectedEvent])

  const eventRaffleWinners = useMemo(() => {
    if (!selectedEvent) return []
    return raffleWinners.filter((winner) => (
      winner.event_id === selectedEvent.id ||
      (!winner.event_id && winner.event_name === selectedEvent.name)
    ))
  }, [raffleWinners, selectedEvent])

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
    const mayronBetTotal = eventPairings.reduce((sum, pairing) => sum + parseAmount(pairing.mayron_betting), 0)
    const walaBetTotal = eventPairings.reduce((sum, pairing) => sum + parseAmount(pairing.wala_betting), 0)
    const diferenciaTotal = eventPairings.reduce((sum, pairing) => sum + parseAmount(pairing.diferencia), 0)
    const bettingEdge = Math.abs(mayronBetTotal - walaBetTotal)
    const bettingLeader = mayronBetTotal === walaBetTotal
      ? 'Even betting'
      : mayronBetTotal > walaBetTotal
        ? 'Mayron higher'
        : 'Wala higher'
    const decisiveTotal = mayronWins + walaWins
    const mayronWinRate = decisiveTotal > 0 ? (mayronWins / decisiveTotal) * 100 : 0
    const walaWinRate = decisiveTotal > 0 ? (walaWins / decisiveTotal) * 100 : 0
    const taggedProgress = totalFights > 0 ? (taggedCount / totalFights) * 100 : 0
    const releaseProgress = totalFights > 0 ? (released / totalFights) * 100 : 0

    const finishedResults = taggedPairings
      .slice()
      .sort((a, b) => b.pairing.fight_number - a.pairing.fight_number)
    const lastFinishedFight = finishedResults[0]
    const nextPendingFight = eventPairings
      .slice()
      .sort((a, b) => a.fight_number - b.fight_number)
      .find((pairing) => {
        const tag = taggedFights.find((fight) => fight.pairingId === pairing.id)
        return !tag || tag.status !== 'tagged'
      })
    const winnerSequence = finishedResults
      .filter(({ tag }) => tag.outcome === 'winner' || tag.outcome === 'loser')
      .map(({ tag }) => tag.outcomeWinner)
    const currentStreakSide = winnerSequence[0]
    const currentStreakCount = currentStreakSide
      ? winnerSequence.findIndex((winner) => winner !== currentStreakSide)
      : 0
    const normalizedStreakCount = currentStreakSide
      ? currentStreakCount === -1 ? winnerSequence.length : currentStreakCount
      : 0
    const lastWinner = lastFinishedFight?.tag.outcome === 'draw'
      ? 'Draw'
      : lastFinishedFight?.tag.outcome === 'cancelled'
        ? 'Cancelled'
        : lastFinishedFight?.tag.outcomeWinner === 'mayron'
          ? 'Mayron'
          : lastFinishedFight?.tag.outcomeWinner === 'wala'
            ? 'Wala'
            : '-'

    const recentResults = taggedPairings
      .slice()
      .sort((a, b) => b.pairing.fight_number - a.pairing.fight_number)
      .slice(0, 6)
      .map(({ pairing, tag }) => {
        const mayronMember = members.find((member) => member.id === pairing.mayron_entry_id)
        const walaMember = members.find((member) => member.id === pairing.wala_entry_id)
        const result = tag.outcome === 'draw'
          ? 'Draw'
          : tag.outcome === 'cancelled'
            ? 'Cancelled'
            : tag.outcomeWinner === 'mayron'
              ? 'Mayron'
              : 'Wala'

        return {
          fightNumber: pairing.fight_number,
          mayronEntry: mayronMember?.entry_name || 'N/A',
          walaEntry: walaMember?.entry_name || 'N/A',
          result,
          resultType: tag.outcome === 'draw' || tag.outcome === 'cancelled' ? tag.outcome : tag.outcomeWinner
        }
      })

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
      walaWinRate,
      taggedProgress,
      releaseProgress,
      mayronBetTotal,
      walaBetTotal,
      diferenciaTotal,
      bettingEdge,
      bettingLeader,
      lastWinner,
      lastFinishedFightNumber: lastFinishedFight?.pairing.fight_number,
      nextPendingFightNumber: nextPendingFight?.fight_number,
      currentStreakSide,
      currentStreakCount: normalizedStreakCount,
      recentResults
    }
  }, [eventPairings, taggedFights, releasedFights, members])

  const winLeader = dashboardStats.mayronWins === dashboardStats.walaWins
    ? 'Even'
    : dashboardStats.mayronWins > dashboardStats.walaWins
      ? 'Mayron leads'
      : 'Wala leads'

  return (
    <div className="page-content">
      <div className="page-main dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Event performance and fight activity for {user?.fullName || 'Admin'}</p>
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

        <div className="dashboard-layout">
          <section className="dashboard-panel dashboard-balance-panel">
            <div className="dashboard-panel-heading">
              <h2>Win Balance</h2>
              <span>{winLeader}</span>
            </div>
            <div className="dashboard-versus-row">
              <div>
                <span>Mayron</span>
                <strong>{dashboardStats.mayronWins}</strong>
              </div>
              <div className="dashboard-ratio">
                {dashboardStats.mayronWins}:{dashboardStats.walaWins}
              </div>
              <div>
                <span>Wala</span>
                <strong>{dashboardStats.walaWins}</strong>
              </div>
            </div>
            <div className="dashboard-ratio-bar" aria-label="Mayron and Wala win ratio">
              <span style={{ width: `${dashboardStats.mayronWinRate}%` }} />
              <span style={{ width: `${dashboardStats.walaWinRate}%` }} />
            </div>
            <div className="dashboard-progress-list">
              <div>
                <span>Tagged Progress</span>
                <strong>{formatPercent(dashboardStats.taggedProgress)}</strong>
              </div>
              <div className="dashboard-progress-track">
                <span style={{ width: `${dashboardStats.taggedProgress}%` }} />
              </div>
              <div>
                <span>Released Progress</span>
                <strong>{formatPercent(dashboardStats.releaseProgress)}</strong>
              </div>
              <div className="dashboard-progress-track dashboard-progress-track-green">
                <span style={{ width: `${dashboardStats.releaseProgress}%` }} />
              </div>
            </div>
            <div className="dashboard-balance-details">
              <div>
                <span>Last Winner</span>
                <strong>{dashboardStats.lastWinner}</strong>
              </div>
              <div>
                <span>Next Pending</span>
                <strong>{dashboardStats.nextPendingFightNumber ? `#${dashboardStats.nextPendingFightNumber}` : '-'}</strong>
              </div>
            </div>
            <div className="dashboard-balance-note">
              <span>Betting Edge</span>
              <strong>{dashboardStats.bettingLeader}</strong>
              <em>{formatCurrency(dashboardStats.bettingEdge)} difference between sides</em>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <h2>Betting Snapshot</h2>
              <span>{eventPairings.length} fights</span>
            </div>
            <div className="dashboard-money-list">
              <div>
                <span>Mayron Betting</span>
                <strong>{formatCurrency(dashboardStats.mayronBetTotal)}</strong>
              </div>
              <div>
                <span>Wala Betting</span>
                <strong>{formatCurrency(dashboardStats.walaBetTotal)}</strong>
              </div>
              <div>
                <span>Total Diferencia</span>
                <strong>{formatCurrency(dashboardStats.diferenciaTotal)}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <h2>Event Entries</h2>
              <span>{selectedEvent ? new Date(selectedEvent.date).toLocaleDateString() : '-'}</span>
            </div>
            <div className="dashboard-entry-grid">
              <div>
                <span>Registered Entries</span>
                <strong>{formatNumber(eventMembers.length)}</strong>
              </div>
              <div>
                <span>Paired Fights</span>
                <strong>{formatNumber(eventPairings.length)}</strong>
              </div>
              <div>
                <span>Raffle Winners</span>
                <strong>{formatNumber(eventRaffleWinners.length)}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-panel dashboard-recent-panel">
            <div className="dashboard-panel-heading">
              <h2>Recent Results</h2>
              <span>Latest tagged fights</span>
            </div>
            {dashboardStats.recentResults.length === 0 ? (
              <p className="dashboard-empty">No tagged fights yet for this event.</p>
            ) : (
              <div className="dashboard-recent-list">
                {dashboardStats.recentResults.map((result) => (
                  <div className="dashboard-recent-row" key={result.fightNumber}>
                    <strong>#{result.fightNumber}</strong>
                    <span>{result.mayronEntry} vs {result.walaEntry}</span>
                    <em className={`dashboard-result-badge dashboard-result-${result.resultType}`}>
                      {result.result}
                    </em>
                  </div>
                ))}
              </div>
            )}
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
