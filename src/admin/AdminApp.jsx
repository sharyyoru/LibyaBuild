import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Login from './portals/Login'
import Unauthorized from './portals/Unauthorized'

// Super Admin
import SuperAdminDashboard from './portals/SuperAdmin/Dashboard'
import Users from './portals/SuperAdmin/Users'
import UserManagement from './pages/UserManagement'

// Exhibitor
import ExhibitorDashboard from './portals/Exhibitor/Dashboard'

// Placeholder components for other portals
const ComingSoon = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600">This portal is under development.</p>
  </div>
)

function AdminApp() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/unauthorized" element={<Unauthorized />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Super Admin Routes */}
            <Route path="super/dashboard" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="super/users" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="super/activities" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <ComingSoon title="Activity Management" />
              </ProtectedRoute>
            } />
            <Route path="super/settings" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <ComingSoon title="System Settings" />
              </ProtectedRoute>
            } />
            <Route path="super/user-management" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />

            {/* Sales Routes - Local */}
            <Route path="sales/local/dashboard" element={
              <ProtectedRoute requiredRoles={['local_sales']} locale="local">
                <ComingSoon title="Sales Dashboard (Local)" />
              </ProtectedRoute>
            } />
            
            {/* Sales Routes - International */}
            <Route path="sales/international/dashboard" element={
              <ProtectedRoute requiredRoles={['international_sales']} locale="international">
                <ComingSoon title="Sales Dashboard (International)" />
              </ProtectedRoute>
            } />

            {/* Finance Routes - Local */}
            <Route path="finance/local/dashboard" element={
              <ProtectedRoute requiredRoles={['local_finance']} locale="local">
                <ComingSoon title="Finance Dashboard (Local)" />
              </ProtectedRoute>
            } />

            {/* Finance Routes - International */}
            <Route path="finance/international/dashboard" element={
              <ProtectedRoute requiredRoles={['international_finance']} locale="international">
                <ComingSoon title="Finance Dashboard (International)" />
              </ProtectedRoute>
            } />

            {/* Operations Routes - Local */}
            <Route path="operations/local/dashboard" element={
              <ProtectedRoute requiredRoles={['local_operations']} locale="local">
                <ComingSoon title="Operations Dashboard (Local)" />
              </ProtectedRoute>
            } />

            {/* Operations Routes - International */}
            <Route path="operations/international/dashboard" element={
              <ProtectedRoute requiredRoles={['international_operations']} locale="international">
                <ComingSoon title="Operations Dashboard (International)" />
              </ProtectedRoute>
            } />

            {/* Marketing Routes */}
            <Route path="marketing/dashboard" element={
              <ProtectedRoute requiredRoles={['marketing']}>
                <ComingSoon title="Marketing Dashboard" />
              </ProtectedRoute>
            } />
          </Route>

          {/* Exhibitor Portal Routes */}
          <Route
            path="/exhibitor/*"
            element={
              <ProtectedRoute requiredRoles={['exhibitor']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ExhibitorDashboard />} />
            <Route path="forms" element={<ComingSoon title="Forms" />} />
            <Route path="assets" element={<ComingSoon title="Digital Assets" />} />
            <Route path="chat" element={<ComingSoon title="B2B Chat" />} />
            <Route path="invoices" element={<ComingSoon title="Invoices" />} />
          </Route>

          {/* Partner Portal Routes */}
          <Route
            path="/partner/*"
            element={
              <ProtectedRoute requiredRoles={['partner_with_stand', 'partner_without_stand']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ComingSoon title="Partner Dashboard" />} />
            <Route path="forms" element={<ComingSoon title="Partner Forms" />} />
            <Route path="updates" element={<ComingSoon title="Event Updates" />} />
          </Route>

          {/* Agent Portal Routes */}
          <Route
            path="/agent/*"
            element={
              <ProtectedRoute requiredRoles={['agent']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ComingSoon title="Agent Dashboard" />} />
            <Route path="exhibitors" element={<ComingSoon title="My Exhibitors" />} />
            <Route path="invoices" element={<ComingSoon title="Invoices" />} />
            <Route path="assets" element={<ComingSoon title="Marketing Assets" />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default AdminApp
