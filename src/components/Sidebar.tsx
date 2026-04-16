import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isEventsExpanded, setIsEventsExpanded] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleEventsClick = () => {
    setIsEventsExpanded(!isEventsExpanded)
    navigate('/events')
  }

  const isActive = (path: string) => location.pathname === path

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
            className={`nav-item ${isActive('/dashboard') ? 'nav-item-active' : ''}`}
          >
            <img src="/dashboard.png" alt="Dashboard" className="nav-icon" />
            Dashboard
          </button>
          <div className="nav-item-with-submenu">
            <button 
              onClick={handleEventsClick}
              className={`nav-item ${isActive('/events') ? 'nav-item-active' : ''}`}
            >
              <img src="/event.png" alt="Events" className="nav-icon" />
              Events
            </button>
            {isEventsExpanded && (
              <div className="nav-submenu">
                <button className="nav-submenu-item">
                  Registration
                </button>
                <button className="nav-submenu-item">
                  Pairing
                </button>
                <button className="nav-submenu-item">
                  Tagging
                </button>
                <button className="nav-submenu-item">
                  Releasing
                </button>
                <button className="nav-submenu-item">
                  Reports
                </button>
                <button className="nav-submenu-item">
                  Results
                </button>
                <button className="nav-submenu-item">
                  Raffle
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className={`nav-item ${isActive('/settings') ? 'nav-item-active' : ''}`}
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
