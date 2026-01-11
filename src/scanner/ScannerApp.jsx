import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ScannerLogin from './pages/ScannerLogin'
import ScannerHome from './pages/ScannerHome'
import ScanResult from './pages/ScanResult'
import ScanHistory from './pages/ScanHistory'

const SCANNER_ADMINS = ['wilson@mutant.ae']

const ScannerApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('scannerAdmin')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      if (SCANNER_ADMINS.includes(user.email)) {
        setAdminUser(user)
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleLogin = (user) => {
    if (SCANNER_ADMINS.includes(user.email)) {
      setAdminUser(user)
      setIsAuthenticated(true)
      localStorage.setItem('scannerAdmin', JSON.stringify(user))
      return true
    }
    return false
  }

  const handleLogout = () => {
    setAdminUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('scannerAdmin')
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <ScannerLogin onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <ScannerHome user={adminUser} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/result" 
          element={
            isAuthenticated ? 
              <ScanResult /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/history" 
          element={
            isAuthenticated ? 
              <ScanHistory /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default ScannerApp
