import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="flex items-center justify-between gap-4 my-6">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-40" />
    </div>
  )
}

function FixtureCard({ fixture }) {
  const matchDate = new Date(fixture.match_date)

  const dateStr = matchDate.toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const timeStr = matchDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isMachakosHome = fixture.home_team.toLowerCase().includes('machakos')

  return (
    <div className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-green-700/40 rounded-lg p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs uppercase tracking-widest text-green-700 font-semibold bg-green-50 px-3 py-1 rounded">
          {fixture.competition_display}
        </span>
        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          MD{fixture.matchday}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex-1 text-right">
          <p className={`font-semibold text-lg leading-tight ${isMachakosHome ? 'text-[#1a1a1a]' : 'text-gray-600'}`}>
            {fixture.home_team}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Home</p>
        </div>

        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-2xl font-semibold text-gray-500">VS</span>
          <div className={`w-1.5 h-1.5 rounded-full ${isMachakosHome ? 'bg-green-700' : 'bg-gray-400'}`} />
        </div>

        <div className="flex-1">
          <p className={`font-semibold text-lg leading-tight ${!isMachakosHome ? 'text-[#1a1a1a]' : 'text-gray-600'}`}>
            {fixture.away_team}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Away</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">{fixture.venue}</p>
          <p className="text-xs text-gray-700 mt-0.5 font-semibold">{dateStr} - {timeStr}</p>
        </div>

        {fixture.is_sold_out ? (
          <span className="text-xs uppercase tracking-widest text-red-600 border border-red-200 px-4 py-2 rounded font-semibold">
            Sold Out
          </span>
        ) : (
          <Link
            to={`/tickets?fixture=${fixture.id}`}
            className="text-xs uppercase tracking-widest text-white font-semibold bg-black hover:bg-green-700 px-4 py-2 rounded transition-colors duration-200"
          >
            KES {Number(fixture.ticket_price).toLocaleString()}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/fixtures/all/')
        setFixtures(data)
      } catch {
        setError('Failed to load fixtures. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchFixtures()
  }, [])

  const upcoming = fixtures.filter(f => !f.result)
  const played = fixtures.filter(f => f.result)

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pt-28 pb-16 px-4 relative overflow-hidden" style={pageStyle}>
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-700 rounded-full" />
            <h1 className="text-[#1a1a1a] text-4xl font-semibold uppercase">
              Fixtures
            </h1>
          </div>
          <p className="text-gray-600 text-sm ml-4 tracking-wide">
            {upcoming.length} upcoming match{upcoming.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-red-600 border border-red-200 px-4 py-2 rounded hover:border-red-400 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {upcoming.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No upcoming fixtures scheduled.</p>
                <p className="text-gray-500 text-sm mt-2">Check back soon.</p>
              </div>
            ) : (
              <div className="space-y-4 mb-12">
                {upcoming.map(fixture => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}

            {played.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gray-400 rounded-full" />
                  <h2 className="text-gray-700 text-xl font-semibold uppercase tracking-wide">
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