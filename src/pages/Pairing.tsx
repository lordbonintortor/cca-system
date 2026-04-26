import './Registration.css'
import { useState, useMemo } from 'react'

interface Event {
  id: number
  name: string
  type: string
  derbyInfo: string
  date: string
}

interface Member {
  id: number
  entryName: string
  eventName: string
  handlerName: string
  cockType: string
  numberOfEntries: number
  registrationDate: string
}

interface PairingRecord {
  id: number
  fightNumber: number
  mayronEntry: string
  mayronHandler: string
  mayronWeight: string
  mayronBetting: string
  walaEntry: string
  walaHandler: string
  walaWeight: string
  walaBetting: string
  diferencia: string
}

const INITIAL_EVENTS: Event[] = [
  { id: 1, name: 'Monday Night Match', type: 'Hack Fight', derbyInfo: 'Stag - 2 per Entry (45-50 lbs)', date: '2026-04-20' },
  { id: 2, name: 'Weekend Championship', type: 'Hack Fight', derbyInfo: 'Bullstag - 3 per Entry (55-65 lbs)', date: '2026-04-19' },
  { id: 3, name: 'Local Tournament', type: 'Hack Fight', derbyInfo: 'Cock - 2 per Entry (70-80 lbs)', date: '2026-04-18' },
  { id: 4, name: 'Spring Classic Derby', type: 'Hack Fight', derbyInfo: 'Stag / Bullstag - 4 per Entry (50-60 lbs)', date: '2026-04-17' },
  { id: 5, name: 'Inter-Club Battle', type: 'Hack Fight', derbyInfo: 'Bullstag - 2 per Entry (60-75 lbs)', date: '2026-04-16' },
  { id: 6, name: 'Regional Qualifier', type: 'Hack Fight', derbyInfo: 'Cock - 3 per Entry (75-90 lbs)', date: '2026-04-15' },
  { id: 7, name: 'Friendly Match Series', type: 'Hack Fight', derbyInfo: 'Stag - 3 per Entry (40-55 lbs)', date: '2026-04-14' },
  { id: 8, name: 'Championship Round', type: 'Hack Fight', derbyInfo: 'Bullstag / Cock - 2 per Entry (65-80 lbs)', date: '2026-04-13' },
  { id: 9, name: 'Rising Stars Tournament', type: 'Hack Fight', derbyInfo: 'Stag - 4 per Entry (35-50 lbs)', date: '2026-04-12' },
  { id: 10, name: 'Elite Division Match', type: 'Hack Fight', derbyInfo: 'Cock - 2 per Entry (80-95 lbs)', date: '2026-04-11' },
  { id: 11, name: 'April Opener', type: 'Hack Fight', derbyInfo: 'Stag / Bullstag - 3 per Entry (48-62 lbs)', date: '2026-04-10' },
  { id: 12, name: 'Grand Festival Battle', type: 'Hack Fight', derbyInfo: 'Bullstag - 3 per Entry (58-72 lbs)', date: '2026-04-09' },
  { id: 13, name: 'Provincial Challenge', type: 'Hack Fight', derbyInfo: 'Cock - 4 per Entry (72-88 lbs)', date: '2026-04-08' },
  { id: 14, name: 'Spring Warmup Series', type: 'Hack Fight', derbyInfo: 'Stag - 2 per Entry (42-58 lbs)', date: '2026-04-07' },
  { id: 15, name: 'National Preliminaries', type: 'Hack Fight', derbyInfo: 'Bullstag / Cock - 3 per Entry (60-78 lbs)', date: '2026-04-06' },
]

const INITIAL_MEMBERS: Member[] = [
  { id: 1, entryName: 'Juan Dela Cruz', eventName: 'Monday Night Match', handlerName: 'Carlos Santos', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 2, entryName: 'Maria Garcia', eventName: 'Weekend Championship', handlerName: 'Pedro Ramirez', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 3, entryName: 'Antonio Reyes', eventName: 'Local Tournament', handlerName: 'Miguel Torres', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
  { id: 4, entryName: 'Rosa Lopez', eventName: 'Spring Classic Derby', handlerName: 'Juan Mendoza', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-17' },
  { id: 5, entryName: 'Francisco Diaz', eventName: 'Inter-Club Battle', handlerName: 'Luis Fernandez', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-16' },
  { id: 6, entryName: 'Angela Morales', eventName: 'Regional Qualifier', handlerName: 'Ricardo Gutierrez', cockType: 'Cock', numberOfEntries: 3, registrationDate: '2026-04-15' },
  { id: 7, entryName: 'Roberto Flores', eventName: 'Friendly Match Series', handlerName: 'Daniel Navarro', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-14' },
  { id: 8, entryName: 'Elena Castillo', eventName: 'Championship Round', handlerName: 'Eduardo Vargas', cockType: 'Bullstag', numberOfEntries: 2, registrationDate: '2026-04-13' },
  { id: 9, entryName: 'Javier Romero', eventName: 'Rising Stars Tournament', handlerName: 'Fernando Ortiz', cockType: 'Stag', numberOfEntries: 4, registrationDate: '2026-04-12' },
  { id: 10, entryName: 'Carmen Rodriguez', eventName: 'Elite Division Match', handlerName: 'Guillermo Castro', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-11' },
  { id: 11, entryName: 'Manuel Santos', eventName: 'April Opener', handlerName: 'Hector Moreno', cockType: 'Stag', numberOfEntries: 3, registrationDate: '2026-04-10' },
  { id: 12, entryName: 'Lucia Hernandez', eventName: 'Grand Festival Battle', handlerName: 'Ignacio Ruiz', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-09' },
  { id: 13, entryName: 'Raúl Perez', eventName: 'Provincial Challenge', handlerName: 'Javier Molina', cockType: 'Cock', numberOfEntries: 4, registrationDate: '2026-04-08' },
  { id: 14, entryName: 'Isabel Martinez', eventName: 'Spring Warmup Series', handlerName: 'Karlo Fontanar', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-07' },
  { id: 15, entryName: 'Diego Sanchez', eventName: 'National Preliminaries', handlerName: 'Luis Pacabay', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-06' },
  { id: 16, entryName: 'Victor Martinez', eventName: 'Monday Night Match', handlerName: 'Alex Torres', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 17, entryName: 'Sophia Gonzales', eventName: 'Monday Night Match', handlerName: 'Mark Fernandez', cockType: 'Stag', numberOfEntries: 2, registrationDate: '2026-04-20' },
  { id: 18, entryName: 'Carlos Olivares', eventName: 'Weekend Championship', handlerName: 'Ron Santos', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 19, entryName: 'Patricia Alonzo', eventName: 'Weekend Championship', handlerName: 'Tom Garcia', cockType: 'Bullstag', numberOfEntries: 3, registrationDate: '2026-04-19' },
  { id: 20, entryName: 'Miguel Banaag', eventName: 'Local Tournament', handlerName: 'Vincent Valdez', cockType: 'Cock', numberOfEntries: 2, registrationDate: '2026-04-18' },
]

function Pairing() {
  const [events] = useState<Event[]>(INITIAL_EVENTS)
  const [members] = useState<Member[]>(INITIAL_MEMBERS)
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
  const [pairings, setPairings] = useState<PairingRecord[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingPairing, setPendingPairing] = useState<PairingRecord | null>(null)

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const filteredMembers = useMemo(() => {
    if (!eventName) return members
    return members.filter((member) => member.eventName === eventName)
  }, [eventName, members])

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

  const handlePrintFight = (pairing: PairingRecord) => {
    const printWindow = window.open('', '', 'height=800,width=600')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fight ${pairing.fightNumber}</title>
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
          <div class="fight-title">FIGHT #${pairing.fightNumber}</div>
          <div class="parada">
            <div class="parada-section">
              <div class="parada-header">PARADA (MAYRON)</div>
              <div class="parada-label">Entry</div>
              <div class="entry-name">${pairing.mayronEntry}</div>
              <div class="handler-name"><strong>Handler:</strong> ${pairing.mayronHandler}</div>
              <div class="weight"><strong>Weight:</strong> ${pairing.mayronWeight} lbs</div>
              <div class="betting"><strong>₱${pairing.mayronBetting}</strong></div>
            </div>
            <div class="parada-section">
              <div class="parada-header">PARADA (WALA)</div>
              <div class="parada-label">Entry</div>
              <div class="entry-name">${pairing.walaEntry}</div>
              <div class="handler-name"><strong>Handler:</strong> ${pairing.walaHandler}</div>
              <div class="weight"><strong>Weight:</strong> ${pairing.walaWeight} lbs</div>
              <div class="betting"><strong>₱${pairing.walaBetting}</strong></div>
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
    if (sortedEvents.length > 0) {
      setEventName(sortedEvents[0].name)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEventName('')
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

    const newPairing: PairingRecord = {
      id: Date.now(),
      fightNumber: pairings.length + 1,
      mayronEntry,
      mayronHandler,
      mayronWeight,
      mayronBetting,
      walaEntry,
      walaHandler,
      walaWeight,
      walaBetting,
      diferencia: calculatedDiferencia
    }

    setPendingPairing(newPairing)
    setShowConfirmation(true)
  }

  const handleConfirmPairing = () => {
    if (pendingPairing) {
      setPairings([pendingPairing, ...pairings])
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', width: '100%' }}>
          <button className="btn-add-event" onClick={handleCreatePairing}>+ Add New Pair</button>
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
              {pairings.map((pairing) => (
                <tr key={pairing.id}>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.fightNumber}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.mayronEntry}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.mayronHandler}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.mayronWeight}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>₱{pairing.mayronBetting}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.walaEntry}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.walaHandler}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>{pairing.walaWeight}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem' }}>₱{pairing.walaBetting}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem', backgroundColor: '#f0fff0', fontWeight: 'bold' }}>₱{pairing.diferencia}</td>
                  <td style={{ padding: '0.6rem', fontSize: '0.75rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handlePrintFight(pairing)}
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
              ))}
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
                    onChange={(e) => setMayronEntry(e.target.value)}
                    required
                  >
                    <option value="">Select member</option>
                    {filteredMembers.map((member) => (
                      <option key={member.id} value={member.entryName}>
                        {member.entryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', display: 'block', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.1rem' }}>WALA</label>
                  <select
                    className="form-input"
                    value={walaEntry}
                    onChange={(e) => setWalaEntry(e.target.value)}
                    required
                  >
                    <option value="">Select member</option>
                    {filteredMembers.map((member) => (
                      <option key={member.id} value={member.entryName}>
                        {member.entryName}
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
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.mayronEntry}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Handler</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.mayronHandler}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Weight</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.mayronWeight} lbs</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Betting</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pendingPairing.mayronBetting}</p>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px solid #e0e0e0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333', textAlign: 'center' }}>WALA</h3>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Entry</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.walaEntry}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Handler</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.walaHandler}</p>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Weight</p>
                    <p style={{ fontSize: '1rem', fontWeight: '600', color: '#333' }}>{pendingPairing.walaWeight} lbs</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem' }}>Betting</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#e94560' }}>₱{pendingPairing.walaBetting}</p>
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

export default Pairing
