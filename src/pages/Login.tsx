import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggedIn, isLoading, error } = useAuth()
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

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo-container">
          <img src="/logo.png" alt="Calinan Cockpit Arena Logo" className="login-logo" />
        </div>
        <h1>MEMBER LOGIN</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              <img
                src={showPassword ? '/hide.png' : '/seen.png'}
                alt={showPassword ? 'Hide password' : 'Show password'}
                className="password-icon"
              />
            </button>
          </div>
          {/* Remember-me removed: sessions persist until explicit logout */}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
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
