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

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events])

  const filteredMembers = useMemo(() => {
    if (!eventName) return members
    return members.filter((member) => member.eventName === eventName)
  }, [eventName, members])

  const calculatedDiferencia = useMemo(() => {
    if (!mayronBetting || !walaBetting) return ''
    const mayron = parseFloat(mayronBetting)
    const wala = parseFloat(walaBetting)
    if (isNaN(mayron) || isNaN(wala)) return ''
    return Math.abs(mayron - wala).toString()
  }, [mayronBetting, walaBetting])

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

    setPairings([...pairings, newPairing])
    handleCloseModal()
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
                      onChange={(e) => setMayronBetting(e.target.value)}
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
                      onChange={(e) => setWalaBetting(e.target.value)}
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

      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Pairing
