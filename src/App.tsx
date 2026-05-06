import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { TaggingProvider } from './context/TaggingContext'
import { useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import './styles/theme.css'
import './App.css'
import './pages/Events.css'
import './pages/Registration.css'
import './pages/Raffle.css'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Events = lazy(() => import('./pages/Events'))
const Registration = lazy(() => import('./pages/Registration'))
const Pairing = lazy(() => import('./pages/Pairing'))
const Tagging = lazy(() => import('./pages/Tagging'))
const Releasing = lazy(() => import('./pages/Releasing'))
const Reports = lazy(() => import('./pages/Reports'))
const Results = lazy(() => import('./pages/Results'))
const Raffle = lazy(() => import('./pages/Raffle'))
const ProgrammerSettings = lazy(() => import('./pages/ProgrammerSettings'))

function AppContent() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Login />
  }

  return (
    <AuthenticatedApp />
  )
}

function AuthenticatedApp() {
  return (
    <DataProvider>
      <TaggingProvider>
        <Suspense fallback={<div className="page-content">Loading...</div>}>
          <Routes>
            <Route element={<Sidebar />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/pairing" element={<Pairing />} />
              <Route path="/tagging" element={<Tagging />} />
              <Route path="/releasing" element={<Releasing />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/results" element={<Results />} />
              <Route path="/raffle" element={<Raffle />} />
              <Route path="/settings" element={<ProgrammerSettings />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </TaggingProvider>
    </DataProvider>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
