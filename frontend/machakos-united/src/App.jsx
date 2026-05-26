import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminFixtures from './pages/admin/AdminFixtures'
import AdminSquad from './pages/admin/AdminSquad'
import AdminTickets from './pages/admin/AdminTickets'
import AdminResults from './pages/admin/AdminResults'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import FixturesPage from './pages/FixturesPage'
import ResultsPage from './pages/ResultsPage'
import SquadPage from './pages/SquadPage'
import TicketsPage from './pages/TicketsPage'
import NotFound from './pages/NotFound'

// ── Layout wrapper for all public pages ───────────────────────────────────────
// Renders Navbar + the page content
// Only used on public routes — admin routes use AdminLayout instead
function PublicLayout({ children }) {
  return (
    <>
      {/* Navbar only appears on public pages — not on /admin/* */}
      <Navbar />
      {children}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes — all wrapped in PublicLayout (has Navbar) ── */}
        <Route index element={
          <PublicLayout><HomePage /></PublicLayout>
        } />
        <Route path="/login" element={
          <PublicLayout><Login /></PublicLayout>
        } />
        <Route path="/register" element={
          <PublicLayout><Register /></PublicLayout>
        } />
        <Route path="/profile" element={
          <PublicLayout><Profile /></PublicLayout>
        } />
        <Route path="/forgot-password" element={
          <PublicLayout><ForgotPassword /></PublicLayout>
        } />
        <Route path="/fixtures" element={
          <PublicLayout><FixturesPage /></PublicLayout>
        } />
        <Route path="/results" element={
          <PublicLayout><ResultsPage /></PublicLayout>
        } />
        <Route path="/squad" element={
          <PublicLayout><SquadPage /></PublicLayout>
        } />
        <Route path="/tickets" element={
          <PublicLayout><TicketsPage /></PublicLayout>
        } />
        <Route path="*" element={
          <PublicLayout><NotFound /></PublicLayout>
        } />

        {/* ── Admin routes — NO Navbar, use AdminLayout sidebar instead ── */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/fixtures/*" element={
          <AdminRoute>
            <AdminLayout><AdminFixtures /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/results/*" element={
          <AdminRoute>
            <AdminLayout><AdminResults /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/squad/*" element={
          <AdminRoute>
            <AdminLayout><AdminSquad /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/tickets" element={
          <AdminRoute>
            <AdminLayout><AdminTickets /></AdminLayout>
          </AdminRoute>
        } />
        <Route path="/admin/verify" element={
          <AdminRoute>
            <AdminLayout><AdminTickets /></AdminLayout>
          </AdminRoute>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App