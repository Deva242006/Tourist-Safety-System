import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import TouristDashboard from './pages/TouristDashboard.jsx'
import TouristProfile from './pages/TouristProfile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import OfficerLogin from './pages/OfficerLogin.jsx'
import OfficerDashboard from './pages/OfficerDashboard.jsx'
import Navbar from './components/Navbar.jsx'
import GlobalSosButton from './components/GlobalSosButton.jsx'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', width: '100%', flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tourist" element={<PrivateRoute role="tourist"><TouristDashboard /></PrivateRoute>} />
          <Route path="/tourist/profile" element={<PrivateRoute role="tourist"><TouristProfile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/officer-login" element={<OfficerLogin />} />
          <Route path="/officer" element={<PrivateRoute role="officer"><OfficerDashboard /></PrivateRoute>} />
        </Routes>
      </main>
      <GlobalSosButton />
    </div>
  )
}
