// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/client'

function getInitials(user) {
  if (!user) return '?'
  const first = user.first_name?.[0] || ''
  const last  = user.last_name?.[0]  || ''
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
}

function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
          {label}
        </label>
        {hint && <span className="text-xs text-gray-600">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Tab({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                  uppercase tracking-widest border-b-2 transition-all duration-200 ${
        active
          ? 'border-green-500 text-green-400'
          : 'border-transparent text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

function OrderCard({ order }) {
  const statusStyles = {
    COMPLETE: 'bg-green-500/15 text-green-400 border-green-500/20',
    PENDING:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    FAILED:   'bg-red-500/15 text-red-400 border-red-500/20',
  }
  const fixture   = order.fixture_detail
  const matchDate = fixture ? new Date(fixture.match_date) : null

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden
                    hover:border-white/15 transition-colors">
      <div className={`h-0.5 w-full ${
        order.status === 'COMPLETE' ? 'bg-green-500' :
        order.status === 'PENDING'  ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {fixture ? (
              <>
                <p className="text-white font-bold text-sm truncate">
                  {fixture.home_team} vs {fixture.away_team}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {matchDate?.toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })} · {fixture.venue}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Match details unavailable</p>
            )}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1
                           rounded-full border flex-shrink-0 ${statusStyles[order.status]}`}>
            {order.status}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Tickets</p>
              <p className="text-white text-sm font-bold">x{order.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest">Total</p>
              <p className="text-green-400 text-sm font-bold font-mono">
                KES {Number(order.total_amount).toLocaleString()}
              </p>
            </div>
            {order.ticket_code && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest">Code</p>
                <p className="text-white text-sm font-mono font-bold tracking-widest">
                  {order.ticket_code}
                </p>
              </div>
            )}
          </div>
          <p className="text-gray-700 text-xs">
            {new Date(order.created_at).toLocaleDateString('en-KE')}
          </p>
        </div>
        {order.status === 'COMPLETE' && order.mpesa_receipt_number && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-600">
              MPesa Receipt: <span className="text-gray-400 font-mono">{order.mpesa_receipt_number}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileTab({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name:   user?.first_name            || '',
    last_name:    user?.last_name             || '',
    bio:          user?.profile?.bio          || '',
    phone_number: user?.profile?.phone_number || '',
  })
  const [status, setStatus]   = useState(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        first_name:   user.first_name            || '',
        last_name:    user.last_name             || '',
        bio:          user.profile?.bio          || '',
        phone_number: user.profile?.phone_number || '',
      })
    }
  }, [user])

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsDirty(true)
    setStatus(null)
  }

  const handleUpdate = async e => {
    e.preventDefault()
    setStatus('saving')
    try {
      await onUpdate(formData)
      setStatus('success')
      setIsDirty(false)
      setTimeout(() => setStatus(null), 3000)
    } catch {
      setStatus('error')
    }
  }

  const inputClass = `w-full bg-white/5 border border-white/10 text-white
                      placeholder-gray-600 rounded-lg px-4 py-3 text-sm outline-none
                      transition-all duration-200 focus:ring-2 focus:ring-green-500
                      focus:border-transparent`

  return (
    <form onSubmit={handleUpdate} noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name">
          <input name="first_name" value={formData.first_name}
                 onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Last Name">
          <input name="last_name" value={formData.last_name}
                 onChange={handleChange} className={inputClass} />
        </Field>
      </div>
      <Field label="Phone Number" hint="Format: 07XXXXXXXX">
        <input name="phone_number" value={formData.phone_number}
               onChange={handleChange} placeholder="0712345678" className={inputClass} />
      </Field>
      <Field label="Bio" hint={`${formData.bio.length}/200`}>
        <textarea name="bio" value={formData.bio} onChange={handleChange}
                  maxLength={200} rows={3} placeholder="Tell us about yourself"
                  className={`${inputClass} resize-none`} />
      </Field>
      {status === 'success' && (
        <div className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">Profile updated successfully</p>
        </div>
      )}
      {status === 'error' && (
        <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">Update failed. Please try again.</p>
        </div>
      )}
      <button type="submit" disabled={!isDirty || status === 'saving'}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                         uppercase tracking-widest text-sm transition-all active:scale-[0.98]">
        {status === 'saving' ? 'Saving' : 'Save Changes'}
      </button>
    </form>
  )
}

function TicketsTab() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/api/tickets/my-orders/')
        setOrders(data)
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-28 bg-white/[0.03]
                                  border border-white/10 rounded-xl" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg mb-2">No tickets yet</p>
        <p className="text-gray-700 text-sm mb-6">Your purchased tickets will appear here.</p>
        <Link to="/tickets"
              className="text-green-400 text-sm border border-green-500/20 px-6 py-2.5
                         rounded-full hover:border-green-500/40 transition-colors">
          Browse Fixtures
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {['ALL', 'COMPLETE', 'PENDING', 'FAILED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs uppercase tracking-widest px-3 py-1.5 rounded-full
                              border transition-all ${
                    filter === s
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-white/10 text-gray-500 hover:border-white/20'
                  }`}>
            {s}
            <span className="ml-1.5 text-gray-600">
              {s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length}
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 text-sm">No {filter.toLowerCase()} orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, updateUserProfile, logoutUser } = useAuth()
  const navigate   = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = () => { logoutUser(); navigate('/') }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] grid place-items-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 bg-green-500 rotate-45 mx-auto mb-6" />
          <p className="text-gray-400 mb-6">You need to be signed in to view your profile.</p>
          <Link to="/login"
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3
                           rounded-lg uppercase tracking-widest text-sm transition-all">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] px-4 py-20 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)' }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors tracking-wide">
            Back to Home
          </Link>
          <button onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors
                             uppercase tracking-widest border border-white/10
                             hover:border-red-500/30 px-4 py-2 rounded-lg">
            Sign Out
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6
                        flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-600/20 border-2 border-green-500/30
                          flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 font-black text-xl">{getInitials(user)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl font-bold">{user.first_name} {user.last_name}</h1>
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
            {user.is_admin_user && (
              <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs text-green-400
                               bg-green-500/10 border border-green-500/20 px-2.5 py-0.5
                               rounded-full capitalize">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                {user.role}
              </span>
            )}
          </div>
          {user.is_admin_user && (
            <Link to="/admin"
                  className="hidden sm:flex items-center gap-2 text-xs text-green-400
                             border border-green-500/20 hover:border-green-500/40
                             px-3 py-2 rounded-lg transition-colors uppercase tracking-widest
                             flex-shrink-0">
              Admin
            </Link>
          )}
        </div>

        <div className="flex border-b border-white/10 mb-6">
          <Tab label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <Tab label="My Tickets" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} />
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
          {activeTab === 'profile'
            ? <ProfileTab user={user} onUpdate={updateUserProfile} />
            : <TicketsTab />
          }
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white/[0.02] border border-red-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 bg-red-500/60 rounded-full" />
              <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide">Account</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">Sign out of your account</p>
                <p className="text-gray-600 text-xs mt-0.5">You can sign back in anytime</p>
              </div>
              <button onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 border border-red-500/20
                                 hover:border-red-500/40 text-xs uppercase tracking-widest
                                 px-4 py-2 rounded-lg transition-all">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}