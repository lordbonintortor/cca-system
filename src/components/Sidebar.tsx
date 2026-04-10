import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/logo.png" alt="Calinan Cockpit Arena Logo" className="logo" />
          </div>
          <h2>Calinan Cockpit Arena</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            onClick={() => navigate('/dashboard')}
            className="nav-item"
          >
            <img src="/dashboard.png" alt="Dashboard" className="nav-icon" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/events')}
            className="nav-item"
          >
            <img src="/event.png" alt="Events" className="nav-icon" />
            Events
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="nav-item"
          >
            <img src="/setting.png" alt="Settings" className="nav-icon" />
            Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <p className="user-name">Welcome, {user}</p>
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            Log Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Sidebar
