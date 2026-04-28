import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { TaggingProvider } from './context/TaggingContext'
import { useAuth } from './hooks/useAuth'
import { seedDatabase } from './lib/seedDatabase'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Registration from './pages/Registration'
import Pairing from './pages/Pairing'
import Tagging from './pages/Tagging'
import Releasing from './pages/Releasing'
import Reports from './pages/Reports'
import Results from './pages/Results'
import Raffle from './pages/Raffle'
import Settings from './pages/Settings'
import './styles/theme.css'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/" />
}

function AppContent() {
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    // Seed database on first load
    seedDatabase()
  }, [])

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
      <Route element={<ProtectedRoute><Sidebar /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/pairing" element={<Pairing />} />
        <Route path="/tagging" element={<Tagging />} />
        <Route path="/releasing" element={<Releasing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/results" element={<Results />} />
        <Route path="/raffle" element={<Raffle />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <TaggingProvider>
            <AppContent />
          </TaggingProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
