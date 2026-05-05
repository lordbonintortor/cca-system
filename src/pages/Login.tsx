import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggedIn, isLoading, error, logoutReason, loginStatus } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      login(username, password)
    }
  }

  const isLoginSuccess = loginStatus === 'success'

  return (
    <div className="login-container">
      <div className={`login-box ${isLoginSuccess ? 'login-box-success' : ''}`}>
        {isLoginSuccess && (
          <div className="login-success-overlay" aria-live="polite">
            <div className="login-success-ring">
              <div className="login-success-check">✓</div>
            </div>
            <div className="login-success-progress" aria-hidden="true">
              <div className="login-success-progress-bar" />
            </div>
            <p>Logging you into the system...</p>
          </div>
        )}
        <div className="login-logo-container">
          <img src="/logo.png" alt="Calinan Cockpit Arena Logo" className="login-logo" />
        </div>
        <h1 className={isLoginSuccess ? 'login-title-success' : ''}>USER LOGIN</h1>
        {error && <div className="error-message">{error}</div>}
        {!error && logoutReason === 'expired' && (
          <div className="error-message">Session expired. Please log in again.</div>
        )}
        <form onSubmit={handleSubmit} className={isLoginSuccess ? 'login-form-success' : ''}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading || isLoginSuccess}
          />
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || isLoginSuccess}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading || isLoginSuccess}
            >
              <img
                src={showPassword ? '/hide.png' : '/seen.png'}
                alt={showPassword ? 'Hide password' : 'Show password'}
                className="password-icon"
              />
            </button>
          </div>
          {/* Remember-me removed: sessions persist until explicit logout */}
          <button type="submit" disabled={isLoading || isLoginSuccess}>
            {isLoginSuccess ? 'Success' : isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
      <div className="copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Login
