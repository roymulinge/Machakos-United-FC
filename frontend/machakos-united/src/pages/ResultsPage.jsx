// src/pages/ResultsPage.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'

// ─── outcome badge ────────────────────────────────────────────────────────────
// Returns different colours depending on Win/Draw/Loss
function OutcomeBadge({ outcome }) {
  const styles = {
    WIN:  'bg-green-500/15 text-green-400 border-green-500/20',
    DRAW: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    LOSS: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  const labels = { WIN: 'Win', DRAW: 'Draw', LOSS: 'Loss' }

  return (
    <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1
                      rounded-full border ${styles[outcome] || styles.DRAW}`}>
      {labels[outcome] || outcome}
    </span>
  )
}

// ─── single result card ───────────────────────────────────────────────────────
function ResultCard({ result }) {
  // result has a nested fixture object from the API
  const { fixture } = result
  const matchDate   = new Date(fixture.match_date)

  const dateStr = matchDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden
                    hover:border-white/20 transition-all duration-300">

      {/* coloured top strip based on outcome */}
      <div className={`h-1 w-full ${
        result.outcome === 'WIN'  ? 'bg-green-500' :
        result.outcome === 'DRAW' ? 'bg-yellow-500' :
        'bg-red-500'
      }`} />

      <div className="p-6">
        {/* header: competition + outcome badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            {fixture.competition_display} · MD{fixture.matchday}
          </span>
          <OutcomeBadge outcome={result.outcome} />
        </div>

        {/* scoreline */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 text-right">
            <p className="text-white font-bold text-lg">{fixture.home_team}</p>
            <p className="text-xs text-gray-600 mt-0.5">Home</p>
          </div>

          {/* score box */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* each score in its own box */}
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl
                            flex items-center justify-center">
              <span className="text-white text-2xl font-black">{result.home_score}</span>
            </div>
            <span className="text-gray-600 font-bold">—</span>
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl
                            flex items-center justify-center">
              <span className="text-white text-2xl font-black">{result.away_score}</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-white font-bold text-lg">{fixture.away_team}</p>
            <p className="text-xs text-gray-600 mt-0.5">Away</p>
          </div>
        </div>

        {/* footer: date + scorers */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <p className="text-xs text-gray-600">{dateStr} · {fixture.venue}</p>

          {/* only show scorers if they exist */}
          {result.scorers && (
            <p className="text-xs text-gray-500">
              <span className="text-gray-600 mr-1">⚽</span>
              {result.scorers}
            </p>
          )}

          {/* only show match report if it exists */}
          {result.match_report && (
            // details/summary = native HTML accordion — no JS needed
            <details className="mt-3 group">
              <summary className="text-xs text-green-400 cursor-pointer hover:text-green-300
                                  transition-colors list-none flex items-center gap-1">
                {/* rotates arrow when open using group-open selector */}
                <span className="transition-transform group-open:rotate-90">▶</span>
                Match Report
              </summary>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {result.match_report}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── stat summary bar ─────────────────────────────────────────────────────────
// Shows W/D/L counts at the top of the page
function StatBar({ results }) {
  const wins   = results.filter(r => r.outcome === 'WIN').length
  const draws  = results.filter(r => r.outcome === 'DRAW').length
  const losses = results.filter(r => r.outcome === 'LOSS').length
  const total  = results.length

  return (
    <div className="grid grid-cols-3 gap-3 mb-10">
      {[
        { label: 'Wins',   count: wins,   color: 'text-green-400',  bar: 'bg-green-500'  },
        { label: 'Draws',  count: draws,  color: 'text-yellow-400', bar: 'bg-yellow-500' },
        { label: 'Losses', count: losses, color: 'text-red-400',    bar: 'bg-red-500'    },
      ].map(({ label, count, color, bar }) => (
        <div key={label}
             className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
          <p className={`text-3xl font-black ${color}`}>{count}</p>
          <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">{label}</p>
          {/* progress bar — width calculated as percentage of total */}
          <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full ${bar} rounded-full transition-all duration-700`}
              // inline style needed because Tailwind can't handle dynamic widths
              style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // results endpoint returns MatchResult objects with nested fixture
        const { data } = await apiClient.get('/api/matches/results/')
        setResults(data)
      } catch (err) {
        setError('Failed to load results.')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f0a] pt-20 pb-16 px-4 relative overflow-hidden">

      {/* decorative background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-500 rounded-full" />
            <h1 className="text-white text-4xl font-black uppercase tracking-tight">
              Results
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-4 tracking-wide">
            Season 2025/26
          </p>
        </div>

        {/* loading state */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/[0.03] border border-white/10
                                      rounded-2xl h-40" />
            ))}
          </div>
        )}

        {/* error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* results */}
        {!loading && !error && (
          <>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No results yet this season.</p>
              </div>
            ) : (
              <>
                {/* stat summary — only show when we have data */}
                <StatBar results={results} />

                <div className="space-y-4">
                  {results.map(result => (
                    <ResultCard key={result.id} result={result} />
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