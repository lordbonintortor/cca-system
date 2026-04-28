import './Registration.css'
import { useState, useMemo, useEffect } from 'react'
import { useData } from '../context/useDataContext'
import type { Pairing, Member } from '../context/DataContext'

interface PairingRecord {
  id: number
  fight_number: number
  mayron_entry: string
  mayron_handler: string
  mayron_weight: string
  mayron_betting: string
  wala_entry: string
  wala_handler: string
  wala_weight: string
  wala_betting: string
  diferencia: string
}




const getBaseEntryName = (entryName: string) => {
  return entryName.replace(/\s+-\s+Entry\s+\d+$/i, '')
}

function PairingPage() {
  const { events, members, pairings, addPairing } = useData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventName, setEventName] = useState('')
  const [mayronEntry, setMayronEntry] = useState('')
  const [walaEntry, setWalaEntry] = useState('')
  const [mayronHandler, setMayronHandler] = useState('')
  const [walaHandler, setWalaHandler] = useState('')
  const [mayronWeight, setMayronWeight] = useState('')
  const [walaWeight, setWalaWeight] = useState('')
  const [mayronBetting, setMayronBetting] = useState('')
  const [walaBetting, setWalaBetting] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingPairing, setPendingPairing] = useState<PairingRecord | null>(null)

  // Set initial event on mount
  useEffect(() => {
    if (events.length > 0 && !eventName) {
      const firstEvent = events[0].name
      if (firstEvent !== eventName) {
        setEventName(firstEvent)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const filteredMembers = useMemo(() => {
    if (!eventName) return members
    return members.filter((member) => member.event_name === eventName)
  }, [eventName, members])

  const selectableMembers = useMemo(() => {
    const seenMembers = new Set<string>()

    return filteredMembers.filter((member) => {
      const baseEntryName = getBaseEntryName(member.entry_name)
      const memberKey = `${baseEntryName}|${member.handler_name}`

      if (seenMembers.has(memberKey)) {
        return false
      }

      seenMembers.add(memberKey)
      return true
    })
  }, [filteredMembers])

  const eventPairings = useMemo(() => {
    const event = events.find((e) => e.name === eventName)
    if (!event) return []

    return pairings
      .filter((pairing) => pairing.event_id === event.id)
      .sort((a, b) => b.fight_number - a.fight_number)
  }, [events, eventName, pairings])

  const calculatedDiferencia = useMemo(() => {
    if (!mayronBetting || !walaBetting) return ''
    const mayron = parseFloat(mayronBetting.replace(/,/g, ''))
    const wala = parseFloat(walaBetting.replace(/,/g, ''))
    if (isNaN(mayron) || isNaN(wala)) return ''
    const diff = Math.abs(mayron - wala).toString()
    return diff.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }, [mayronBetting, walaBetting])

  const formatNumberWithCommas = (value: string) => {
    const numberOnly = value.replace(/,/g, '')
    if (!numberOnly) return ''
    return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const handlePrintFight = (pairing: Pairing, mayronMember: Member | undefined, walaMember: Member | undefined) => {
    const printWindow = window.open('', '', 'height=800,width=600')
    if (!printWindow) return

    const mayronEntry = mayronMember ? getBaseEntryName(mayronMember.entry_name) : 'N/A'
    const walaEntry = walaMember ? getBaseEntryName(walaMember.entry_name) : 'N/A'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fight ${pairing.fight_number}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #f5f5f5;
          }
          .print-container {
            background: white;
            padding: 40px;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header h2 {
            margin: 5px 0 0 0;
            font-size: 16px;
            color: #666;
          }
          .event-info {
            text-align: center;
            margin-bottom: 25px;
            font-size: 14px;
          }
          .event-info p {
            margin: 5px 0;
          }
          .fight-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            background: #333;
            color: white;
            padding: 15px;
          }
          .parada {
            display: flex;
            gap: 40px;
            margin-bottom: 30px;
          }
          .parada-section {
            flex: 1;
            text-align: center;
          }
          .parada-header {
            background: #333;
            color: white;
            padding: 10px;
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .parada-label {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .entry-name {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
            text-decoration: underline;
          }
          .handler-name {
            font-size: 14px;
            margin: 8px 0;
          }
          .weight {
            font-size: 14px;
            margin: 8px 0;
            color: #666;
          }
          .betting {
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
          }
          .diferencia-section {
            background: #f0fff0;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
            border: 2px solid #ddd;
            border-radius: 4px;
          }
          .diferencia-header {
            background: #333;
            color: white;
            padding: 8px;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .diferencia-amount {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .signature-section {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
          }
          .signature-line {
            text-align: center;
            flex: 1;
          }
          .sig-line {
            border-top: 2px solid #333;
            margin: 40px 20px 0;
            min-width: 150px;
          }
          .sig-label {
            margin-top: 8px;
            font-size: 12px;
          }
          .parejo-section {
            background: #333;
            color: white;
            padding: 15px;
            text-align: center;
            margin-top: 30px;
            font-weight: bold;
            font-size: 18px;
          }
          .parejo-amount {
            font-size: 20px;
            margin-top: 10px;
            border-top: 2px solid white;
            border-bottom: 2px solid white;
            padding: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #999;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .print-container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>CALINAN COCKPIT ARENA</h1>
            <h2>Calinan District, Davao City</h2>
          </div>
          <div class="event-info">
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="fight-title">FIGHT #${pairing.fight_number}</div>
          <div class="parada">
            <div class="parada-section">
              <div class="parada-header">PARADA (MAYRON)</div>
              <div class="parada-label">Entry</div>
              <div class="entry-name">${mayronEntry}</div>
              <div class="handler-name"><strong>Handler:</strong> ${pairing.mayron_handler}</div>
              <div class="weight"><strong>Weight:</strong> ${pairing.mayron_weight} lbs</div>
              <div class="betting"><strong>₱${pairing.mayron_betting}</strong></div>
            </div>
            <div class="parada-section">
              <div class="parada-header">PARADA (WALA)</div>
              <div class="parada-label">Entry</div>
              <div class="entry-name">${walaEntry}</div>
              <div class="handler-name"><strong>Handler:</strong> ${pairing.wala_handler}</div>
              <div class="weight"><strong>Weight:</strong> ${pairing.wala_weight} lbs</div>
              <div class="betting"><strong>₱${pairing.wala_betting}</strong></div>
            </div>
          </div>
          <div class="diferencia-section">
            <div class="diferencia-header">DIFERENCIA</div>
            <div class="diferencia-amount">₱${pairing.diferencia}</div>
          </div>
          <div class="signature-section">
            <div class="signature-line">
              <div class="sig-line"></div>
              <div class="sig-label">Mayron Handler</div>
            </div>
            <div class="signature-line">
              <div class="sig-line"></div>
              <div class="sig-label">Wala Handler</div>
            </div>
          </div>
          <div class="parejo-section">
            PAREJO
            <div class="parejo-amount">₱ _____________</div>
          </div>
          <div class="footer">
            <p>Printed on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handleCreatePairing = () => {
    if (sortedEvents.length > 0 && !eventName) {
      setEventName(sortedEvents[0].name)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setMayronEntry('')
    setWalaEntry('')
    setMayronHandler('')
    setWalaHandler('')
    setMayronWeight('')
    setWalaWeight('')
    setMayronBetting('')
    setWalaBetting('')
  }

  const handleSavePairing = () => {
    if (!eventName.trim() || !mayronEntry.trim() || !walaEntry.trim() || !mayronHandler.trim() || !walaHandler.trim() || !mayronWeight.trim() || !walaWeight.trim() || !mayronBetting.trim() || !walaBetting.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (mayronEntry === walaEntry) {
      alert('Fighters must be different')
      return
    }

    const eventData = events.find((e) => e.name === eventName)
    const nextFightNumber = eventData
      ? Math.max(0, ...pairings.filter((p) => p.event_id === eventData.id).map((p) => p.fight_number)) + 1
      : 1

    const newPairing: PairingRecord = {
      id: Date.now(),
      fight_number: nextFightNumber,
      mayron_entry: mayronEntry,
      mayron_handler: mayronHandler,
      mayron_weight: mayronWeight,
      mayron_betting: mayronBetting,
      wala_entry: walaEntry,
      wala_handler: walaHandler,
      wala_weight: walaWeight,
      wala_betting: walaBetting,
      diferencia: calculatedDiferencia
    }

    setPendingPairing(newPairing)
    setShowConfirmation(true)
  }

  const handleConfirmPairing = async () => {
    if (pendingPairing) {
      try {
        // Find member IDs for the selected entry names
        const mayronMember = members.find((m) => getBaseEntryName(m.entry_name) === pendingPairing.mayron_entry && m.event_name === eventName)
        const walaMember = members.find((m) => getBaseEntryName(m.entry_name) === pendingPairing.wala_entry && m.event_name === eventName)

        if (!mayronMember || !walaMember) {
          alert('Could not find selected members')
          return
        }

        // Get event ID
        const eventData = events.find((e) => e.name === eventName)
        if (!eventData) {
          alert('Could not find selected event')
          return
        }

        // Convert to Pairing format with IDs
        const pairingToSave = {
          event_id: eventData.id,
          fight_number: pendingPairing.fight_number,
          sultada_number: String(pendingPairing.fight_number),
          mayron_entry_id: mayronMember.id,
          mayron_handler: pendingPairing.mayron_handler,
          mayron_weight: pendingPairing.mayron_weight,
          mayron_betting: pendingPairing.mayron_betting,
          wala_entry_id: walaMember.id,
          wala_handler: pendingPairing.wala_handler,
          wala_weight: pendingPairing.wala_weight,
          wala_betting: pendingPairing.wala_betting,
          diferencia: pendingPairing.diferencia
        }

        await addPairing(pairingToSave)
      } catch (error) {
        console.error('Error adding pairing:', error)
        alert('Failed to save pairing')
      }
    }
    setShowConfirmation(false)
    setPendingPairing(null)
    handleCloseModal()
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setPendingPairing(null)
  }

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Pairing</h1>
        <p>Create fight pairings</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', width: '100%', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '260px' }}>
            <label htmlFor="pairingEventSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Select Event</label>
            <select
              id="pairingEventSelect"
              className="form-input"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              style={{ textAlign: 'center' }}
            >
              {sortedEvents.map((event) => (
                <option key={event.id} value={event.name}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn-add-event" onClick={handleCreatePairing}>+ Add New Pairing</button>
        </div>

        <div style={{ width: '100%', maxWidth: '1400px', margin: '2rem auto', overflowX: 'auto' }}>
          <table className="events-table" style={{ fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Fight #</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Mayron (Entry)</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Mayron (Handler)</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Mayron Weight</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Mayron Betting</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Wala (Entry)</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Wala (Handler)</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Wala Weight</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Wala Betting</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Diferencia</th>
                <th style={{ padding: '0.6rem', fontSize: '0.75rem' }}>Print</th>
              </tr>
            </thead>
            <tbody>
              {eventPairings.map((pairing) => {
                // Look up member names from IDs
                const mayronMember = members.find((m) => m.id === pairing.mayron_entry_id)
                const walaMember = members.find((m) => m.id === pairing.wala_entry_id)

                return (
                  <tr key={pairing.id}>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.fight_number}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{mayronMember ? getBaseEntryName(mayronMember.entry_name) : 'N/A'}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.mayron_handler}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.mayron_weight}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>₱{pairing.mayron_betting}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{walaMember ? getBaseEntryName(walaMember.entry_name) : 'N/A'}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.wala_handler}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.wala_weight}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>₱{pairing.wala_betting}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem', backgroundColor: '#f0fff0', fontWeight: 'bold' }}>₱{pairing.diferencia}</td>
                    <td style={{ padding: '0.6rem', fontSize: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handlePrintFight(pairing, mayronMember, walaMember)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.7rem',
                          backgroundColor: '#e94560',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Pairing</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="eventName">Event Name <span className="required-asterisk">*</span></label>
                <select
                  id="eventName"
                  className="form-input"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                >
                  <option value="">Select an event</option>
                  {sortedEvents.map((event) => (
                    <option key={event.id} value={event.name}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.4rem', justifyContent: 'center' }}>
                <label>Fighter (Standing) <span className="required-asterisk">*</span></label>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.1rem' }}>MAYRON</label>
                  <select
                    className="form-input"
                    value={mayronEntry}
                    onChange={(e) => {
                      setMayronEntry(e.target.value)
                      const member = selectableMembers.find((m) => getBaseEntryName(m.entry_name) === e.target.value)
                      setMayronHandler(member?.handler_name || '')
                    }}
                    required
                  >
                    <option value="">Select member</option>
                    {selectableMembers.map((member) => (
                      <option key={member.id} value={getBaseEntryName(member.entry_name)}>
                        {getBaseEntryName(member.entry_name)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.1rem' }}>WALA</label>
                  <select
                    className="form-input"
                    value={walaEntry}
                    onChange={(e) => {
                      setWalaEntry(e.target.value)
                      const member = selectableMembers.find((m) => getBaseEntryName(m.entry_name) === e.target.value)
                      setWalaHandler(member?.handler_name || '')
                    }}
                    required
                  >
                    <option value="">Select member</option>
                    {selectableMembers.map((member) => (
                      <option key={member.id} value={getBaseEntryName(member.entry_name)}>
                        {getBaseEntryName(member.entry_name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mayronHandler">Handler Name <span className="required-asterisk">*</span></label>
                  <input
                    id="mayronHandler"
                    type="text"
                    className="form-input"
                    placeholder="Enter handler name"
                    value={mayronHandler}
                    onChange={(e) => setMayronHandler(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="walaHandler">Handler Name <span className="required-asterisk">*</span></label>
                  <input
                    id="walaHandler"
                    type="text"
                    className="form-input"
                    placeholder="Enter handler name"
                    value={walaHandler}
                    onChange={(e) => setWalaHandler(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mayronWeight">Cock Weight <span className="required-asterisk">*</span></label>
                  <input
                    id="mayronWeight"
                    type="text"
                    className="form-input"
                    placeholder="Enter cock weight"
                    value={mayronWeight}
                    onChange={(e) => setMayronWeight(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="walaWeight">Cock Weight <span className="required-asterisk">*</span></label>
                  <input
                    id="walaWeight"
                    type="text"
                    className="form-input"
                    placeholder="Enter cock weight"
                    value={walaWeight}
                    onChange={(e) => setWalaWeight(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="mayronBetting">Betting Number <span className="required-asterisk">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#666', pointerEvents: 'none' }}>₱</span>
                    <input
                      id="mayronBetting"
                      type="text"
                      className="form-input"
                      placeholder="Enter amount"
                      value={mayronBetting}
                      onChange={(e) => setMayronBetting(formatNumberWithCommas(e.target.value))}
                      style={{ paddingLeft: '1.8rem' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="walaBetting">Betting Number <span className="required-asterisk">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#666', pointerEvents: 'none' }}>₱</span>
                    <input
                      id="walaBetting"
                      type="text"
                      className="form-input"
                      placeholder="Enter amount"
                      value={walaBetting}
                      onChange={(e) => setWalaBetting(formatNumberWithCommas(e.target.value))}
                      style={{ paddingLeft: '1.8rem' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="diferencia">Diferencia</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#666', pointerEvents: 'none' }}>₱</span>
                    <input
                      id="diferencia"
                      type="text"
                      className="form-input"
                      placeholder="—"
                      value={calculatedDiferencia}
                      disabled
                      style={{ paddingLeft: '1.8rem', backgroundColor: '#f0fff0' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
              <button className="btn-add" onClick={handleSavePairing}>Add</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && pendingPairing && (
        <div className="modal-overlay" onClick={handleCancelConfirmation}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Pairing Details</h2>
              <button className="modal-close" onClick={handleCancelConfirmation}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#333' }}>Event</h3>
                <p style={{ fontSize: '1rem', fontWeight: '500', color: '#555' }}>{eventName}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333', textAlign: 'center' }}>MAYRON</h3>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Entry</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.mayron_entry}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Handler</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.mayron_handler}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Weight</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.mayron_weight} lbs</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Betting</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pendingPairing.mayron_betting}</p>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333', textAlign: 'center' }}>WALA</h3>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Entry</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.wala_entry}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Handler</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.wala_handler}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Weight</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.wala_weight} lbs</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Betting</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pendingPairing.wala_betting}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f0fff0', borderRadius: '5px', border: '2px solid #4caf50', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Diferencia</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>₱{pendingPairing.diferencia}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCancelConfirmation}>Cancel</button>
              <button className="btn-add" onClick={handleConfirmPairing}>Okay</button>
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

export default PairingPage
