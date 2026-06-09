// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import heroVideo from '../assets/Machakos-video.mp4'

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatMatchDate(dateStr) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

// ─── section: Hero ────────────────────────────────────────────────────────────
//
// Full-viewport video background.
// Soft white wash over the whole frame + stronger gradient on the right half.
// Text overlays the right side. No CTA buttons. Staggered fade+slide on mount.
//
function Hero() {
  const videoRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {})
  }, [])

  const stats = [
    { value: '2005', label: 'Founded'    },
    { value: '3×',   label: 'KPL Titles' },
    { value: '2×',   label: 'FKF Cup'   },
  ]

  const anim = (delayMs) => ({
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.75s ease ${delayMs}ms, transform 0.75s ease ${delayMs}ms`,
  })

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100svh' }}
    >
      {/* Full-bleed video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* Uniform white wash over entire video */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      />

      {/* Right-half white gradient — brightens the text zone */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to left, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 45%, transparent 75%)',
        }}
      />

      {/* Bottom fade to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '28%',
          background: 'linear-gradient(to top, #0a0f0a, transparent)',
        }}
      />

      {/* ── DESKTOP text overlay (right side) ───────────────────────── */}
      <div className="hidden md:flex absolute inset-0 items-center justify-end">
        <div
          className="flex flex-col justify-center"
          style={{ width: '46%', paddingRight: '6%', paddingLeft: '2%' }}
        >
          <div className="flex items-center gap-3 mb-7" style={anim(120)}>
            <div style={{ width: 32, height: 1, background: '#050a05' }} />
            <span
              className="uppercase font-semibold tracking-widest text-[#050a05]"
              style={{ fontSize: 11 }}
            >
              Official Club
            </span>
          </div>

          <h1
            className="font-black uppercase leading-none tracking-tight text-[#050a05]"
            style={{
              fontSize: 'clamp(3rem, 4.8vw, 5rem)',
              marginBottom: '0.05em',
              ...anim(220),
            }}
          >
            Machakos
          </h1>

          <h1
            className="font-black uppercase leading-none tracking-tight"
            style={{
              fontSize: 'clamp(3rem, 4.8vw, 5rem)',
              marginBottom: '1.4rem',
              WebkitTextStroke: '2px #14532d',
              color: 'transparent',
              ...anim(320),
            }}
          >
            United FC
          </h1>

          <p
            className="text-[#1a2e1a] leading-relaxed"
            style={{
              fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
              maxWidth: 320,
              ...anim(420),
            }}
          >
            Home of ambition, resilience, and football excellence.
            Representing Machakos with passion and inspiring the next
            generation of champions.
          </p>

          <div
            className="flex gap-8 mt-10 pt-6"
            style={{
              borderTop: '1px solid rgba(5,10,5,0.15)',
              ...anim(520),
            }}
          >
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-[#050a05] font-black text-2xl leading-none mb-1">
                  {value}
                </p>
                <p
                  className="text-[#3a4a3a] uppercase tracking-widest"
                  style={{ fontSize: 10 }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invisible block stretches section to full viewport on desktop */}
      <div className="hidden md:block" style={{ height: '100svh' }} />

      {/* ── MOBILE ──────────────────────────────────────────────────── */}
      <div className="md:hidden relative" style={{ minHeight: '100svh' }}>
        <div
          className="absolute bottom-0 left-0 right-0 px-6 pb-14"
          style={{
            background:
              'linear-gradient(to top, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0.30) 70%, transparent 100%)',
          }}
        >
          <div className="flex items-center gap-3 mb-4" style={anim(120)}>
            <div style={{ width: 24, height: 1, background: '#050a05' }} />
            <span
              className="text-[#050a05] uppercase font-semibold tracking-widest"
              style={{ fontSize: 10 }}
            >
              Official Club
            </span>
          </div>

          <h1
            className="font-black uppercase leading-none tracking-tight text-[#050a05]"
            style={{
              fontSize: 'clamp(2.5rem, 11vw, 3.8rem)',
              marginBottom: '0.05em',
              ...anim(200),
            }}
          >
            Machakos
          </h1>

          <h1
            className="font-black uppercase leading-none tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 11vw, 3.8rem)',
              marginBottom: '1rem',
              WebkitTextStroke: '2px #14532d',
              color: 'transparent',
              ...anim(280),
            }}
          >
            United FC
          </h1>

          <p
            className="text-[#1a2e1a] leading-relaxed text-sm mb-6"
            style={anim(360)}
          >
            Home of ambition, resilience, and football excellence.
          </p>

          <div
            className="flex gap-6 pt-4"
            style={{
              borderTop: '1px solid rgba(5,10,5,0.12)',
              ...anim(440),
            }}
          >
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-[#050a05] font-black text-xl leading-none mb-0.5">
                  {value}
                </p>
                <p
                  className="text-[#3a4a3a] uppercase tracking-widest"
                  style={{ fontSize: 9 }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── section: About ───────────────────────────────────────────────────────────
function AboutSection() {
  const stats = [
    { value: '2005', label: 'Founded'         },
    { value: '3×',   label: 'KPL Titles'      },
    { value: '2×',   label: 'FKF Cup'         },
    { value: '50+',  label: 'Academy Players' },
  ]

  return (
    <section className="py-24 px-4 bg-[#0a0f0a] relative">
      <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-green-900/40" />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-green-500" />
          <span className="text-green-400 text-xs uppercase tracking-widest font-medium">
            Who We Are
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-6">
              More Than<br />
              <span className="text-green-400">A Football Club</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Founded in 2005, Machakos United FC is the heartbeat of Machakos County.
              We've nurtured local talent, produced stars who represent Kenya on
              the international stage, and brought silverware home three times over.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Our academy is the engine — identifying talent from the grassroots and
              developing players who compete at the highest level. Every match,
              every training session, every fan in the stands is part of this family.
            </p>
            <Link
              to="/squad"
              className="inline-flex items-center gap-2 text-green-400 font-bold uppercase tracking-widest text-sm hover:text-green-300 transition-colors group"
            >
              Meet the Squad
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-colors duration-300"
              >
                <p className="text-5xl font-black text-white mb-1">{value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
                <div className="mt-4 w-8 h-0.5 bg-green-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── section: Latest Result ───────────────────────────────────────────────────
function LatestResultSection() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/results/')
        if (data.length > 0) setResult(data[0])
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [])

  if (loading || !result) return null

  const { fixture } = result

  const outcomeColor = {
    WIN:  'text-green-400',
    DRAW: 'text-yellow-400',
    LOSS: 'text-red-400',
  }[result.outcome] || 'text-gray-400'

  const outcomeBg = {
    WIN:  'bg-green-500',
    DRAW: 'bg-yellow-500',
    LOSS: 'bg-red-500',
  }[result.outcome] || 'bg-gray-500'

  return (
    <section className="py-24 px-4 bg-[#0d140d] relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-green-950/20 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-green-500" />
          <span className="text-green-400 text-xs uppercase tracking-widest font-medium">
            Latest Result
          </span>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className={`h-1 ${outcomeBg}`} />
          <div className="p-8 md:p-12">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">
              {fixture.competition_display} · Matchday {fixture.matchday} · {fixture.venue}
            </p>
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex-1 text-right">
                <p className="text-white font-black text-2xl md:text-4xl uppercase tracking-tight">
                  {fixture.home_team}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-4xl md:text-5xl font-black">{result.home_score}</span>
                </div>
                <span className="text-gray-600 text-2xl font-bold">—</span>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-4xl md:text-5xl font-black">{result.away_score}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-2xl md:text-4xl uppercase tracking-tight">
                  {fixture.away_team}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
              <div>
                {result.scorers && (
                  <p className="text-gray-500 text-sm">
                    <span className="mr-2">⚽</span>{result.scorers}
                  </p>
                )}
              </div>
              <span className={`text-sm font-black uppercase tracking-widest ${outcomeColor}`}>
                {result.outcome}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link to="/results" className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">
            All Results →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── section: Next Fixture ────────────────────────────────────────────────────
function NextFixtureSection() {
  const [fixture, setFixture] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFixture = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/fixtures/')
        if (data.length > 0) setFixture(data[0])
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    fetchFixture()
  }, [])

  if (loading || !fixture) return null

  const { date, time } = formatMatchDate(fixture.match_date)

  return (
    <section className="py-24 px-4 bg-[#0a0f0a]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-green-500" />
          <span className="text-green-400 text-xs uppercase tracking-widest font-medium">
            Next Match
          </span>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-56 bg-green-600/20 border-r border-green-500/20 flex flex-col items-center justify-center p-8 gap-2">
            <p className="text-green-400 text-xs uppercase tracking-widest font-medium">Kick Off</p>
            <p className="text-white text-2xl font-black">{date}</p>
            <p className="text-green-300 text-lg font-bold">{time} EAT</p>
            <div className="mt-2 w-8 h-px bg-green-500/40" />
            <p className="text-green-400/70 text-xs text-center uppercase tracking-wide">{fixture.venue}</p>
          </div>
          <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-center flex-1">
                <p className="text-white font-black text-xl uppercase tracking-tight">{fixture.home_team}</p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">Home</p>
              </div>
              <span className="text-2xl font-black text-gray-700">VS</span>
              <div className="text-center flex-1">
                <p className="text-white font-black text-xl uppercase tracking-tight">{fixture.away_team}</p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">Away</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <Link
                to={`/tickets?fixture=${fixture.id}`}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-full uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                Get Tickets
              </Link>
              {!fixture.is_sold_out && (
                <p className="text-xs text-gray-600">
                  KES {Number(fixture.ticket_price).toLocaleString()} per ticket
                </p>
              )}
              {fixture.is_sold_out && (
                <p className="text-xs text-red-400 uppercase tracking-wide">Sold Out</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link to="/fixtures" className="text-xs text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">
            Full Schedule →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── section: Footer ──────────────────────────────────────────────────────────
function Footer() {
  const links = [
    { label: 'Fixtures', to: '/fixtures' },
    { label: 'Results',  to: '/results'  },
    { label: 'Squad',    to: '/squad'    },
    { label: 'Tickets',  to: '/tickets'  },
  ]

  return (
    <footer className="bg-[#060c06] border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rotate-45" />
            <span className="text-white font-black uppercase tracking-tight">
              Machakos <span className="text-green-400">United</span>
            </span>
          </div>
          <nav className="flex gap-6">
            {links.map(({ label, to }) => (
              <Link key={label} to={to} className="text-gray-600 text-sm hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4">
            {['Twitter', 'Facebook', 'Instagram'].map(platform => (
              <a
                key={platform}
                href={`https://${platform.toLowerCase()}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 text-sm hover:text-white transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-700 text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} Machakos United FC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Root page component ──────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="bg-[#0a0f0a]">
      <Hero />
      <AboutSection />
      <LatestResultSection />
      <NextFixtureSection />
      <Footer />
    </div>
  )
}