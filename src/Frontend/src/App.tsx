import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard.tsx'
import { ManagementConsole } from './pages/ManagementConsole.tsx'
import { RequestsPage } from './pages/RequestsPage.tsx'
import { ProcurementPage } from './pages/ProcurementPage.tsx'
import { TendersPage } from './pages/TendersPage.tsx'
import { NotificationsPage } from './pages/NotificationsPage.tsx'
import { ProfilePage } from './pages/ProfilePage.tsx'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './context/AuthContext'

const DRAWER_WIDTH = 260

function ProtectedLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
            minHeight: 'calc(100vh - 70px)',
            backgroundColor: 'background.default',
            overflow: 'auto'
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/management-console" element={<ManagementConsole />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/procurement" element={<ProcurementPage />} />
            <Route path="/tenders" element={<TendersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  )
}

function App() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}

export default App