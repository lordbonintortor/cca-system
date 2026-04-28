import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProgrammerSettings() {
  const { user } = useAuth()

  // Only programmers can access this view
  if (!user) return <Navigate to="/" replace />
  if (user.role !== 'programmer') return <Navigate to="/dashboard" replace />

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Programmer Settings</h1>
        <p>Developer configuration and diagnostic options live here.</p>
        <section>
          <h2>Feature Flags</h2>
          <p>Toggle experimental features and debug options.</p>
        </section>
      </div>
      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default ProgrammerSettings
