// src/pages/HomePage.jsx
// No useState import needed — we use it below so it's imported correctly
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'

// ─── helpers ─────────────────────────────────────────────────────────────────

// Formats a date string into "Sat, 28 May · 4:00 PM"
function formatMatchDate(dateStr) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

// ─── section: Hero ────────────────────────────────────────────────────────────
function Hero() {
  return (
    // h-screen = full viewport height
    // overflow-hidden clips the decorative elements that extend beyond the section
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0a0f0a]">

      {/* pitch texture overlay — diagonal lines like a football pitch */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        {/* centre circle of pitch — large faint ring behind the text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[700px] h-[700px] rounded-full border border-green-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[400px] h-[400px] rounded-full border border-green-900/20" />
        {/* floodlight glow — top corners */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-green-600/8 blur-3xl" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-green-600/8 blur-3xl" />
        {/* bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40
                        bg-gradient-to-t from-[#0a0f0a] to-transparent" />
      </div>

      {/* hero content — z-10 keeps it above the decorative layer */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

        {/* club badge mark */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-green-500 rotate-45" />
            {/* white inner diamond */}
            <div className="absolute inset-3 bg-[#0a0f0a] rotate-45" />
          </div>
        </div>

        {/* main headline — staggered animation via animation-delay */}
        <div className="overflow-hidden mb-2">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-white
                         animate-[fadeUp_0.8s_ease_forwards]">
            Machakos
          </h1>
        </div>
        <div className="overflow-hidden mb-6">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-green-400
                         animate-[fadeUp_0.8s_0.15s_ease_forwards] opacity-0">
            United FC
          </h1>
        </div>

        <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed
                      animate-[fadeUp_0.8s_0.3s_ease_forwards] opacity-0">
          Pride of Machakos County. Built on grit, driven by passion,
          backed by you.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center
                        animate-[fadeUp_0.8s_0.45s_ease_forwards] opacity-0">
          <Link
            to="/tickets"
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8
                       rounded-full transition-all duration-200 uppercase tracking-widest
                       text-sm active:scale-95"
          >
            Buy Tickets
          </Link>
          <Link
            to="/fixtures"
            className="border border-white/20 hover:border-white/40 text-white font-bold
                       py-4 px-8 rounded-full transition-all duration-200 uppercase
                       tracking-widest text-sm hover:bg-white/5"
          >
            View Fixtures
          </Link>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                      animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-gray-600" />
        <div className="w-1 h-1 bg-gray-600 rounded-full" />
      </div>
    </section>
  )
}

// ─── section: About ───────────────────────────────────────────────────────────
function AboutSection() {
  // stat items displayed in the grid
  const stats = [
    { value: '2005', label: 'Founded'        },
    { value: '3×',   label: 'KPL Titles'     },
    { value: '2×',   label: 'FKF Cup'        },
    { value: '50+',  label: 'Academy Players' },
  ]

  return (
    <section className="py-24 px-4 bg-[#0a0f0a] relative">
      {/* left border accent line */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-green-900/40" />

      <div className="max-w-6xl mx-auto">
        {/* section label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-green-500" />
          <span className="text-green-400 text-xs uppercase tracking-widest font-medium">
            Who We Are
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* left: text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase
                           tracking-tight leading-tight mb-6">
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
              className="inline-flex items-center gap-2 text-green-400 font-bold
                         uppercase tracking-widest text-sm hover:text-green-300
                         transition-colors group"
            >
              Meet the Squad
              {/* arrow moves right on hover */}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* right: stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6
                           hover:border-green-500/30 transition-colors duration-300"
              >
                {/* large stat number */}
                <p className="text-5xl font-black text-white mb-1">{value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
                {/* bottom green line accent */}
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
// Fetches the most recent match result from the API
function LatestResultSection() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        // results are ordered by -fixture__match_date so index 0 is most recent
        const { data } = await apiClient.get('/api/matches/results/')
        if (data.length > 0) setResult(data[0])
      } catch {
        // fail silently — section just won't render
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // don't render the section at all if no results yet
  if (loading || !result) return null

  const { fixture } = result

  // outcome determines the accent colour
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
      {/* subtle green wash behind the section */}
      <div aria-hidden="true"
           className="absolute inset-0 bg-green-950/20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* section label */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-green-500" />
          <span className="text-green-400 text-xs uppercase tracking-widest font-medium">
            Latest Result
          </span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {/* coloured top strip based on outcome */}
          <div className={`h-1 ${outcomeBg}`} />

          <div className="p-8 md:p-12">
            {/* competition info */}
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">
              {fixture.competition_display} · Matchday {fixture.matchday} · {fixture.venue}
            </p>

            {/* scoreline — the centrepiece */}
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex-1 text-right">
                <p className="text-white font-black text-2xl md:text-4xl uppercase tracking-tight">
                  {fixture.home_team}
                </p>
              </div>

              {/* score boxes */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/20
                                rounded-xl flex items-center justify-center">
                  <span className="text-white text-4xl md:text-5xl font-black">
                    {result.home_score}
                  </span>
                </div>
                <span className="text-gray-600 text-2xl font-bold">—</span>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 border border-white/20
                                rounded-xl flex items-center justify-center">
                  <span className="text-white text-4xl md:text-5xl font-black">
                    {result.away_score}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-white font-black text-2xl md:text-4xl uppercase tracking-tight">
                  {fixture.away_team}
                </p>
              </div>
            </div>

            {/* outcome badge + scorers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center
                            justify-between gap-4 pt-6 border-t border-white/5">
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
          <Link to="/results"
                className="text-xs text-gray-600 hover:text-gray-400 uppercase
                           tracking-widest transition-colors">
            All Results →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── section: Next Fixture ────────────────────────────────────────────────────
// Fetches the next upcoming fixture from the API
function NextFixtureSection() {
  const [fixture, setFixture] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        // upcoming fixtures are ordered soonest first — index 0 is next match
        const { data } = await apiClient.get('/api/matches/fixtures/')
        if (data.length > 0) setFixture(data[0])
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    fetch()
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

        {/* fixture card — horizontal layout on md+ */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl
                        overflow-hidden flex flex-col md:flex-row">

          {/* left green panel: date + time */}
          <div className="md:w-56 bg-green-600/20 border-r border-green-500/20
                          flex flex-col items-center justify-center p-8 gap-2">
            {/* small label */}
            <p className="text-green-400 text-xs uppercase tracking-widest font-medium">
              Kick Off
            </p>
            <p className="text-white text-2xl font-black">{date}</p>
            <p className="text-green-300 text-lg font-bold">{time} EAT</p>
            <div className="mt-2 w-8 h-px bg-green-500/40" />
            <p className="text-green-400/70 text-xs text-center uppercase tracking-wide">
              {fixture.venue}
            </p>
          </div>

          {/* right panel: teams + ticket button */}
          <div className="flex-1 p-8 flex flex-col md:flex-row items-center
                          justify-between gap-6">

            {/* teams */}
            <div className="flex items-center gap-6 flex-1">
              <div className="text-center flex-1">
                <p className="text-white font-black text-xl uppercase tracking-tight">
                  {fixture.home_team}
                </p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">Home</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-gray-700">VS</span>
              </div>

              <div className="text-center flex-1">
                <p className="text-white font-black text-xl uppercase tracking-tight">
                  {fixture.away_team}
                </p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-wide">Away</p>
              </div>
            </div>

            {/* ticket CTA */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <Link
                to={`/tickets?fixture=${fixture.id}`}
                className="bg-green-600 hover:bg-green-500 text-white font-bold
                           px-8 py-3 rounded-full uppercase tracking-widest text-sm
                           transition-all duration-200 active:scale-95 whitespace-nowrap"
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
          <Link to="/fixtures"
                className="text-xs text-gray-600 hover:text-gray-400 uppercase
                           tracking-widest transition-colors">
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

          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rotate-45" />
            <span className="text-white font-black uppercase tracking-tight">
              Machakos <span className="text-green-400">United</span>
            </span>
          </div>

          {/* nav links — use Link not <a> for internal routes */}
          <nav className="flex gap-6">
            {links.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-gray-600 text-sm hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* social links — these are external so <a> is correct */}
          <div className="flex gap-4">
            {['Twitter', 'Facebook', 'Instagram'].map(platform => (
              <a
                key={platform}
                href={`https://${platform.toLowerCase()}.com`}
                target="_blank"             // opens in new tab
                rel="noopener noreferrer"   // security — prevents new tab from accessing window.opener
                className="text-gray-600 text-sm hover:text-white transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
        </div>

        {/* bottom line */}
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
    // dark background across all sections
    <div className="bg-[#0a0f0a]">
      <Hero />
      <AboutSection />
      <LatestResultSection />
      <NextFixtureSection />
      <Footer />
    </div>
  )
}