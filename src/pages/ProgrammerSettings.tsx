import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useData } from '../context/useDataContext'

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return ''
  }

  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

const rowToRecord = (row: unknown) => row as Record<string, unknown>

const downloadCsv = (filename: string, rows: unknown[]) => {
  const headerSet = new Set<string>()
  rows.forEach((row) => {
    Object.keys(rowToRecord(row)).forEach((key) => headerSet.add(key))
  })
  const headers = Array.from(headerSet)

  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(rowToRecord(row)[header])).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function ProgrammerSettings() {
  const { user } = useAuth()
  const { events, members, pairings, taggedFights, releasedFights, raffleWinners } = useData()

  // Only programmers can access this view
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'programmer') return <Navigate to="/dashboard" replace />

  const handleExportBackup = () => {
    const stamp = new Date().toISOString().slice(0, 10)
    const exports = [
      { name: 'events', rows: events },
      { name: 'members', rows: members },
      { name: 'pairings', rows: pairings },
      { name: 'tagged_fights', rows: taggedFights },
      { name: 'released_fights', rows: releasedFights },
      { name: 'raffle_winners', rows: raffleWinners },
    ]

    exports.forEach((table) => {
      downloadCsv(`cca-${table.name}-${stamp}.csv`, table.rows)
    })
  }

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Programmer Settings</h1>
        <p>Developer configuration and diagnostic options live here.</p>
        <section>
          <h2>Backup Export</h2>
          <p>Download CSV backups for the core system tables.</p>
          <button
            className="btn-add-event"
            onClick={handleExportBackup}
            style={{ marginTop: '1rem' }}
          >
            Export Backup CSVs
          </button>
        </section>
      </div>
      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default ProgrammerSettings
