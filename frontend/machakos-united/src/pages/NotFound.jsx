import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

export default function NotFound() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] flex items-center justify-center px-4 pt-28 pb-16 relative overflow-hidden" style={pageStyle}>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #111111 0px, #111111 1px, transparent 1px, transparent 60px)',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-semibold text-black/[0.035] select-none leading-none pointer-events-none">
          404
        </div>
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-green-700 rotate-45" />
        </div>

        <p className="text-green-700 text-xs uppercase tracking-widest font-semibold mb-4">
          Error 404
        </p>

        <h1 className="text-[#1a1a1a] text-4xl font-semibold uppercase mb-4 leading-tight">
          Page Not Found
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
          You'll be redirected to the home page in{' '}
          <span className="text-green-700 font-semibold">{countdown}</span> seconds.
        </p>

        <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden mb-8 max-w-xs mx-auto">
          <div
            className="h-full bg-green-700 rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-black hover:bg-green-700 text-white font-semibold px-8 py-3 rounded uppercase tracking-widest text-sm transition-all active:scale-95"
          >
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 hover:border-black text-[#1a1a1a] px-8 py-3 rounded uppercase tracking-widest text-sm font-semibold transition-all hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {[
            { label: 'Fixtures', to: '/fixtures' },
            { label: 'Results', to: '/results' },
            { label: 'Squad', to: '/squad' },
            { label: 'Tickets', to: '/tickets' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-gray-500 text-xs hover:text-black uppercase tracking-widest font-semibold transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}