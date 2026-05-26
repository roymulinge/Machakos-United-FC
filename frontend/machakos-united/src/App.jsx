// Import BrowserRouter to enable routing throughout the app
// Routes and Route define which component renders at which URL
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
import FixturesPage from './pages/FixturesPage'   // NEW
import ResultsPage from './pages/ResultsPage'
import SquadPage from './pages/SquadPage'
import TicketsPage from './pages/TicketsPage'
import NotFound from './pages/NotFound'

function App() {
  return (
    // BrowserRouter must wrap EVERYTHING that uses routing
    // Without this, useNavigate() and <Link> crash — that was your error
    <BrowserRouter>

      {/* Navbar appears on every page because it's outside <Routes> */}
      <Navbar />

      {/* Routes looks at the current URL and renders the matching Route */}
      <Routes>
        {/* index means this is the default — renders at "/" */}
        <Route index element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/fixtures"        element={<FixturesPage />} />   {/* NEW */}
        <Route path="/results"         element={<ResultsPage />} /> 
        <Route path="/squad" element={<SquadPage />} />
        <Route path="/tickets" element={<TicketsPage />} />

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

        <Route path="/admin/squad/*" element={
          <AdminRoute>
            <AdminLayout><AdminSquad /></AdminLayout>
          </AdminRoute>
        } />

        <Route path="/admin/results/new" element={
          <AdminRoute>
            <AdminLayout><AdminResults /></AdminLayout>
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

        <Route path="/admin/results/*" element={
          <AdminRoute>
            <AdminLayout><AdminResults /></AdminLayout>
          </AdminRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App