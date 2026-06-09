// src/pages/SquadPage.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

const POSITION_GROUPS = [
  { key: 'GK', label: 'Goalkeepers', accent: 'text-yellow-700', bar: 'bg-yellow-500' },
  { key: 'DEF', label: 'Defenders', accent: 'text-blue-700', bar: 'bg-blue-600' },
  { key: 'MID', label: 'Midfielders', accent: 'text-green-700', bar: 'bg-green-700' },
  { key: 'FWD', label: 'Forwards', accent: 'text-red-600', bar: 'bg-red-600' },
]

function StatPill({ label, value, accent = 'text-[#1a1a1a]' }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xl font-semibold ${accent}`}>{value}</span>
      <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
  )
}

function PlayerAvatar({ player, className = '' }) {
  const [imgError, setImgError] = useState(false)

  const initials = player.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const bgColor = {
    GK: 'bg-yellow-50 border-yellow-200',
    DEF: 'bg-blue-50 border-blue-200',
    MID: 'bg-green-50 border-green-200',
    FWD: 'bg-red-50 border-red-200',
  }[player.position] || 'bg-gray-50 border-gray-200'

  const textColor = {
    GK: 'text-yellow-700',
    DEF: 'text-blue-700',
    MID: 'text-green-700',
    FWD: 'text-red-600',
  }[player.position] || 'text-[#1a1a1a]'

  if (player.photo && !imgError) {
    return (
      <img
        src={player.photo}
        alt={player.name}
        onError={() => setImgError(true)}
        className={`object-cover object-top ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center justify-center border ${bgColor} ${className}`}>
      <span className={`font-semibold text-2xl ${textColor}`}>{initials}</span>
    </div>
  )
}

function PlayerCard({ player, onClick }) {
  const accent = {
    GK: 'text-yellow-700',
    DEF: 'text-blue-700',
    MID: 'text-green-700',
    FWD: 'text-red-600',
  }[player.position] || 'text-[#1a1a1a]'

  const topBar = {
    GK: 'bg-yellow-500',
    DEF: 'bg-blue-600',
    MID: 'bg-green-700',
    FWD: 'bg-red-600',
  }[player.position] || 'bg-gray-300'

  return (
    <div
      onClick={onClick}
      className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`h-0.5 w-full ${topBar}`} />

      <div className="relative bg-gray-50 h-48 overflow-hidden">
        <PlayerAvatar player={player} className="w-full h-full rounded-none" />

        <div className="absolute top-3 left-3">
          <span className={`text-3xl font-semibold ${accent} opacity-90`}>
            #{player.squad_number}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`text-xs uppercase tracking-widest font-semibold ${accent} bg-white/90 border border-gray-200 px-2 py-0.5 rounded`}>
            {player.position}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="text-[#1a1a1a] font-semibold text-lg leading-tight mb-0.5 truncate group-hover:text-green-700 transition-colors">
          {player.name}
        </h3>

        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
          {player.nationality}
          {player.age && <span className="ml-2 text-gray-400">- {player.age} yrs</span>}
        </p>

        <div className="flex justify-between pt-3 border-t border-gray-200">
          <StatPill label="Apps" value={player.appearances} accent={accent} />
          <StatPill label="Goals" value={player.goals} accent={accent} />
          <StatPill label="Assists" value={player.assists} accent={accent} />
          {player.position === 'GK' ? (
            <StatPill label="Clean" value={player.clean_sheets} accent={accent} />
          ) : (
            <StatPill label="Caps" value={player.appearances} accent={accent} />
          )}
        </div>
      </div>
    </div>
  )
}

function PlayerModal({ player, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const accent = {
    GK: 'text-yellow-700',
    DEF: 'text-blue-700',
    MID: 'text-green-700',
    FWD: 'text-red-600',
  }[player.position] || 'text-[#1a1a1a]'

  const barColor = {
    GK: 'bg-yellow-500',
    DEF: 'bg-blue-600',
    MID: 'bg-green-700',
    FWD: 'bg-red-600',
  }[player.position] || 'bg-gray-300'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-gray-200 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className={`h-1 w-full rounded-t-lg ${barColor}`} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors text-xl font-semibold z-10"
          aria-label="Close"
        >
          x
        </button>

        <div className="relative bg-gray-50 h-56 overflow-hidden">
          <PlayerAvatar player={player} className="w-full h-full rounded-none" />

          <div className="absolute bottom-0 right-0">
            <span className={`text-8xl font-semibold ${accent} opacity-10 leading-none`}>
              {player.squad_number}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-sm font-semibold uppercase tracking-widest ${accent}`}>
                #{player.squad_number} - {player.position_display}
              </span>
            </div>

            <h2 className="text-[#1a1a1a] text-3xl font-semibold uppercase tracking-tight">
              {player.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Nationality', value: player.nationality },
              { label: 'Age', value: player.age ? `${player.age} years` : '-' },
              { label: 'Position', value: player.position_display },
              { label: 'Squad No.', value: `#${player.squad_number}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-[#1a1a1a] font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-around mb-6">
            <StatPill label="Apps" value={player.appearances} accent={accent} />
            <StatPill label="Goals" value={player.goals} accent={accent} />
            <StatPill label="Assists" value={player.assists} accent={accent} />
            <StatPill label="Clean Sheets" value={player.clean_sheets} accent={accent} />
          </div>

          {player.bio && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-px ${barColor}`} />
                <p className="text-xs text-gray-500 uppercase tracking-widest">Profile</p>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{player.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PositionSection({ group, players, onSelectPlayer }) {
  if (players.length === 0) return null

  return (
    <div className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-1 h-7 ${group.bar} rounded-full`} />
        <h2 className={`text-2xl font-semibold uppercase tracking-tight ${group.accent}`}>
          {group.label}
        </h2>
        <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
          {players.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onClick={() => onSelectPlayer(player)}
          />
        ))}
      </div>
    </div>
  )
}

function SquadSkeleton() {
  return (
    <div className="space-y-14">
      {POSITION_GROUPS.map(group => (
        <div key={group.key}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-gray-200 rounded-full" />
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex justify-between pt-2">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-8 w-8 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SquadPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        const { data } = await apiClient.get('/api/squad/')
        setPlayers(data)
      } catch {
        setError('Failed to load squad. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchSquad()
  }, [])

  const grouped = players.reduce((acc, player) => {
    if (!acc[player.position]) acc[player.position] = []
    acc[player.position].push(player)
    return acc
  }, {})

  return (
    <div
      className="min-h-screen bg-white text-[#1a1a1a] pt-28 pb-16 px-4 relative overflow-hidden"
      style={pageStyle}
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-700 rounded-full" />
            <h1 className="text-[#1a1a1a] text-4xl font-semibold uppercase tracking-tight">
              The Squad
            </h1>
          </div>
          <p className="text-gray-600 text-sm ml-4 tracking-wide">
            {!loading && `${players.length} players - Season 2025/26`}
          </p>
        </div>

        {!loading && !error && (
          <div className="flex flex-wrap gap-4 mb-10">
            {POSITION_GROUPS.map(group => (
              <div key={group.key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${group.bar}`} />
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  {group.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && <SquadSkeleton />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-red-600 border border-red-200 px-4 py-2 rounded hover:border-red-400 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {players.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">Squad not yet announced.</p>
              </div>
            ) : (
              POSITION_GROUPS.map(group => (
                <PositionSection
                  key={group.key}
                  group={group}
                  players={grouped[group.key] || []}
                  onSelectPlayer={setSelectedPlayer}
                />
              ))
            )}
          </>
        )}
      </div>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}