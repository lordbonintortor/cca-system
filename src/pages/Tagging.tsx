import { useState, useMemo, useContext } from 'react'
import { useData } from '../context/useDataContext'
import { TaggingContext } from '../context/tagging'
import type { Event } from '../context/DataContext'

const formatEventOption = (event: Event) => {
  return `${event.name} - ${new Date(event.date).toLocaleDateString()}`
}

function Tagging() {
  const { events, members, pairings, updatePairingBettingData, selectedEventId, setSelectedEventId } = useData()
  const [selectedFightId, setSelectedFightId] = useState<number | null>(null)
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false)
  const [mayronBetting, setMayronBetting] = useState('')
  const [walaBetting, setWalaBetting] = useState('')
  const [isSavingBetting, setIsSavingBetting] = useState(false)
  const [isSavingOutcome, setIsSavingOutcome] = useState(false)
  const [bettingSaveMessage, setBettingSaveMessage] = useState('')
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)

  const context = useContext(TaggingContext)
  if (!context) {
    throw new Error('Tagging must be used within TaggingProvider')
  }
  const { taggedFights, updateTaggedFight, resetFight } = context

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.id - a.id)
  }, [events])

  const eventPairings = useMemo(() => {
    return pairings
      .filter((p) => p.event_id === Number(selectedEventId))
      .sort((a, b) => a.fight_number - b.fight_number)
  }, [pairings, selectedEventId])

  const handleTagFight = (pairingId: number) => {
    const pairing = pairings.find(p => p.id === pairingId)
    const existingTag = taggedFights.find(t => t.pairingId === pairingId)
    setMayronBetting(pairing?.mayron_betting || '')
    setWalaBetting(pairing?.wala_betting || '')
    setBettingSaveMessage('')
    setShowCloseConfirmation(Boolean(existingTag?.outcomeWinner))
    setSelectedFightId(pairingId)
    setIsOutcomeModalOpen(true)
  }

  const handleMayronBettingChange = (value: string) => {
    setMayronBetting(formatNumberWithCommas(value))
    setBettingSaveMessage('')
  }

  const handleWalaBettingChange = (value: string) => {
    setWalaBetting(formatNumberWithCommas(value))
    setBettingSaveMessage('')
  }

  const formatNumberWithCommas = (value: string) => {
    const numberOnly = value.replace(/,/g, '').replace(/[^\d.]/g, '')
    if (!numberOnly) return ''

    const [wholePart, decimalPart] = numberOnly.split('.')
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decimalPart !== undefined ? `${formattedWhole}.${decimalPart}` : formattedWhole
  }

  const calculateDiferencia = (mayronValue: string, walaValue: string) => {
    if (!mayronValue || !walaValue) return ''

    const mayron = parseFloat(mayronValue.replace(/,/g, ''))
    const wala = parseFloat(walaValue.replace(/,/g, ''))
    if (isNaN(mayron) || isNaN(wala)) return ''

    return Math.abs(mayron - wala)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const editedDiferencia = useMemo(() => {
    return calculateDiferencia(mayronBetting, walaBetting)
  }, [mayronBetting, walaBetting])

  const handleCloseOutcomeModal = () => {
    setIsOutcomeModalOpen(false)
    setSelectedFightId(null)
    setMayronBetting('')
    setWalaBetting('')
    setBettingSaveMessage('')
    setShowCloseConfirmation(false)
  }

  const handleSaveBetting = async () => {
    if (!selectedFightId) return

    if (!mayronBetting.trim() || !walaBetting.trim()) {
      alert('Please enter both betting amounts')
      return
    }

    try {
      setIsSavingBetting(true)
      const pairing = pairings.find((currentPairing) => currentPairing.id === selectedFightId)
      if (!pairing) {
        alert('Could not find the selected pairing')
        return
      }

      const mayronAmount = Number(mayronBetting.replace(/,/g, ''))
      const walaAmount = Number(walaBetting.replace(/,/g, ''))
      if (!Number.isFinite(mayronAmount) || !Number.isFinite(walaAmount) || mayronAmount < 0 || walaAmount < 0) {
        alert('Please enter valid betting amounts')
        return
      }

      const shouldSwapSides = walaAmount > mayronAmount
      await updatePairingBettingData(selectedFightId, {
        mayron_entry_id: shouldSwapSides ? pairing.wala_entry_id : pairing.mayron_entry_id,
        mayron_betting: shouldSwapSides ? walaBetting : mayronBetting,
        wala_entry_id: shouldSwapSides ? pairing.mayron_entry_id : pairing.wala_entry_id,
        wala_betting: shouldSwapSides ? mayronBetting : walaBetting,
        diferencia: editedDiferencia,
      })
      if (shouldSwapSides) {
        setMayronBetting(walaBetting)
        setWalaBetting(mayronBetting)
      }
      setBettingSaveMessage(shouldSwapSides
        ? 'Betting amounts saved. The higher bet is now Mayron.'
        : 'Updated betting amounts have been saved.')
    } catch (error) {
      console.error('Error updating betting amounts:', error)
      alert('Failed to update betting amounts')
    } finally {
      setIsSavingBetting(false)
    }
  }

  const handleOutcomeSelect = async (outcome: 'winner' | 'loser' | 'draw' | 'cancelled', winner?: 'mayron' | 'wala') => {
    if (selectedFightId) {
      const pairing = pairings.find(p => p.id === selectedFightId)
      const existingTag = taggedFights.find(t => t.pairingId === selectedFightId)
      
      try {
        setIsSavingOutcome(true)
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
        if (outcome === 'winner') {
          setShowCloseConfirmation(true)
        } else {
          handleCloseOutcomeModal()
        }
      } catch (error) {
        console.error('Error saving fight outcome:', error)
        alert('The fight outcome was not saved. Check the connection and try again.')
      } finally {
        setIsSavingOutcome(false)
      }
    }
  }

  const handleResetFight = async () => {
    if (selectedFightId) {
      try {
        setIsSavingOutcome(true)
        await resetFight(selectedFightId)
        handleCloseOutcomeModal()
      } catch (error) {
        console.error('Error resetting fight:', error)
        alert('The fight could not be reset. Check the connection and try again.')
      } finally {
        setIsSavingOutcome(false)
      }
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
        <div className="modal-overlay" onClick={handleCloseOutcomeModal}>
          <div className="modal-content" style={{ width: 'calc(100vw - 2rem)', maxWidth: '1100px', maxHeight: '96vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Fight Details & Tagging</h2>
              <button className="modal-close" onClick={handleCloseOutcomeModal}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '0.75rem 1.25rem', overflow: 'hidden' }}>
              {(() => {
                const pairing = pairings.find(p => p.id === selectedFightId)
                const tag = taggedFights.find(t => t.pairingId === selectedFightId)
                const mayronMember = pairing ? members.find(m => m.id === pairing.mayron_entry_id) : undefined
                const walaMember = pairing ? members.find(m => m.id === pairing.wala_entry_id) : undefined
                const mayronEntry = mayronMember?.entry_name || 'N/A'
                const walaEntry = walaMember?.entry_name || 'N/A'
                return pairing ? (
                  <>
                    <div style={{ marginBottom: '0.7rem', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: '#2196F3', fontWeight: 'bold' }}>Fight #{pairing.fight_number}</h3>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.3rem 0.75rem',
                        backgroundColor: getStatusBadgeColor(tag?.status || 'pending'),
                        color: (tag?.status || 'pending') === 'pending' ? '#333' : '#fff',
                        borderRadius: '4px',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        marginTop: '0.25rem'
                      }}>
                        {tag ? (tag.status === 'pending' ? 'Pending' : tag.status === 'tagged' ? 'Tagged' : 'Completed') : 'Pending'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.55rem' }}>
                      <div style={{ padding: '0.5rem 0.65rem', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.45rem', color: '#333', textAlign: 'center' }}>MAYRON</h4>
                        <div style={{ marginBottom: '0.45rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{mayronEntry}</p>
                        </div>
                        <div>
                          <label htmlFor="taggingMayronBetting" style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting Amount</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: '#666', pointerEvents: 'none' }}>₱</span>
                            <input
                              id="taggingMayronBetting"
                              className="form-input"
                              type="text"
                              value={mayronBetting}
                              onChange={(e) => handleMayronBettingChange(e.target.value)}
                              style={{ paddingLeft: '1.4rem', color: '#e94560', fontWeight: '600' }}
                            />
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '0.5rem 0.65rem', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.45rem', color: '#333', textAlign: 'center' }}>WALA</h4>
                        <div style={{ marginBottom: '0.45rem' }}>
                          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Entry</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{walaEntry}</p>
                        </div>
                        <div>
                          <label htmlFor="taggingWalaBetting" style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '500' }}>Betting Amount</label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: '#666', pointerEvents: 'none' }}>₱</span>
                            <input
                              id="taggingWalaBetting"
                              className="form-input"
                              type="text"
                              value={walaBetting}
                              onChange={(e) => handleWalaBettingChange(e.target.value)}
                              style={{ paddingLeft: '1.4rem', color: '#e94560', fontWeight: '600' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      <button
                        className="btn-add"
                        onClick={handleSaveBetting}
                        disabled={isSavingBetting}
                      >
                        {isSavingBetting ? 'Saving...' : 'Save Betting'}
                      </button>
                    </div>
                    {bettingSaveMessage && (
                      <p style={{ textAlign: 'center', color: '#2e7d32', fontSize: '0.9rem', fontWeight: '600', margin: '-0.5rem 0 1rem' }}>
                        {bettingSaveMessage}
                      </p>
                    )}

                    <div style={{ padding: '0.35rem 1rem', backgroundColor: '#f0fff0', borderRadius: '6px', border: '2px solid #4caf50', textAlign: 'center', marginBottom: '0.55rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Diferencia</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>₱{editedDiferencia || '0'}</p>
                    </div>

                    {tag?.outcomeWinner && (
                      (() => {
                        const winningBetting = tag.outcomeWinner === 'mayron' ? mayronBetting : walaBetting
                        const parada = Number(winningBetting.replace(/,/g, ''))
                        const plasada = parada * 0.11
                        const largada = 500
                        const net = parada - plasada - largada
                        const formatCurrency = (value: number) => value.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })

                        return Number.isFinite(parada) ? (
                          <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '2px solid #2196F3', marginBottom: '0.7rem' }}>
                            <h4 style={{ margin: '0 0 0.4rem', textAlign: 'center', color: '#1565c0', fontSize: '0.95rem' }}>Winning Bet Calculation</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.5rem', color: '#333', alignItems: 'center', textAlign: 'center', fontSize: '0.85rem' }}>
                              <p style={{ margin: 0 }}>Winner: <strong>{tag.outcomeWinner === 'mayron' ? 'MAYRON' : 'WALA'}</strong></p>
                              <p style={{ margin: 0 }}>PARADA: <strong>₱{formatCurrency(parada)}</strong></p>
                              <p style={{ margin: 0 }}>PLASADA 11%: <strong>(₱{formatCurrency(plasada)})</strong></p>
                              <p style={{ margin: 0 }}>LARGADA: <strong>(₱{formatCurrency(largada)})</strong></p>
                              <p style={{ margin: 0, paddingTop: '0.25rem', borderTop: '1px solid #90caf9' }}>NET: <strong>₱{formatCurrency(net)}</strong></p>
                            </div>
                          </div>
                        ) : null
                      })()
                    )}

                    {!tag || tag.status !== 'tagged' ? (
                      <>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#333', textAlign: 'center' }}>
                          {tag ? 'Change Winner' : 'Select Winner'}
                        </h4>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.6rem' }}>
                            <button
                              onClick={() => handleOutcomeSelect('winner', 'mayron')}
                              disabled={isSavingOutcome}
                              style={{
                                padding: '0.55rem 0.75rem',
                                backgroundColor: '#e3f2fd',
                                border: '2px solid #2196F3',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#2196F3',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#2196F3'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#e3f2fd'; e.currentTarget.style.color = '#2196F3'}}
                            >
                              MAYRON
                            </button>
                            <button
                              onClick={() => handleOutcomeSelect('winner', 'wala')}
                              disabled={isSavingOutcome}
                              style={{
                                padding: '0.55rem 0.75rem',
                                backgroundColor: '#e3f2fd',
                                border: '2px solid #2196F3',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#2196F3',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#2196F3'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#e3f2fd'; e.currentTarget.style.color = '#2196F3'}}
                            >
                              WALA
                            </button>
                            <button
                              onClick={() => handleOutcomeSelect('draw')}
                              disabled={isSavingOutcome}
                              style={{
                                padding: '0.55rem 0.75rem',
                                backgroundColor: '#fff3e0',
                                border: '2px solid #ff9800',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#ff9800',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#ff9800'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#fff3e0'; e.currentTarget.style.color = '#ff9800'}}
                            >
                              DRAW
                            </button>
                            <button
                              onClick={() => handleOutcomeSelect('cancelled')}
                              disabled={isSavingOutcome}
                              style={{
                                padding: '0.55rem 0.75rem',
                                backgroundColor: '#ffebee',
                                border: '2px solid #f44336',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#f44336',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#f44336'; e.currentTarget.style.color = '#fff'}}
                              onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#ffebee'; e.currentTarget.style.color = '#f44336'}}
                            >
                              CANCELLED
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#333', fontWeight: '600', marginBottom: '0.5rem' }}>
                          OUTCOME
                        </p>
                        <div style={{ padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
                          <p style={{ fontWeight: '600', color: '#2e7d32', margin: '0', fontSize: '0.9rem' }}>
                            Winner: {tag.outcome === 'draw' ? 'DRAW' : tag.outcome === 'cancelled' ? 'CANCELLED' : `${tag.outcomeWinner === 'mayron' ? 'MAYRON' : 'WALA'}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : null
              })()}
            </div>

            <div className="modal-footer" style={{ padding: '0.6rem 1rem', gap: '0.6rem' }}>
              {(() => {
                const tag = taggedFights.find(t => t.pairingId === selectedFightId)
                return tag ? (
                  <>
                    <button className="btn-cancel" onClick={handleResetFight} disabled={isSavingOutcome}>
                      {isSavingOutcome ? 'Saving...' : 'Reset'}
                    </button>
                    {tag.outcomeWinner && showCloseConfirmation && (
                      <button className="btn-add" onClick={handleCloseOutcomeModal} disabled={isSavingOutcome}>
                        Confirm & Close
                      </button>
                    )}
                  </>
                ) : (
                  <button className="btn-cancel" onClick={handleCloseOutcomeModal}>Close</button>
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
