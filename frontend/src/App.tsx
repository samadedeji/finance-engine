import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { auth } from './api/client'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Savings from './pages/Savings'
import Wema from './pages/Wema'
import Prices from './pages/Prices'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'

function Protected({ children }: { children: React.ReactNode }) {
  if (!auth.getBusiness()) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/reports" element={<Protected><Reports /></Protected>} />
          <Route path="/chat" element={<Protected><Chat /></Protected>} />
          <Route path="/savings" element={<Protected><Savings /></Protected>} />
          <Route path="/wema" element={<Protected><Wema /></Protected>} />
          <Route path="/prices" element={<Protected><Prices /></Protected>} />
          <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
