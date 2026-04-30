import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect } from 'react'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isEventsExpanded, setIsEventsExpanded] = useState(false)

  useEffect(() => {
    // keep submenu expanded when the current route is any events-related page
    const eventPaths = ['/events', '/registration', '/pairing', '/tagging', '/releasing', '/reports', '/results', '/raffle']
    if (eventPaths.some((p) => location.pathname.startsWith(p))) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEventsExpanded(true)
    } else {
      setIsEventsExpanded(false)
    }
  }, [location.pathname])

  const handleRegistrationClick = () => {
    navigate('/registration')
  }

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
                <button 
                  onClick={handleRegistrationClick}
                  className={`nav-submenu-item ${isActive('/registration') ? 'nav-submenu-item-active' : ''}`}
                >
                  Registration
                </button>
                <button 
                  onClick={() => navigate('/pairing')}
                  className={`nav-submenu-item ${isActive('/pairing') ? 'nav-submenu-item-active' : ''}`}
                >
                  Pairing
                </button>
                <button 
                  onClick={() => navigate('/tagging')}
                  className={`nav-submenu-item ${isActive('/tagging') ? 'nav-submenu-item-active' : ''}`}
                >
                  Tagging
                </button>
                <button 
                  onClick={() => navigate('/releasing')}
                  className={`nav-submenu-item ${isActive('/releasing') ? 'nav-submenu-item-active' : ''}`}
                >
                  Releasing
                </button>
                <button 
                  onClick={() => navigate('/reports')}
                  className={`nav-submenu-item ${isActive('/reports') ? 'nav-submenu-item-active' : ''}`}
                >
                  Reports
                </button>
                <button 
                  onClick={() => navigate('/results')}
                  className={`nav-submenu-item ${isActive('/results') ? 'nav-submenu-item-active' : ''}`}
                >
                  Results
                </button>
                <button 
                  onClick={() => navigate('/raffle')}
                  className={`nav-submenu-item ${isActive('/raffle') ? 'nav-submenu-item-active' : ''}`}
                >
                  Raffle
                </button>
              </div>
            )}
          </div>
          {user?.role === 'programmer' && (
            <button 
              onClick={() => navigate('/settings')}
              className={`nav-item ${isActive('/settings') ? 'nav-item-active' : ''}`}
            >
              <img src="/setting.png" alt="Programmer Settings" className="nav-icon" />
              Dev Settings
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <p className="user-name">Welcome, {user?.fullName || user?.username}</p>
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
