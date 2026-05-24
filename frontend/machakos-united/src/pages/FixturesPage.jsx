// src/pages/FixturesPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

// ─── Loading skeleton ────────────────────────────────────────────────────────
// Shown while fixtures are fetching — better UX than a blank screen
function SkeletonCard() {
  return (
    // animate-pulse makes the whole card gently fade in and out
    <div className="animate-pulse bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-white/10 rounded w-24" />
        <div className="h-4 bg-white/10 rounded w-16" />
      </div>
      <div className="flex items-center justify-between gap-4 my-6">
        <div className="h-6 bg-white/10 rounded w-32" />
        <div className="h-8 bg-white/10 rounded w-16" />
        <div className="h-6 bg-white/10 rounded w-32" />
      </div>
      <div className="h-4 bg-white/10 rounded w-40" />
    </div>
  )
}

// ─── Single fixture card ──────────────────────────────────────────────────────
function FixtureCard({ fixture }) {
  // Parse the ISO date string Django returns into a JS Date object
  const matchDate = new Date(fixture.match_date)

  // toLocaleDateString formats date for the user's locale
  const dateStr = matchDate.toLocaleDateString('en-KE', {
    weekday: 'short',   // "Sat"
    day:     'numeric', // "28"
    month:   'short',   // "May"
  })

  // toLocaleTimeString formats the time
  const timeStr = matchDate.toLocaleTimeString('en-KE', {
    hour:   '2-digit',
    minute: '2-digit',
  })

  // isMachakosHome — true if Machakos United is the home team
  const isMachakosHome = fixture.home_team.toLowerCase().includes('machakos')

  return (
    <div className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10
                    hover:border-green-500/30 rounded-2xl p-6 transition-all duration-300">

      {/* top row: competition badge + date */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs uppercase tracking-widest text-green-400 font-medium
                         bg-green-500/10 px-3 py-1 rounded-full">
          {fixture.competition_display}
        </span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          MD{fixture.matchday}
        </span>
      </div>

      {/* match teams row */}
      <div className="flex items-center justify-between gap-4 mb-5">

        {/* home team */}
        <div className="flex-1 text-right">
          <p className={`font-bold text-lg leading-tight ${
            isMachakosHome ? 'text-white' : 'text-gray-300'
          }`}>
            {fixture.home_team}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Home</p>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-2xl font-black text-gray-600">VS</span>
          {/* green dot = Machakos are home, gray = away */}
          <div className={`w-1.5 h-1.5 rounded-full ${
            isMachakosHome ? 'bg-green-500' : 'bg-gray-600'
          }`} />
        </div>

        {/* away team */}
        <div className="flex-1">
          <p className={`font-bold text-lg leading-tight ${
            !isMachakosHome ? 'text-white' : 'text-gray-300'
          }`}>
            {fixture.away_team}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">Away</p>
        </div>
      </div>

      {/* bottom row: venue + time + ticket button */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-gray-500">{fixture.venue}</p>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{dateStr} · {timeStr}</p>
        </div>

        {fixture.is_sold_out ? (
          // sold out state — not clickable
          <span className="text-xs uppercase tracking-widest text-red-400
                           border border-red-500/20 px-4 py-2 rounded-full">
            Sold Out
          </span>
        ) : (
          // Link to tickets page — passes fixture id as URL state
          <Link
            to={`/tickets?fixture=${fixture.id}`}
            className="text-xs uppercase tracking-widest text-white font-bold
                       bg-green-600 hover:bg-green-500 px-4 py-2 rounded-full
                       transition-colors duration-200"
          >
            KES {Number(fixture.ticket_price).toLocaleString()}
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    // immediately-invoked async function inside useEffect
    // useEffect itself can't be async — so we define and call one inside it
    const fetchFixtures = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/fixtures/all/')
        setFixtures(data)
      } catch (err) {
        setError('Failed to load fixtures. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchFixtures()
  }, [])  // empty array = run once when component mounts

  // split fixtures into upcoming vs played (has a result)
  const upcoming = fixtures.filter(f => !f.result)
  const played   = fixtures.filter(f =>  f.result)

  return (
    <div className="min-h-screen bg-[#0a0f0a] pt-20 pb-16 px-4 relative overflow-hidden">

      {/* decorative background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px]
                        rounded-full bg-green-600/5 blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-500 rounded-full" />
            <h1 className="text-white text-4xl font-black uppercase tracking-tight">
              Fixtures
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-4 tracking-wide">
            {upcoming.length} upcoming match{upcoming.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-red-400 border border-red-500/20 px-4 py-2 rounded-full hover:border-red-500/40 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {/* Array.from creates 3 skeleton cards while data loads */}
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* upcoming fixtures section */}
        {!loading && !error && (
          <>
            {upcoming.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No upcoming fixtures scheduled.</p>
                <p className="text-gray-700 text-sm mt-2">Check back soon.</p>
              </div>
            ) : (
              <div className="space-y-4 mb-12">
                {upcoming.map(fixture => (
                  // key prop is required when rendering lists — helps React track changes
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}

            {/* played matches section */}
            {played.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gray-600 rounded-full" />
                  <h2 className="text-gray-400 text-xl font-bold uppercase tracking-wide">
                    Played
                  </h2>
                </div>
                <div className="space-y-4">
                  {played.map(fixture => (
                    <FixtureCard key={fixture.id} fixture={fixture} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}