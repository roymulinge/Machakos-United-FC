import { useState, useEffect } from 'react'
import apiClient from '../api/client'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

function OutcomeBadge({ outcome }) {
  const styles = {
    WIN: 'bg-green-50 text-green-700 border-green-200',
    DRAW: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOSS: 'bg-red-50 text-red-600 border-red-200',
  }

  const labels = { WIN: 'Win', DRAW: 'Draw', LOSS: 'Loss' }

  return (
    <span className={`text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded border ${styles[outcome] || styles.DRAW}`}>
      {labels[outcome] || outcome}
    </span>
  )
}

function ResultCard({ result }) {
  const { fixture } = result
  const matchDate = new Date(fixture.match_date)

  const dateStr = matchDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const topBar =
    result.outcome === 'WIN'
      ? 'bg-green-700'
      : result.outcome === 'DRAW'
        ? 'bg-yellow-500'
        : 'bg-red-600'

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-300 shadow-sm">
      <div className={`h-1 w-full ${topBar}`} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
            {fixture.competition_display} - MD{fixture.matchday}
          </span>
          <OutcomeBadge outcome={result.outcome} />
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 text-right">
            <p className="text-[#1a1a1a] font-semibold text-lg">{fixture.home_team}</p>
            <p className="text-xs text-gray-500 mt-0.5">Home</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <span className="text-[#1a1a1a] text-2xl font-semibold">{result.home_score}</span>
            </div>
            <span className="text-gray-400 font-semibold">-</span>
            <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <span className="text-[#1a1a1a] text-2xl font-semibold">{result.away_score}</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[#1a1a1a] font-semibold text-lg">{fixture.away_team}</p>
            <p className="text-xs text-gray-500 mt-0.5">Away</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-500">{dateStr} - {fixture.venue}</p>

          {result.scorers && (
            <p className="text-xs text-gray-600">
              <span className="text-gray-500 mr-1">Goal:</span>
              {result.scorers}
            </p>
          )}

          {result.match_report && (
            <details className="mt-3 group">
              <summary className="text-xs text-green-700 cursor-pointer hover:text-black transition-colors list-none flex items-center gap-1 font-semibold">
                <span className="transition-transform group-open:rotate-90">›</span>
                Match Report
              </summary>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {result.match_report}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBar({ results }) {
  const wins = results.filter(r => r.outcome === 'WIN').length
  const draws = results.filter(r => r.outcome === 'DRAW').length
  const losses = results.filter(r => r.outcome === 'LOSS').length
  const total = results.length

  return (
    <div className="grid grid-cols-3 gap-3 mb-10">
      {[
        { label: 'Wins', count: wins, color: 'text-green-700', bar: 'bg-green-700' },
        { label: 'Draws', count: draws, color: 'text-yellow-700', bar: 'bg-yellow-500' },
        { label: 'Losses', count: losses, color: 'text-red-600', bar: 'bg-red-600' },
      ].map(({ label, count, color, bar }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
          <p className={`text-3xl font-semibold ${color}`}>{count}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{label}</p>
          <div className="mt-3 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${bar} rounded-full transition-all duration-700`}
              style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ResultsPage() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/results/')
        setResults(data)
      } catch {
        setError('Failed to load results.')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  return (
    <div
      className="min-h-screen bg-white text-[#1a1a1a] pt-28 pb-16 px-4 relative overflow-hidden"
      style={pageStyle}
    >
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-700 rounded-full" />
            <h1 className="text-[#1a1a1a] text-4xl font-semibold uppercase">
              Results
            </h1>
          </div>
          <p className="text-gray-600 text-sm ml-4 tracking-wide">
            Season 2025/26
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 border border-gray-200 rounded-lg h-40" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No results yet this season.</p>
              </div>
            ) : (
              <>
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