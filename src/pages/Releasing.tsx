import './Registration.css'
import { useState, useMemo, useContext, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'



function Releasing() {
  const { events, members, pairings } = useData()
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null)
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

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
    throw new Error('Releasing must be used within TaggingProvider')
  }
  const { taggedFights, releasedFights, updateReleasedFight } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const eventTaggedFights = useMemo(() => {
    return taggedFights
      .filter((t) => {
        const pairing = pairings.find(p => p.id === t.pairingId)
        const event = events.find(e => e.name === selectedEvent)
        return pairing?.event_id === event?.id
      })
      .sort((a, b) => b.fightNumber - a.fightNumber)
  }, [taggedFights, pairings, selectedEvent, events])

  const getReleaseStatus = (pairingId: number): 'unreleased' | 'released' | 'special' => {
    const tagged = taggedFights.find(t => t.pairingId === pairingId)
    if (tagged?.outcome === 'draw' || tagged?.outcome === 'cancelled') {
      return 'special'
    }
    const released = releasedFights.find(r => r.pairingId === pairingId)
    return released?.releaseStatus || 'unreleased'
  }

  const getReleaseColor = (status: 'unreleased' | 'released' | 'special') => {
    switch(status) {
      case 'unreleased': return '#f44336'
      case 'released': return '#4caf50'
      case 'special': return '#ff9800'
      default: return '#ddd'
    }
  }

  const handleReleaseFight = (pairingId: number) => {
    setSelectedFightId(pairingId)
    setIsReleaseModalOpen(true)
  }

  const handleConfirmRelease = async () => {
    if (selectedFightId) {
      await updateReleasedFight(selectedFightId, 'released')
      setIsReleaseModalOpen(false)
      setIsConfirmationModalOpen(true)
    }
  }

  const handlePrintRelease = (pairingId: number) => {
    const pairing = pairings.find(p => p.id === pairingId)
    const tagged = taggedFights.find(t => t.pairingId === pairingId)

    if (pairing && tagged) {
      const winnerBetting = tagged.outcomeWinner === 'mayron'
        ? pairing.mayron_betting
        : pairing.wala_betting


      const paradasNum = parseFloat(String(winnerBetting).replace(/,/g, ''))
      const plasadaNum = paradasNum * 0.11
      const largadaNum = 500
      const netNum = paradasNum - plasadaNum - largadaNum

      const printWindow = window.open('', '', 'height=600,width=800')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Release Print - Fight #${pairing.fight_number}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 2rem; background: #f5f5f5; }
              .container { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; margin: 0 auto; }
              .title { font-size: 1.2rem; font-weight: bold; margin-bottom: 1.5rem; }
              .section { margin-bottom: 1.5rem; }
              .label { font-size: 0.9rem; color: #666; margin-bottom: 0.3rem; }
              .value { font-size: 1rem; font-weight: 600; color: #333; text-decoration: underline; }
              .number { font-size: 0.95rem; margin-bottom: 1rem; }
              @media print { body { padding: 0; background: white; } }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="title">Sultada: ${pairing.fight_number}</div>
              
              <div class="section">

              </div>

              <div class="section">
                <div class="number">PARADA: ₱ <span class="value">${paradasNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div class="number">PLASADA 11%: (₱ <span class="value">${plasadaNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>)</div>
                <div class="number">LARGADA: (₱ <span class="value">500.00</span>)</div>
                <div class="number">NET WINNINGS: ₱ <span class="value">${netNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>
            </div>
            <script>
              window.print();
              setTimeout(() => window.close(), 500);
            </script>
          </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Releasing</h1>
        <p>Release tagged fights from events</p>

        <div style={{ marginBottom: '2rem', width: '100%', maxWidth: '200px', margin: '0 auto 2rem' }}>
          <label htmlFor="eventSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Select Event</label>
          <select
            id="eventSelect"
            className="form-input"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}
          >
            {sortedEvents.map((event) => (
              <option key={event.id} value={event.name}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '5px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#f44336', borderRadius: '3px' }}></div>
              <span>Not Released</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#4caf50', borderRadius: '3px' }}></div>
              <span>Released</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ff9800', borderRadius: '3px' }}></div>
              <span>Draw/Cancelled</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '1200px', margin: '2rem auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {eventTaggedFights.map((tagged) => {
              const releaseStatus = getReleaseStatus(tagged.pairingId)
              const color = getReleaseColor(releaseStatus)
              
              return (
                <div
                  key={tagged.pairingId}
                  onClick={() => handleReleaseFight(tagged.pairingId)}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#fff',
                    border: `3px solid ${color}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3', margin: '0' }}>
                      #{tagged.fightNumber}
                    </p>
                  </div>
                  <div style={{
                    padding: '0.4rem 0.8rem',
                    backgroundColor: color,
                    color: releaseStatus === 'special' ? '#333' : '#fff',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    display: 'inline-block'
                  }}>
                    {releaseStatus === 'unreleased' ? 'Not Released' : releaseStatus === 'released' ? 'Released' : 'Draw/Cancelled'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {eventTaggedFights.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            No tagged fights found for this event.
          </div>
        )}
      </div>

      {isReleaseModalOpen && selectedFightId && (
        <div className="modal-overlay" onClick={() => setIsReleaseModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Release Fight</h2>
              <button className="modal-close" onClick={() => setIsReleaseModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              {(() => {
                const pairing = pairings.find(p => p.id === selectedFightId)
                const tagged = taggedFights.find(t => t.pairingId === selectedFightId)
                const mayronMember = pairing ? members.find(m => m.id === pairing.mayron_entry_id) : undefined
                const walaMember = pairing ? members.find(m => m.id === pairing.wala_entry_id) : undefined
                const mayronEntry = mayronMember?.entry_name || 'N/A'
                const walaEntry = walaMember?.entry_name || 'N/A'

                return pairing ? (
                  <>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2196F3', fontWeight: 'bold' }}>Fight #{pairing.fight_number}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                      <div style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#333', textAlign: 'center' }}>MAYRON</h4>
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{mayronEntry}</p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>

                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting Amount</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pairing.mayron_betting}</p>
                        </div>
                      </div>

                      <div style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#333', textAlign: 'center' }}>WALA</h4>
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{walaEntry}</p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>

                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting Amount</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pairing.wala_betting}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem', backgroundColor: '#f0fff0', borderRadius: '8px', border: '2px solid #4caf50', textAlign: 'center', marginBottom: '2rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Diferencia</p>
                      <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>₱{pairing.diferencia}</p>
                    </div>

                    {tagged && (
                      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                          OUTCOME
                        </p>
                        <div style={{ padding: '1rem', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                          <p style={{ fontSize: '0.9rem', color: '#1565c0', fontWeight: '600', margin: '0' }}>
                            Winner: {tagged.outcome === 'draw' ? 'DRAW' : tagged.outcome === 'cancelled' ? 'CANCELLED' : `${tagged.outcomeWinner === 'mayron' ? 'MAYRON' : 'WALA'}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : null
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsReleaseModalOpen(false)}>Cancel</button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn-add" 
                  onClick={() => {
                    if (selectedFightId) handlePrintRelease(selectedFightId)
                  }}
                  style={{ backgroundColor: '#2196F3' }}
                >
                  Print
                </button>
                <button className="btn-add" onClick={handleConfirmRelease}>Release</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConfirmationModalOpen && (
        <div className="modal-overlay" onClick={() => setIsConfirmationModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Release Complete</h2>
              <button className="modal-close" onClick={() => setIsConfirmationModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2e7d32', marginBottom: '0.5rem' }}>Fight Released Successfully!</h3>
              <p style={{ fontSize: '0.95rem', color: '#666' }}>The fight has been marked as released.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-add" onClick={() => setIsConfirmationModalOpen(false)}>Exit</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Releasing
