import { useState, useMemo, useContext } from 'react'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'
import './Releasing.css'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

function Releasing() {
  const { events, members, pairings, selectedEventId, setSelectedEventId } = useData()
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null)
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)

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
        return pairing?.event_id === Number(selectedEventId)
      })
      .sort((a, b) => a.fightNumber - b.fightNumber)
  }, [taggedFights, pairings, selectedEventId])

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

  const handleCancelRelease = () => {
    setIsReleaseModalOpen(false)
  }

  const handleResetRelease = async () => {
    if (!selectedFightId) return

    try {
      setIsReleasing(true)
      await updateReleasedFight(selectedFightId, 'unreleased')
      setIsReleaseModalOpen(false)
      setSelectedFightId(null)
    } catch (error) {
      console.error('Error resetting release:', error)
      alert('The release was not reset. Check the connection and try again.')
    } finally {
      setIsReleasing(false)
    }
  }

  const handleConfirmRelease = async () => {
    if (selectedFightId) {
      try {
        setIsReleasing(true)
        await updateReleasedFight(selectedFightId, 'released')
        handlePrintRelease(selectedFightId)
      } catch (error) {
        console.error('Error releasing fight:', error)
        alert('The fight was not released. Check the connection and try again.')
      } finally {
        setIsReleasing(false)
      }
    }
  }

  const handlePrintRelease = (pairingId: number) => {
    const pairing = pairings.find(p => p.id === pairingId)
    const tagged = taggedFights.find(t => t.pairingId === pairingId)
    if (pairing && tagged) {
      if (!tagged.outcomeWinner) {
        alert('Draw or cancelled fights do not have a winner release print.')
        return
      }

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
              @page { size: 58mm auto; margin: 0; }
              * { box-sizing: border-box; }
              html, body { width: 58mm; margin: 0; padding: 0; background: white; }
              body { font-family: Arial, sans-serif; color: #000; font-size: 9px; }
              .container { width: 54mm; margin: 0 auto; padding: 1mm 0 2mm; }
              .title { text-align: center; font-size: 13px; font-weight: bold; padding: 1.5mm; border: 1px solid #000; margin-bottom: 1.5mm; }
              .congrats { padding: 1.5mm; margin-bottom: 1.5mm; border: 1px dashed #000; text-align: center; font-size: 11px; font-weight: 800; }
              .section { padding: 1.5mm; border: 1px solid #000; }
              .value { font-size: 9px; font-weight: 700; }
              .number { display: flex; justify-content: flex-start; align-items: baseline; gap: 1mm; margin-bottom: 1mm; border-bottom: 1px dotted #000; padding-bottom: 0.75mm; white-space: nowrap; }
              .number .value { margin-left: 0.5mm; }
              .number:last-child { margin-bottom: 0; }
              @media print { html, body { width: 58mm; } }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="title">Sultada: ${pairing.fight_number}</div>
              <div class="congrats">Congratulations!</div>
              
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
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}
          >
            {sortedEvents.map((event) => (
              <option key={event.id} value={String(event.id)}>
                {formatEventOption(event)}
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
          <div className="modal-content releasing-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Release Fight</h2>
              <button className="modal-close" onClick={() => setIsReleaseModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body releasing-modal-body">
              {(() => {
                const pairing = pairings.find(p => p.id === selectedFightId)
                const tagged = taggedFights.find(t => t.pairingId === selectedFightId)
                const mayronMember = pairing ? members.find(m => m.id === pairing.mayron_entry_id) : undefined
                const walaMember = pairing ? members.find(m => m.id === pairing.wala_entry_id) : undefined
                const mayronEntry = mayronMember?.entry_name || 'N/A'
                const walaEntry = walaMember?.entry_name || 'N/A'

                return pairing ? (
                  <>
                    <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem', color: '#2196F3', fontWeight: 'bold' }}>Fight #{pairing.fight_number}</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.7rem', color: '#333', textAlign: 'center' }}>MAYRON</h4>
                        <div style={{ marginBottom: '0.7rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{mayronEntry}</p>
                        </div>
                        <div style={{ marginBottom: '0.7rem' }}>

                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting Amount</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pairing.mayron_betting}</p>
                        </div>
                      </div>

                      <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.7rem', color: '#333', textAlign: 'center' }}>WALA</h4>
                        <div style={{ marginBottom: '0.7rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{walaEntry}</p>
                        </div>
                        <div style={{ marginBottom: '0.7rem' }}>

                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting Amount</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pairing.wala_betting}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0.8rem', backgroundColor: '#f0fff0', borderRadius: '8px', border: '2px solid #4caf50', textAlign: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Diferencia</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#4caf50' }}>₱{pairing.diferencia}</p>
                    </div>

                    {tagged && (
                      <div style={{ marginBottom: '0.25rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                          OUTCOME
                        </p>
                        <div style={{ padding: '0.7rem', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
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
              <button className="btn-cancel" onClick={handleCancelRelease}>Cancel</button>
              <div className="releasing-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={handleResetRelease}
                  disabled={isReleasing}
                >
                  Reset
                </button>
                <button 
                  className="btn-add" 
                  onClick={() => {
                    if (selectedFightId) handlePrintRelease(selectedFightId)
                  }}
                  style={{ backgroundColor: '#2196F3' }}
                >
                  Print
                </button>
                <button
                  className="btn-add"
                  onClick={handleConfirmRelease}
                  disabled={isReleasing || getReleaseStatus(selectedFightId) === 'released'}
                >
                  {isReleasing ? 'Releasing...' : 'Release'}
                </button>
              </div>
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
