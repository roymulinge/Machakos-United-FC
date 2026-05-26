// src/pages/NotFound.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const navigate          = useNavigate()
  const [countdown, setCountdown] = useState(10)

  // auto-redirect to home after 10 seconds
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
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center
                    px-4 relative overflow-hidden">

      {/* decorative background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        {/* big 404 watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        text-[20rem] font-black text-white/[0.02] select-none
                        leading-none pointer-events-none">
          404
        </div>
      </div>

      <div className="relative z-10 text-center max-w-md">

        {/* club logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-green-500 rotate-45" />
        </div>

        {/* error code */}
        <p className="text-green-400 text-xs uppercase tracking-widest font-bold mb-4">
          Error 404
        </p>

        <h1 className="text-white text-4xl font-black uppercase tracking-tight mb-4">
          Page Not Found
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
          You'll be redirected to the home page in{' '}
          <span className="text-green-400 font-bold">{countdown}</span> seconds.
        </p>

        {/* countdown progress bar */}
        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden mb-8 max-w-xs mx-auto">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-1000"
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        </div>

        {/* navigation options */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3
                       rounded-full uppercase tracking-widest text-sm transition-all
                       active:scale-95"
          >
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="border border-white/20 hover:border-white/40 text-white px-8 py-3
                       rounded-full uppercase tracking-widest text-sm transition-all
                       hover:bg-white/5"
          >
            Go Back
          </button>
        </div>

        {/* helpful links */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {[
            { label: 'Fixtures', to: '/fixtures' },
            { label: 'Results',  to: '/results'  },
            { label: 'Squad',    to: '/squad'     },
            { label: 'Tickets',  to: '/tickets'   },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-gray-600 text-xs hover:text-gray-400 uppercase
                         tracking-widest transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}