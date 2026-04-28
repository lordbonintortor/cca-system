import { useAuth } from '../hooks/useAuth'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="page-content">
      <div className="page-main">
        <h1>Welcome to Dashboard</h1>
        <p>Hello, {user?.fullName || 'Admin'}! 👋</p>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#777' }}>
          You are logged in as <strong>{user?.username}</strong> with <strong>{user?.role}</strong> role.
        </p>
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '100%', maxWidth: '1000px', alignSelf: 'flex-start', textAlign: 'left' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#333', textAlign: 'left' }}>Quick Overview</h2>
          <p style={{ textAlign: 'left' }}>Access all features from the sidebar menu:</p>
          <ul style={{ marginTop: '10px', marginLeft: '20px', lineHeight: '1.8', textAlign: 'left' }}>
            <li><strong>Events</strong> - Manage cockfighting events and tournaments</li>
            <li><strong>Registration</strong> - Register members and entries</li>
            <li><strong>Pairing</strong> - Create fight pairings</li>
            <li><strong>Tagging</strong> - Tag fight results</li>
            <li><strong>Releasing</strong> - Release fight information</li>
            <li><strong>Reports</strong> - View detailed reports</li>
            <li><strong>Results</strong> - Check fight results</li>
            <li><strong>Raffle</strong> - Manage raffle draws</li>
            <li><strong>Settings</strong> - Configure system settings</li>
          </ul>
        </div>
      </div>
      <div className="page-copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Dashboard
