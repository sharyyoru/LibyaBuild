import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ScannerHome from './pages/ScannerHome'
import ScanResult from './pages/ScanResult'
import ScanHistory from './pages/ScanHistory'

const ScannerApp = () => {
  const defaultUser = { email: 'scanner@libyabuild.com', id: 'scanner-admin' }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScannerHome user={defaultUser} />} />
        <Route path="/result" element={<ScanResult />} />
        <Route path="/history" element={<ScanHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default ScannerApp
