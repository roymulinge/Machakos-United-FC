// src/pages/admin/AdminTickets.jsx
import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

export default function AdminTickets() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  // verify mode state
  const [ticketCode, setTicketCode] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [verifying, setVerifying]       = useState(false)

  const fetchOrders = async (status) => {
    setLoading(true)
    try {
      const params = status !== 'ALL' ? `?status=${status}` : ''
      const { data } = await apiClient.get(`/api/admin/tickets/${params}`)
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders(filter) }, [filter])

  const handleVerify = async e => {
    e.preventDefault()
    if (!ticketCode.trim()) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const { data } = await apiClient.post('/api/admin/tickets/verify/', {
        ticket_code: ticketCode.trim()
      })
      setVerifyResult({ success: true, ...data })
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed'
      setVerifyResult({ success: false, error: msg })
    } finally {
      setVerifying(false)
    }
  }

  const statusBadge = (s) => ({
    COMPLETE: 'bg-green-500/15 text-green-400',
    PENDING:  'bg-yellow-500/15 text-yellow-400',
    FAILED:   'bg-red-500/15 text-red-400',
  }[s] || 'bg-gray-500/15 text-gray-400')

  // total revenue from complete orders shown in current filter
  const revenue = orders
    .filter(o => o.status === 'COMPLETE')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  return (
    <div className="max-w-5xl mx-auto">

      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h1 className="text-white text-xl font-black uppercase tracking-tight">
          Ticket Sales
        </h1>
      </div>

      {/* verify ticket widget */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          🔍 Verify Ticket at Gate
        </p>
        <form onSubmit={handleVerify} className="flex gap-3">
          <input
            value={ticketCode}
            onChange={e => { setTicketCode(e.target.value.toUpperCase()); setVerifyResult(null) }}
            placeholder="Enter ticket code e.g. A3F9-B2D1-CC"
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-600
                       rounded-lg px-4 py-2.5 text-sm outline-none font-mono
                       focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button type="submit" disabled={verifying || !ticketCode.trim()}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50
                             text-white font-bold px-6 py-2.5 rounded-lg text-sm
                             uppercase tracking-widest transition-all">
            {verifying ? '…' : 'Verify'}
          </button>
        </form>

        {/* verify result */}
        {verifyResult && (
          <div className={`mt-3 px-4 py-3 rounded-lg border ${
            verifyResult.success
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            {verifyResult.success ? (
              <div>
                <p className="text-green-400 font-bold text-sm mb-1">
                  ✓ Valid Ticket — Allow Entry
                </p>
                <p className="text-green-300/70 text-xs">
                  {verifyResult.buyer_name} · {verifyResult.fixture} · ×{verifyResult.quantity}
                </p>
              </div>
            ) : (
              <p className="text-red-400 text-sm">✕ {verifyResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length },
          {
            label: 'Complete',
            value: orders.filter(o => o.status === 'COMPLETE').length,
            accent: 'text-green-400'
          },
          {
            label: 'Revenue',
            value: `KES ${revenue.toLocaleString()}`,
            accent: 'text-green-400'
          },
        ].map(({ label, value, accent = 'text-white' }) => (
          <div key={label}
               className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-black ${accent}`}>{value}</p>
            <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* status filter */}
      <div className="flex gap-2 mb-5">
        {['ALL', 'COMPLETE', 'PENDING', 'FAILED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs uppercase tracking-widest px-3 py-1.5 rounded-full
                              border transition-all ${
                    filter === s
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-white/10 text-gray-500 hover:border-white/20'
                  }`}>
            {s}
          </button>
        ))}
      </div>

      {/* orders table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-14 bg-white/[0.03]
                                    border border-white/10 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-xl">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['#', 'Buyer', 'Phone', 'Match', 'Qty', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-600
                                           uppercase tracking-widest font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono">{o.id}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{o.buyer_name}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{o.buyer_phone}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-[140px]">
                      {o.fixture_detail
                        ? `${o.fixture_detail.home_team} vs ${o.fixture_detail.away_team}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm font-mono">×{o.quantity}</td>
                    <td className="px-4 py-3 text-green-400 text-sm font-bold font-mono">
                      {Number(o.total_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                       ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-KE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}