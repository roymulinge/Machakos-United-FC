import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '□', exact: true, roles: ['owner', 'manager', 'ticket_officer'] },
  { path: '/admin/fixtures', label: 'Fixtures', icon: 'F', roles: ['owner', 'manager'] },
  { path: '/admin/results', label: 'Results', icon: 'R', roles: ['owner', 'manager'] },
  { path: '/admin/squad', label: 'Squad', icon: 'S', roles: ['owner', 'manager'] },
  { path: '/admin/tickets', label: 'Tickets', icon: 'T', roles: ['owner', 'manager', 'ticket_officer'] },
  { path: '/admin/verify', label: 'Gate Verify', icon: '✓', roles: ['owner', 'manager', 'ticket_officer'] },
]

export default function AdminLayout({ children }) {
  const { user, logoutUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  const visibleItems = NAV_ITEMS.filter(item =>
    user?.is_staff || item.roles.includes(user?.role)
  )

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 bg-green-700 rotate-45 group-hover:bg-black transition-colors" />
          <div>
            <p className="text-[#1a1a1a] font-semibold text-sm uppercase leading-none">Machakos</p>
            <p className="text-green-700 font-semibold text-sm uppercase leading-none">United</p>
          </div>
        </Link>

        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded px-2.5 py-0.5">
          <div className="w-1.5 h-1.5 bg-green-700 rounded-full" />
          <span className="text-green-700 text-xs uppercase tracking-widest font-semibold">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 group ${
              isActive(item)
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'text-gray-600 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span className="font-semibold tracking-wide">{item.label}</span>
            {isActive(item) && <div className="ml-auto w-1 h-4 bg-green-700 rounded-full" />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 text-xs font-semibold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#1a1a1a] text-xs font-semibold truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-gray-500 text-xs truncate capitalize">
              {user?.role || 'Staff'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded py-2 transition-all uppercase tracking-widest"
        >
          Sign Out
        </button>

        <Link to="/" className="block text-center mt-2 text-xs text-gray-500 hover:text-black transition-colors">
          Back to website
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-white text-[#1a1a1a] overflow-hidden" style={pageStyle}>
      <div className="hidden lg:flex lg:w-56 lg:flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col">
            <Sidebar />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-black transition-colors">
            Menu
          </button>

          <div className="hidden lg:block">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              {NAV_ITEMS.find(i => isActive(i))?.label || 'Admin'}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-600 uppercase tracking-widest border border-gray-200 px-3 py-1 rounded capitalize">
              {user?.role || 'staff'}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}