import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      login(username)
      navigate('/dashboard')
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo-container">
          <img src="/logo.png" alt="Calinan Cockpit Arena Logo" className="login-logo" />
        </div>
        <h1>MEMBER LOGIN</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="remember-me-container">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div className="copyright">
        © 2026 Calinan Cockpit Arena. All rights reserved.
      </div>
    </div>
  )
}

export default Login
