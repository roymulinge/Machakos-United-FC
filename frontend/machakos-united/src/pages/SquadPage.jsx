// src/pages/SquadPage.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'

// ─── Position group config ────────────────────────────────────────────────────
// Defines the display order, labels, and accent colours per position
const POSITION_GROUPS = [
  { key: 'GK',  label: 'Goalkeepers',  accent: 'text-yellow-400', bar: 'bg-yellow-500'  },
  { key: 'DEF', label: 'Defenders',    accent: 'text-blue-400',   bar: 'bg-blue-500'    },
  { key: 'MID', label: 'Midfielders',  accent: 'text-green-400',  bar: 'bg-green-500'   },
  { key: 'FWD', label: 'Forwards',     accent: 'text-red-400',    bar: 'bg-red-500'     },
]

// ─── Stat pill ────────────────────────────────────────────────────────────────
// Small label+value display used inside cards and the modal
function StatPill({ label, value, accent = 'text-white' }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xl font-black ${accent}`}>{value}</span>
      <span className="text-xs text-gray-600 uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
// Shows player photo if available, falls back to initials
function PlayerAvatar({ player, className = '' }) {
  const [imgError, setImgError] = useState(false)

  // Generate initials from player name e.g. "John Doe" → "JD"
  const initials = player.name
    .split(' ')                    // split on spaces
    .map(n => n[0])               // take first letter of each word
    .join('')                     // join back
    .toUpperCase()
    .slice(0, 2)                  // max 2 characters

  // Position colour for the avatar background
  const bgColor = {
    GK:  'bg-yellow-500/20 border-yellow-500/30',
    DEF: 'bg-blue-500/20   border-blue-500/30',
    MID: 'bg-green-500/20  border-green-500/30',
    FWD: 'bg-red-500/20    border-red-500/30',
  }[player.position] || 'bg-white/10 border-white/20'

  const textColor = {
    GK:  'text-yellow-400',
    DEF: 'text-blue-400',
    MID: 'text-green-400',
    FWD: 'text-red-400',
  }[player.position] || 'text-white'

  // Show photo if it exists and hasn't errored
  if (player.photo && !imgError) {
    return (
      <img
        src={player.photo}
        alt={player.name}
        // onError fires if the image URL is broken — falls back to initials
        onError={() => setImgError(true)}
        className={`object-cover object-top ${className}`}
      />
    )
  }

  // Fallback: initials avatar
  return (
    <div className={`flex items-center justify-center border ${bgColor} ${className}`}>
      <span className={`font-black text-2xl ${textColor}`}>{initials}</span>
    </div>
  )
}

// ─── Player card ──────────────────────────────────────────────────────────────
function PlayerCard({ player, onClick }) {
  // accent colour based on position
  const accent = {
    GK:  'text-yellow-400',
    DEF: 'text-blue-400',
    MID: 'text-green-400',
    FWD: 'text-red-400',
  }[player.position] || 'text-white'

  const topBar = {
    GK:  'bg-yellow-500',
    DEF: 'bg-blue-500',
    MID: 'bg-green-500',
    FWD: 'bg-red-500',
  }[player.position] || 'bg-white'

  return (
    // cursor-pointer + onClick makes the card clickable to open the modal
    <div
      onClick={onClick}
      className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/10
                 hover:border-white/20 rounded-2xl overflow-hidden cursor-pointer
                 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                 hover:shadow-black/40"
    >
      {/* coloured top strip — position colour */}
      <div className={`h-0.5 w-full ${topBar}`} />

      {/* photo area */}
      <div className="relative bg-white/[0.02] h-48 overflow-hidden">
        <PlayerAvatar
          player={player}
          className="w-full h-full rounded-none"
        />
        {/* squad number — top left overlay */}
        <div className="absolute top-3 left-3">
          <span className={`text-3xl font-black ${accent} opacity-80`}>
            #{player.squad_number}
          </span>
        </div>
        {/* position badge — top right overlay */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs uppercase tracking-widest font-bold ${accent}
                           bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full`}>
            {player.position}
          </span>
        </div>
        {/* bottom gradient for text legibility */}
        <div className="absolute bottom-0 left-0 right-0 h-16
                        bg-gradient-to-t from-[#0a0f0a] to-transparent" />
      </div>

      {/* card body */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg leading-tight mb-0.5 truncate
                       group-hover:text-green-100 transition-colors">
          {player.name}
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
          {player.nationality}
          {player.age && <span className="ml-2 text-gray-600">· {player.age} yrs</span>}
        </p>

        {/* mini stats row */}
        <div className="flex justify-between pt-3 border-t border-white/5">
          <StatPill label="Apps"    value={player.appearances} accent={accent} />
          <StatPill label="Goals"   value={player.goals}       accent={accent} />
          <StatPill label="Assists" value={player.assists}     accent={accent} />
          {/* show clean sheets for GK, assists for others */}
          {player.position === 'GK'
            ? <StatPill label="Clean"   value={player.clean_sheets} accent={accent} />
            : <StatPill label="Caps"    value={player.appearances}  accent={accent} />
          }
        </div>
      </div>
    </div>
  )
}

// ─── Player modal ─────────────────────────────────────────────────────────────
// Full-screen overlay showing all player details
function PlayerModal({ player, onClose }) {
  // Close modal when user presses Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    // addEventListener adds the handler to the document
    document.addEventListener('keydown', handleKey)
    // cleanup: remove handler when modal unmounts — prevents memory leaks
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const accent = {
    GK:  'text-yellow-400',
    DEF: 'text-blue-400',
    MID: 'text-green-400',
    FWD: 'text-red-400',
  }[player.position] || 'text-white'

  const barColor = {
    GK:  'bg-yellow-500',
    DEF: 'bg-blue-500',
    MID: 'bg-green-500',
    FWD: 'bg-red-500',
  }[player.position] || 'bg-white'

  return (
    // backdrop — clicking outside the card closes the modal
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* modal card — stopPropagation prevents clicks inside from closing it */}
      <div
        className="relative bg-[#0f1a0f] border border-white/10 rounded-2xl
                   w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* coloured top strip */}
        <div className={`h-1 w-full rounded-t-2xl ${barColor}`} />

        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white
                     transition-colors text-xl font-bold z-10"
          aria-label="Close"
        >
          ✕
        </button>

        {/* photo + name header */}
        <div className="relative bg-white/[0.02] h-56 overflow-hidden">
          <PlayerAvatar
            player={player}
            className="w-full h-full rounded-none"
          />
          {/* squad number watermark */}
          <div className="absolute bottom-0 right-0">
            <span className={`text-8xl font-black ${accent} opacity-10 leading-none`}>
              {player.squad_number}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24
                          bg-gradient-to-t from-[#0f1a0f] to-transparent" />
        </div>

        {/* details section */}
        <div className="p-6">
          {/* name + position */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-sm font-bold uppercase tracking-widest ${accent}`}>
                #{player.squad_number} · {player.position_display}
              </span>
            </div>
            <h2 className="text-white text-3xl font-black uppercase tracking-tight">
              {player.name}
            </h2>
          </div>

          {/* info grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Nationality', value: player.nationality },
              { label: 'Age',         value: player.age ? `${player.age} years` : '—' },
              { label: 'Position',    value: player.position_display },
              { label: 'Squad No.',   value: `#${player.squad_number}` },
            ].map(({ label, value }) => (
              <div key={label}
                   className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* stats row */}
          <div className={`bg-white/[0.03] border border-white/5 rounded-xl p-4
                           flex justify-around mb-6`}>
            <StatPill label="Apps"    value={player.appearances}  accent={accent} />
            <StatPill label="Goals"   value={player.goals}        accent={accent} />
            <StatPill label="Assists" value={player.assists}      accent={accent} />
            <StatPill label="Clean Sheets" value={player.clean_sheets} accent={accent} />
          </div>

          {/* bio — only renders if it exists */}
          {player.bio && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-px ${barColor}`} />
                <p className="text-xs text-gray-600 uppercase tracking-widest">Profile</p>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{player.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Position section ─────────────────────────────────────────────────────────
// Renders one group of players (e.g. all Defenders)
function PositionSection({ group, players, onSelectPlayer }) {
  // Don't render the section at all if no players in this position
  if (players.length === 0) return null

  return (
    <div className="mb-14">
      {/* section heading */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-1 h-7 ${group.bar} rounded-full`} />
        <h2 className={`text-2xl font-black uppercase tracking-tight ${group.accent}`}>
          {group.label}
        </h2>
        {/* player count badge */}
        <span className="text-xs text-gray-600 bg-white/5 border border-white/10
                         px-2 py-0.5 rounded-full">
          {players.length}
        </span>
      </div>

      {/* responsive grid:
          1 column on mobile,
          2 columns on sm (640px+),
          3 on md (768px+),
          4 on lg (1024px+) */}
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function SquadSkeleton() {
  return (
    <div className="space-y-14">
      {POSITION_GROUPS.map(group => (
        <div key={group.key}>
          {/* section heading skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-white/10 rounded-full" />
            <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
          </div>
          {/* card skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}
                   className="animate-pulse bg-white/[0.03] border border-white/10
                              rounded-2xl overflow-hidden">
                <div className="h-48 bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="flex justify-between pt-2">
                    {[1,2,3,4].map(j => (
                      <div key={j} className="h-8 w-8 bg-white/5 rounded" />
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SquadPage() {
  const [players, setPlayers]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  // selectedPlayer holds the player whose modal is open — null means closed
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        const { data } = await apiClient.get('/api/squad/')
        setPlayers(data)
      } catch (err) {
        setError('Failed to load squad. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchSquad()
  }, [])

  // Group players by position key — returns { GK: [...], DEF: [...], ... }
  // reduce() builds an object by iterating over the array
  const grouped = players.reduce((acc, player) => {
    // if this position key doesn't exist yet, create an empty array
    if (!acc[player.position]) acc[player.position] = []
    // push this player into the correct group
    acc[player.position].push(player)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0a0f0a] pt-20 pb-16 px-4 relative overflow-hidden">

      {/* decorative background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        rounded-full bg-green-600/5 blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* page header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-500 rounded-full" />
            <h1 className="text-white text-4xl font-black uppercase tracking-tight">
              The Squad
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-4 tracking-wide">
            {!loading && `${players.length} players · Season 2025/26`}
          </p>
        </div>

        {/* position colour legend */}
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

        {/* loading */}
        {loading && <SquadSkeleton />}

        {/* error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-red-400 border border-red-500/20 px-4 py-2
                         rounded-full hover:border-red-500/40 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* squad grouped by position */}
        {!loading && !error && (
          <>
            {players.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">Squad not yet announced.</p>
              </div>
            ) : (
              // render each position group in the defined order
              POSITION_GROUPS.map(group => (
                <PositionSection
                  key={group.key}
                  group={group}
                  // pass only players that match this position
                  players={grouped[group.key] || []}
                  onSelectPlayer={setSelectedPlayer}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* render modal only when a player is selected */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}