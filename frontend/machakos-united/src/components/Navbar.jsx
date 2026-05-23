// useState — track if mobile menu is open or closed
// useEffect — close menu when route changes
import { useState, useEffect } from 'react'

// Link — React Router's anchor tag. Never use <a href> for internal pages
// useLocation — tells us the current URL so we can highlight the active link
// useNavigate — lets us navigate programmatically (e.g. after logout)
import { Link, useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  // isOpen controls whether the mobile hamburger menu is visible
  const [isOpen, setIsOpen] = useState(false)

  // scrolled tracks if user scrolled down — we change navbar bg on scroll
  const [scrolled, setScrolled] = useState(false)

  // location.pathname gives us the current URL e.g. "/login"
  const location = useLocation()

  // Close mobile menu whenever the user navigates to a new page
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])  // re-runs every time the URL changes

  // Add scroll listener to change navbar background when user scrolls down
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    // Cleanup: remove listener when Navbar unmounts (memory leak prevention)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])  // empty array = run once on mount

  // Helper to check if a link is the current active page
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // Reusable nav link class — highlights green if it's the active page
  const linkClass = (path) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 ${
      isActive(path)
        ? 'text-green-400'           // active page — green
        : 'text-gray-300 hover:text-white'  // inactive — gray, white on hover
    }`

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg'  // scrolled: solid dark bg
        : 'bg-transparent'                              // top of page: transparent
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Club Name — clicking goes to home */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Green diamond accent — the club's signature color */}
            <div className="w-8 h-8 bg-green-500 rotate-45 group-hover:bg-green-400 transition-colors duration-200" />
            <span className="text-white font-bold text-lg tracking-tight">
              Machakos <span className="text-green-400">United</span>
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile (hidden md:flex) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/fixtures" className={linkClass('/fixtures')}>Fixtures</Link>
            <Link to="/results" className={linkClass('/results')}>Results</Link>
            <Link to="/squad" className={linkClass('/squad')}>Squad</Link>
            <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-green-600 hover:bg-green-500 text-white font-medium px-4 py-2 rounded-full transition-colors duration-200"
            >
              Register
            </Link>
          </div>

          {/* Mobile hamburger button — visible only on small screens (md:hidden) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="Toggle menu"  // accessibility — screen readers read this
          >
            {/* Animated hamburger → X icon using CSS transforms */}
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>

        </div>
      </div>

      {/* Mobile dropdown menu — slides in when isOpen is true */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gray-900/98 backdrop-blur-sm px-4 py-4 flex flex-col gap-4 border-t border-gray-800">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/fixtures" className={linkClass('/fixtures')}>Fixtures</Link>
          <Link to="/results" className={linkClass('/results')}>Results</Link>
          <Link to="/squad" className={linkClass('/squad')}>Squad</Link>
          <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>
          <div className="border-t border-gray-800 pt-4 flex flex-col gap-3">
            <Link to="/login" className="text-sm text-gray-300 font-medium">Sign in</Link>
            <Link to="/register" className="text-sm bg-green-600 text-white font-medium px-4 py-2 rounded-full text-center">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar