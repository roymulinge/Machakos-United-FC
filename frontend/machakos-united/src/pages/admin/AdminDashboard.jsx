// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'

// ── stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = 'text-green-400', icon }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5
                    hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-600 uppercase tracking-widest">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${accent} leading-none mb-1`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user }          = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get('/api/admin/stats/')
        setStats(data)
      } catch (err) {
        console.error('Stats fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="max-w-6xl mx-auto">

      {/* greeting */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-black uppercase tracking-tight">
          Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'},{' '}
          <span className="text-green-400">{user?.first_name}</span>
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {loading ? (
        // skeleton grid
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/[0.03] border border-white/10
                                    rounded-xl h-28" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Revenue"
              value={`KES ${Number(stats.revenue).toLocaleString()}`}
              sub={`${stats.total_orders} orders`}
              accent="text-green-400"
              icon="💰"
            />
            <StatCard
              label="Tickets Sold"
              value={stats.total_tickets.toLocaleString()}
              sub="this season"
              accent="text-blue-400"
              icon="🎟"
            />
            <StatCard
              label="Upcoming Matches"
              value={stats.upcoming}
              sub="fixtures scheduled"
              accent="text-yellow-400"
              icon="📅"
            />
            <StatCard
              label="Squad Size"
              value={stats.squad_size}
              sub="active players"
              accent="text-purple-400"
              icon="👥"
            />
            <StatCard
              label="Wins"
              value={stats.record.wins}
              sub={`${stats.record.draws}D · ${stats.record.losses}L`}
              accent="text-green-400"
              icon="🏆"
            />
            <StatCard
              label="Win Rate"
              value={
                (stats.record.wins + stats.record.draws + stats.record.losses) > 0
                  ? `${Math.round(
                      (stats.record.wins /
                        (stats.record.wins + stats.record.draws + stats.record.losses)) * 100
                    )}%`
                  : '—'
              }
              sub="this season"
              accent="text-green-400"
              icon="📊"
            />
          </div>

          {/* recent orders table */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden mb-8">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-green-500 rounded-full" />
                <h2 className="text-white font-bold uppercase tracking-wide text-sm">
                  Recent Sales
                </h2>
              </div>
              <Link to="/admin/tickets"
                    className="text-xs text-green-400 hover:text-green-300 transition-colors">
                View all →
              </Link>
            </div>

            {stats.recent_orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Buyer', 'Match', 'Qty', 'Amount', 'Date'].map(h => (
                        <th key={h}
                            className="text-left px-5 py-3 text-xs text-gray-600
                                       uppercase tracking-widest font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_orders.map(order => (
                      <tr key={order.id}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02]
                                     transition-colors">
                        <td className="px-5 py-3 text-white text-sm font-medium">
                          {order.buyer_name}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-sm truncate max-w-[180px]">
                          {order.fixture}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-sm">
                          ×{order.quantity}
                        </td>
                        <td className="px-5 py-3 text-green-400 text-sm font-bold font-mono">
                          KES {Number(order.total_amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {new Date(order.created_at).toLocaleDateString('en-KE')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* quick actions */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-green-500 rounded-full" />
              <h2 className="text-white font-bold uppercase tracking-wide text-sm">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Add Fixture',  to: '/admin/fixtures/new',  icon: '➕' },
                { label: 'Add Result',   to: '/admin/results/new',   icon: '⚽' },
                { label: 'Add Player',   to: '/admin/squad/new',     icon: '👤' },
                { label: 'Verify Ticket',to: '/admin/verify',        icon: '✓'  },
              ].map(({ label, to, icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 bg-white/[0.03] border border-white/10
                             hover:border-green-500/30 hover:bg-green-500/5 rounded-xl p-4
                             transition-all duration-200 group"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-gray-400 group-hover:text-white text-sm
                                   font-medium transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-600">Failed to load dashboard data.</p>
        </div>
      )}
    </div>
  )
}