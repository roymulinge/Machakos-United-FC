import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const linkClass = (path) =>
    `text-sm font-semibold tracking-wide transition-colors duration-200 ${
      isActive(path)
        ? 'text-green-700'
        : 'text-[#1a1a1a] hover:text-green-700'
    }`

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-gray-200'
          : 'bg-white/90 backdrop-blur-sm border-gray-100'
      }`}
      style={navStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-green-700 rotate-45 group-hover:bg-black transition-colors duration-200" />
            <span className="text-[#1a1a1a] font-semibold text-xl tracking-tight">
              Machakos <span className="text-green-700">United</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/fixtures" className={linkClass('/fixtures')}>Fixtures</Link>
            <Link to="/results" className={linkClass('/results')}>Results</Link>
            <Link to="/squad" className={linkClass('/squad')}>Squad</Link>
            <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user?.is_admin_user && (
              <Link
                to="/admin"
                className="text-xs text-green-700 hover:text-black font-semibold border border-green-200 hover:border-green-700 px-3 py-1.5 rounded transition-all uppercase tracking-widest"
              >
                Admin
              </Link>
            )}

            {user ? (
              <Link
                to="/profile"
                className="text-sm text-[#1a1a1a] hover:text-green-700 transition-colors font-semibold"
              >
                {user.first_name}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[#1a1a1a] hover:text-green-700 transition-colors font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-black hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#1a1a1a] hover:text-green-700 p-2"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white px-4 py-4 flex flex-col gap-4 border-t border-gray-200">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/fixtures" className={linkClass('/fixtures')}>Fixtures</Link>
          <Link to="/results" className={linkClass('/results')}>Results</Link>
          <Link to="/squad" className={linkClass('/squad')}>Squad</Link>
          <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>

          {user?.is_admin_user && (
            <Link
              to="/admin"
              className="text-xs text-green-700 uppercase tracking-widest font-semibold border border-green-200 px-3 py-1.5 rounded w-fit"
            >
              Admin Panel
            </Link>
          )}

          <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 text-xs font-semibold">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#1a1a1a] text-sm font-semibold">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                </div>

                <Link to="/profile" className="text-sm text-[#1a1a1a] hover:text-green-700 transition-colors">
                  My Profile
                </Link>
                <Link to="/profile" className="text-sm text-[#1a1a1a] hover:text-green-700 transition-colors">
                  My Tickets
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 text-left transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-[#1a1a1a] font-semibold">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-black text-white font-semibold px-4 py-2 rounded text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar