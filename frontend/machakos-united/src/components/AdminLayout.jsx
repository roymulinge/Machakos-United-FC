// src/components/AdminLayout.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── nav items config ──────────────────────────────────────────────────────────
// Each item has a path, label, icon (emoji for now), and which roles can see it
const NAV_ITEMS = [
  {
    path:  '/admin',
    label: 'Dashboard',
    icon:  '▦',
    exact: true,   // only highlight when path is exactly /admin
    roles: ['owner', 'manager', 'ticket_officer'],
  },
  {
    path:  '/admin/fixtures',
    label: 'Fixtures',
    icon:  '📅',
    roles: ['owner', 'manager'],
  },
  {
    path:  '/admin/results',
    label: 'Results',
    icon:  '⚽',
    roles: ['owner', 'manager'],
  },
  {
    path:  '/admin/squad',
    label: 'Squad',
    icon:  '👥',
    roles: ['owner', 'manager'],
  },
  {
    path:  '/admin/tickets',
    label: 'Tickets',
    icon:  '🎟',
    roles: ['owner', 'manager', 'ticket_officer'],
  },
  {
    path:  '/admin/verify',
    label: 'Gate Verify',
    icon:  '✓',
    roles: ['owner', 'manager', 'ticket_officer'],
  },
]

export default function AdminLayout({ children }) {
  const { user, logoutUser } = useAuth()
  const location             = useLocation()
  const navigate             = useNavigate()
  // sidebarOpen controls mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  // filter nav items based on user role
  const visibleItems = NAV_ITEMS.filter(item =>
    user?.is_staff || item.roles.includes(user?.role)
  )

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#060c06] border-r border-white/5">

      {/* logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 bg-green-500 rotate-45
                          group-hover:bg-green-400 transition-colors" />
          <div>
            <p className="text-white font-black text-sm uppercase tracking-tight leading-none">
              Machakos
            </p>
            <p className="text-green-400 font-black text-sm uppercase tracking-tight leading-none">
              United
            </p>
          </div>
        </Link>
        {/* admin badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/10
                        border border-green-500/20 rounded-full px-2.5 py-0.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs uppercase tracking-widest font-medium">
            Admin
          </span>
        </div>
      </div>

      {/* nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                        transition-all duration-200 group ${
              isActive(item)
                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span className="font-medium tracking-wide">{item.label}</span>
            {/* active indicator bar */}
            {isActive(item) && (
              <div className="ml-auto w-1 h-4 bg-green-500 rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* user info + logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          {/* avatar */}
          <div className="w-8 h-8 rounded-full bg-green-600/20 border border-green-500/30
                          flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-xs font-black">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-gray-600 text-xs truncate capitalize">
              {user?.role || 'Staff'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-600 hover:text-red-400 border border-white/5
                     hover:border-red-500/20 rounded-lg py-2 transition-all uppercase
                     tracking-widest"
        >
          Sign Out
        </button>
        <Link
          to="/"
          className="block text-center mt-2 text-xs text-gray-700 hover:text-gray-500
                     transition-colors"
        >
          ← Back to website
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#080d08] overflow-hidden">

      {/* ── desktop sidebar: always visible on lg+ ── */}
      <div className="hidden lg:flex lg:w-56 lg:flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* ── mobile sidebar: overlay ── */}
      {sidebarOpen && (
        <>
          {/* backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* sidebar panel slides in from left */}
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col">
            <Sidebar />
          </div>
        </>
      )}

      {/* ── main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* top bar */}
        <header className="flex items-center justify-between px-6 py-4
                           border-b border-white/5 bg-[#080d08] flex-shrink-0">
          {/* mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            ☰
          </button>

          {/* current page title — derived from pathname */}
          <div className="hidden lg:block">
            <p className="text-xs text-gray-600 uppercase tracking-widest">
              {NAV_ITEMS.find(i => isActive(i))?.label || 'Admin'}
            </p>
          </div>

          {/* right side: role badge */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-600 uppercase tracking-widest
                             border border-white/5 px-3 py-1 rounded-full capitalize">
              {user?.role || 'staff'}
            </span>
          </div>
        </header>

        {/* scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}