// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import heroVideo from '../assets/Machakos-video.mp4'

const pageFont = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

function formatMatchDate(dateStr) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

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
    { value: '2005', label: 'Founded' },
    { value: '3x', label: 'KPL Titles' },
    { value: '2x', label: 'FKF Cup' },
  ]

  const anim = (delayMs) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.75s ease ${delayMs}ms, transform 0.75s ease ${delayMs}ms`,
  })

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100svh', paddingTop: 110 }}>
      <video ref={videoRef} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.58)' }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.68) 36%, rgba(0,0,0,0.34) 68%, rgba(0,0,0,0.18) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '24%', background: 'linear-gradient(to top, #ffffff, transparent)' }}
      />

      <div className="hidden md:flex absolute inset-0 items-center justify-start pt-28">
        <div className="flex flex-col justify-center" style={{ width: '52%', paddingLeft: '7%', paddingRight: '4%' }}>
          <div className="flex items-center gap-3 mb-7" style={anim(120)}>
            <div style={{ width: 36, height: 2, background: '#ffffff' }} />
            <span className="uppercase font-semibold tracking-widest text-white" style={{ fontSize: 12 }}>
              Official Club
            </span>
          </div>

          <h1
            className="font-semibold uppercase leading-none text-white"
            style={{
              fontSize: 'clamp(3.4rem, 5.8vw, 6.4rem)',
              marginBottom: '0.02em',
              letterSpacing: 0,
              textShadow: '0 4px 24px rgba(0,0,0,0.85)',
              ...anim(220),
            }}
          >
            Machakos
          </h1>

          <h1
            className="font-semibold uppercase leading-none text-white"
            style={{
              fontSize: 'clamp(3.4rem, 5.8vw, 6.4rem)',
              marginBottom: '1.5rem',
              letterSpacing: 0,
              textShadow: '0 4px 24px rgba(0,0,0,0.85)',
              ...anim(320),
            }}
          >
            United FC
          </h1>

          <p
            className="text-white leading-relaxed font-semibold"
            style={{
              fontSize: 'clamp(1rem, 1.25vw, 1.2rem)',
              maxWidth: 460,
              textShadow: '0 3px 18px rgba(0,0,0,0.9)',
              ...anim(420),
            }}
          >
            Home of ambition, resilience, and football excellence.
            Representing Machakos with passion and inspiring the next
            generation of champions.
          </p>

          <div className="flex gap-9 mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.35)', ...anim(520) }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-semibold text-3xl leading-none mb-1">{value}</p>
                <p className="text-white/80 uppercase tracking-widest font-semibold" style={{ fontSize: 11 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block" style={{ height: '100svh' }} />

      <div className="md:hidden relative" style={{ minHeight: '100svh', paddingTop: 96 }}>
        <div
          className="absolute bottom-0 left-0 right-0 px-6 pb-14 pt-24"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 20%, rgba(0,0,0,0.62) 65%, transparent 100%)' }}
        >
          <div className="flex items-center gap-3 mb-4" style={anim(120)}>
            <div style={{ width: 26, height: 2, background: '#ffffff' }} />
            <span className="text-white uppercase font-semibold tracking-widest" style={{ fontSize: 10 }}>
              Official Club
            </span>
          </div>

          <h1 className="font-semibold uppercase leading-none text-white" style={{ fontSize: 'clamp(2.7rem, 12vw, 4rem)', marginBottom: '0.04em', letterSpacing: 0, textShadow: '0 4px 20px rgba(0,0,0,0.9)', ...anim(200) }}>
            Machakos
          </h1>

          <h1 className="font-semibold uppercase leading-none text-white" style={{ fontSize: 'clamp(2.7rem, 12vw, 4rem)', marginBottom: '1rem', letterSpacing: 0, textShadow: '0 4px 20px rgba(0,0,0,0.9)', ...anim(280) }}>
            United FC
          </h1>

          <p className="text-white leading-relaxed text-sm font-semibold mb-6" style={{ textShadow: '0 3px 16px rgba(0,0,0,0.9)', ...anim(360) }}>
            Home of ambition, resilience, and football excellence.
          </p>

          <div className="flex gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.3)', ...anim(440) }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-semibold text-xl leading-none mb-0.5">{value}</p>
                <p className="text-white/75 uppercase tracking-widest font-semibold" style={{ fontSize: 9 }}>
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

function AboutSection() {
  const stats = [
    { value: '2005', label: 'Founded' },
    { value: '3x', label: 'KPL Titles' },
    { value: '2x', label: 'FKF Cup' },
    { value: '50+', label: 'Academy Players' },
  ]

  return (
    <section className="py-24 px-4 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-0.5 bg-green-700" />
          <span className="text-green-700 text-xs uppercase tracking-widest font-semibold">Who We Are</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#1a1a1a] uppercase leading-tight mb-6">
              More Than<br />
              <span className="text-green-700">A Football Club</span>
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4 font-medium">
              Founded in 2005, Machakos United FC is the heartbeat of Machakos County.
              We've nurtured local talent, produced stars who represent Kenya on
              the international stage, and brought silverware home three times over.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 font-medium">
              Our academy is the engine - identifying talent from the grassroots and
              developing players who compete at the highest level. Every match,
              every training session, every fan in the stands is part of this family.
            </p>
            <Link to="/squad" className="inline-flex items-center gap-2 text-green-700 font-semibold uppercase tracking-widest text-sm hover:text-black transition-colors group">
              Meet the Squad
              <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:border-green-700/40 transition-colors duration-300">
                <p className="text-5xl font-semibold text-[#1a1a1a] mb-1">{value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
                <div className="mt-4 w-8 h-0.5 bg-green-700 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LatestResultSection() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/results/')
        if (data.length > 0) setResult(data[0])
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [])

  if (loading || !result) return null

  const { fixture } = result
  const outcomeColor = { WIN: 'text-green-700', DRAW: 'text-yellow-600', LOSS: 'text-red-600' }[result.outcome] || 'text-gray-600'
  const outcomeBg = { WIN: 'bg-green-700', DRAW: 'bg-yellow-500', LOSS: 'bg-red-600' }[result.outcome] || 'bg-gray-500'

  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-0.5 bg-green-700" />
          <span className="text-green-700 text-xs uppercase tracking-widest font-semibold">Latest Result</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className={`h-1.5 ${outcomeBg}`} />
          <div className="p-8 md:p-12">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-8 font-semibold">
              {fixture.competition_display} - Matchday {fixture.matchday} - {fixture.venue}
            </p>

            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex-1 text-right">
                <p className="text-[#1a1a1a] font-semibold text-2xl md:text-4xl uppercase">{fixture.home_team}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-[#1a1a1a] text-4xl md:text-5xl font-semibold">{result.home_score}</span>
                </div>
                <span className="text-gray-400 text-2xl font-semibold">-</span>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-[#1a1a1a] text-4xl md:text-5xl font-semibold">{result.away_score}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[#1a1a1a] font-semibold text-2xl md:text-4xl uppercase">{fixture.away_team}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gray-200">
              <div>
                {result.scorers && <p className="text-gray-600 text-sm font-medium"><span className="mr-2">Goal:</span>{result.scorers}</p>}
              </div>
              <span className={`text-sm font-semibold uppercase tracking-widest ${outcomeColor}`}>{result.outcome}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/results" className="text-xs text-gray-500 hover:text-black uppercase tracking-widest font-semibold transition-colors">
            All Results -&gt;
          </Link>
        </div>
      </div>
    </section>
  )
}

function NextFixtureSection() {
  const [fixture, setFixture] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFixture = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/fixtures/')
        if (data.length > 0) setFixture(data[0])
      } finally {
        setLoading(false)
      }
    }
    fetchFixture()
  }, [])

  if (loading || !fixture) return null

  const { date, time } = formatMatchDate(fixture.match_date)

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-0.5 bg-green-700" />
          <span className="text-green-700 text-xs uppercase tracking-widest font-semibold">Next Match</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="md:w-56 bg-black flex flex-col items-center justify-center p-8 gap-2">
            <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">Kick Off</p>
            <p className="text-white text-2xl font-semibold">{date}</p>
            <p className="text-green-300 text-lg font-semibold">{time} EAT</p>
            <div className="mt-2 w-8 h-px bg-white/30" />
            <p className="text-white/70 text-xs text-center uppercase tracking-wide font-semibold">{fixture.venue}</p>
          </div>

          <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-center flex-1">
                <p className="text-[#1a1a1a] font-semibold text-xl uppercase">{fixture.home_team}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-semibold">Home</p>
              </div>
              <span className="text-2xl font-semibold text-gray-400">VS</span>
              <div className="text-center flex-1">
                <p className="text-[#1a1a1a] font-semibold text-xl uppercase">{fixture.away_team}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-semibold">Away</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <Link to={`/tickets?fixture=${fixture.id}`} className="bg-green-700 hover:bg-black text-white font-semibold px-8 py-3 rounded uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 whitespace-nowrap">
                Get Tickets
              </Link>
              {!fixture.is_sold_out && <p className="text-xs text-gray-500 font-medium">KES {Number(fixture.ticket_price).toLocaleString()} per ticket</p>}
              {fixture.is_sold_out && <p className="text-xs text-red-600 uppercase tracking-wide font-semibold">Sold Out</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/fixtures" className="text-xs text-gray-500 hover:text-black uppercase tracking-widest font-semibold transition-colors">
            Full Schedule -&gt;
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const links = [
    { label: 'Fixtures', to: '/fixtures' },
    { label: 'Results', to: '/results' },
    { label: 'Squad', to: '/squad' },
    { label: 'Tickets', to: '/tickets' },
  ]

  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-700 rotate-45" />
            <span className="text-[#1a1a1a] font-semibold uppercase">Machakos <span className="text-green-700">United</span></span>
          </div>

          <nav className="flex gap-6">
            {links.map(({ label, to }) => (
              <Link key={label} to={to} className="text-gray-500 text-sm font-semibold hover:text-black transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-4">
            {['Twitter', 'Facebook', 'Instagram'].map(platform => (
              <a key={platform} href={`https://${platform.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm font-semibold hover:text-black transition-colors">
                {platform}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">
            Copyright {new Date().getFullYear()} Machakos United FC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white text-[#1a1a1a]" style={pageFont}>
      <Hero />
      <AboutSection />
      <LatestResultSection />
      <NextFixtureSection />
      <Footer />
    </div>
  )
}