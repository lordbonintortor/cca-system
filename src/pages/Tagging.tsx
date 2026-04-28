import './Registration.css'
import { useState, useMemo, useContext, useEffect } from 'react'
import { useData } from '../context/DataContext'
import { TaggingContext } from '../context/tagging'



function Tagging() {
  const { events, members, pairings } = useData()
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null)
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false)

  // Set initial event on mount
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      const firstEvent = events[0].name
      if (firstEvent !== selectedEvent) {
        setSelectedEvent(firstEvent)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Tagging must be used within TaggingProvider')
  }
  const { taggedFights, updateTaggedFight, resetFight } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const eventPairings = useMemo(() => {
    return pairings
      .filter((p) => {
        const event = events.find(e => e.name === selectedEvent)
        return p.event_id === event?.id
      })
      .sort((a, b) => b.fight_number - a.fight_number)
  }, [pairings, selectedEvent, events])

  const handleTagFight = (pairingId: number) => {
    setSelectedFightId(pairingId)
    setIsOutcomeModalOpen(true)
  }

  const handleOutcomeSelect = async (outcome: 'winner' | 'loser' | 'draw' | 'cancelled', winner?: 'mayron' | 'wala') => {
    if (selectedFightId) {
      const pairing = pairings.find(p => p.id === selectedFightId)
      const existingTag = taggedFights.find(t => t.pairingId === selectedFightId)
      
      if (pairing) {
        const updatedTag = {
          pairingId: selectedFightId,
          fightNumber: pairing.fight_number,
          status: 'tagged' as const,
          outcome,
          outcomeWinner: winner,
          taggedAt: existingTag?.taggedAt || new Date().toISOString()
        }
        await updateTaggedFight(updatedTag)
      }
      setIsOutcomeModalOpen(false)
      setSelectedFightId(null)
    }
  }

  const handleResetFight = () => {
    if (selectedFightId) {
      resetFight(selectedFightId)
      setSelectedFightId(null)
    }
  }


  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'pending': return '#ffcc00'
      case 'tagged': return '#4caf50'
      case 'completed': return '#2196F3'
      default: return '#ddd'
    }
  }



  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Tagging</h1>
        <p>Tag fights from events</p>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="eventSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Select Event</label>
          <select
            id="eventSelect"
            className="form-input"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            {sortedEvents.map((event) => (
              <option key={event.id} value={event.name}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '100%', maxWidth: '1200px', margin: '2rem auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {eventPairings.map((pairing) => {
              const tag = taggedFights.find(t => t.pairingId === pairing.id)
              const statusColor = tag ? getStatusBadgeColor(tag.status) : '#ffcc00'
              
              return (
                <div
                  key={pairing.id}
                  onClick={() => handleTagFight(pairing.id)}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#fff',
                    border: '2px solid #e0e0e0',
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
                      #{pairing.fight_number}
                    </p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.4rem 0.8rem',
                      backgroundColor: statusColor,
                      color: statusColor === '#ffcc00' ? '#333' : '#fff',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontSize: '0.75rem'
                    }}>
                      {tag ? (tag.status === 'pending' ? 'Pending' : tag.status === 'tagged' ? 'Tagged' : 'Completed') : 'Pending'}
                    </span>
                  </div>
                  {tag && tag.outcome && (
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#4caf50', marginTop: '0.5rem' }}>
                      {tag.outcome === 'draw' ? '⚔️' : tag.outcome === 'cancelled' ? '❌' : '✓'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {eventPairings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            No pairings found for this event.
          </div>
        )}
      </div>

      {isOutcomeModalOpen && selectedFightId && (
        <div className="modal-overlay" onClick={() => setIsOutcomeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Fight Details & Tagging</h2>
              <button className="modal-close" onClick={() => setIsOutcomeModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              {(() => {
                const pairing = pairings.find(p => p.id === selectedFightId)
                const tag = taggedFights.find(t => t.pairingId === selectedFightId)
                const mayronMember = pairing ? members.find(m => m.id === pairing.mayron_entry_id) : undefined
                const walaMember = pairing ? members.find(m => m.id === pairing.wala_entry_id) : undefined
                const mayronEntry = mayronMember?.entry_name || 'N/A'
                const walaEntry = walaMember?.entry_name || 'N/A'
                return pairing ? (
                  <>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#2196F3', fontWeight: 'bold' }}>Fight #{pairing.fight_number}</h3>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: getStatusBadgeColor(tag?.status || 'pending'),
                        color: (tag?.status || 'pending') === 'pending' ? '#333' : '#fff',
                        borderRadius: '4px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        marginTop: '0.5rem'
                      }}>
                        {tag ? (tag.status === 'pending' ? 'Pending' : tag.status === 'tagged' ? 'Tagged' : 'Completed') : 'Pending'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                      <div style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.2rem', color: '#333', textAlign: 'center' }}>MAYRON</h4>
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{mayronEntry}</p>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Handler</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pairing.mayron_handler}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting</p>
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
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Handler</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pairing.wala_handler}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pairing.wala_betting}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem', backgroundColor: '#f0fff0', borderRadius: '8px', border: '2px solid #4caf50', textAlign: 'center', marginBottom: '2rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Diferencia</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>₱{pairing.diferencia}</p>
                    </div>

                    {!tag || tag.status !== 'tagged' ? (
                      <>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#333', textAlign: 'center' }}>
                          {tag ? 'Change Outcome' : 'Select Outcome'}
                        </h4>
                        <div style={{ marginBottom: '2rem' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>Winner</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                              onClick={() => handleOutcomeSelect('winner', 'mayron')}
                              style={{
                                padding: '1rem',
                                backgroundColor: '#e3f2fd',
                                border: '2px solid #2196F3',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#2196F3',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#2196F3'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#e3f2fd'; e.currentTarget.style.color = '#2196F3'}}
                            >
                              {mayronEntry} Wins
                            </button>
                            <button
                              onClick={() => handleOutcomeSelect('winner', 'wala')}
                              style={{
                                padding: '1rem',
                                backgroundColor: '#e3f2fd',
                                border: '2px solid #2196F3',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#2196F3',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#2196F3'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#e3f2fd'; e.currentTarget.style.color = '#2196F3'}}
                            >
                              {walaEntry} Wins
                            </button>
                          </div>
                        </div>

                        <div>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>Other Outcomes</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                              onClick={() => handleOutcomeSelect('draw')}
                              style={{
                                padding: '1rem',
                                backgroundColor: '#fff3e0',
                                border: '2px solid #ff9800',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#ff9800',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#ff9800'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#fff3e0'; e.currentTarget.style.color = '#ff9800'}}
                            >
                              Draw
                            </button>
                            <button
                              onClick={() => handleOutcomeSelect('cancelled')}
                              style={{
                                padding: '1rem',
                                backgroundColor: '#ffebee',
                                border: '2px solid #f44336',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#f44336',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#f44336'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#ffebee'; e.currentTarget.style.color = '#f44336'}}
                            >
                              Cancelled
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '1.5rem', backgroundColor: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#2e7d32' }}>✓ Fight Tagged</p>
                        <p style={{ fontSize: '0.9rem', color: '#558b2f', marginTop: '0.5rem' }}>Outcome: {tag.outcome === 'draw' ? 'DRAW' : tag.outcome === 'cancelled' ? 'CANCELLED' : `${tag.outcomeWinner === 'mayron' ? mayronEntry : walaEntry} Wins`}</p>
                      </div>
                    )}
                  </>
                ) : null
              })()}
            </div>

            <div className="modal-footer">
              {(() => {
                const tag = taggedFights.find(t => t.pairingId === selectedFightId)
                return tag ? (
                  <button className="btn-cancel" onClick={handleResetFight}>Reset</button>
                ) : (
                  <button className="btn-cancel" onClick={() => setIsOutcomeModalOpen(false)}>Close</button>
                )
              })()}
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

export default Tagging
