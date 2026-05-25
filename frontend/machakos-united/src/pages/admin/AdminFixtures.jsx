// src/pages/admin/AdminFixtures.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../api/client'
import { useLocation } from 'react-router-dom'
// ── reusable form field ───────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">⚠ {error}</p>}
    </div>
  )
}

// shared input class
const inputClass = `w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                    rounded-lg px-4 py-2.5 text-sm outline-none transition-all
                    focus:ring-2 focus:ring-green-500 focus:border-transparent`

// ── fixture form (shared by create and edit) ──────────────────────────────────
function FixtureForm({ initial, onSave, onCancel }) {
  const [form, setForm]       = useState(initial)
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.home_team.trim())    e.home_team    = 'Required'
    if (!form.away_team.trim())    e.away_team    = 'Required'
    if (!form.match_date)          e.match_date   = 'Required'
    if (!form.venue.trim())        e.venue        = 'Required'
    if (!form.ticket_price)        e.ticket_price = 'Required'
    if (!form.tickets_available)   e.tickets_available = 'Required'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave(form)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // map Django field errors back to form
        const serverErrors = {}
        Object.entries(data).forEach(([k, v]) => {
          serverErrors[k] = Array.isArray(v) ? v[0] : v
        })
        setErrors(serverErrors)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Home Team" error={errors.home_team}>
          <input name="home_team" value={form.home_team}
                 onChange={handleChange} placeholder="Machakos United"
                 className={inputClass} />
        </Field>
        <Field label="Away Team" error={errors.away_team}>
          <input name="away_team" value={form.away_team}
                 onChange={handleChange} placeholder="Gor Mahia"
                 className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Match Date & Time" error={errors.match_date}>
          {/* datetime-local input gives a date+time picker */}
          <input type="datetime-local" name="match_date"
                 value={form.match_date} onChange={handleChange}
                 className={inputClass} />
        </Field>
        <Field label="Competition" error={errors.competition}>
          <select name="competition" value={form.competition}
                  onChange={handleChange}
                  className={inputClass}>
            <option value="KPL">Kenyan Premier League</option>
            <option value="FKF_CUP">FKF Cup</option>
            <option value="CAF">CAF Confederation Cup</option>
            <option value="FRIENDLY">Friendly</option>
          </select>
        </Field>
      </div>

      <Field label="Venue" error={errors.venue}>
        <input name="venue" value={form.venue} onChange={handleChange}
               placeholder="Kenyatta Stadium, Machakos"
               className={inputClass} />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Matchday" error={errors.matchday}>
          <input type="number" name="matchday" value={form.matchday}
                 onChange={handleChange} min="1"
                 className={inputClass} />
        </Field>
        <Field label="Ticket Price (KES)" error={errors.ticket_price}>
          <input type="number" name="ticket_price" value={form.ticket_price}
                 onChange={handleChange} min="0"
                 className={inputClass} />
        </Field>
        <Field label="Tickets Available" error={errors.tickets_available}>
          <input type="number" name="tickets_available"
                 value={form.tickets_available}
                 onChange={handleChange} min="0"
                 className={inputClass} />
        </Field>
      </div>

      {errors.non_field_errors && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{errors.non_field_errors}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
                className="px-6 py-2.5 border border-white/10 hover:border-white/20
                           text-gray-400 text-sm rounded-lg transition-colors uppercase
                           tracking-widest">
          Cancel
        </button>
        <button type="submit" disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50
                           text-white font-bold py-2.5 rounded-lg uppercase tracking-widest
                           text-sm transition-all">
          {saving ? 'Saving…' : 'Save Fixture'}
        </button>
      </div>
    </form>
  )
}

// ── main fixtures page ────────────────────────────────────────────────────────
export default function AdminFixtures() {
  const navigate         = useNavigate()
  const [fixtures, setFixtures]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState('list')   // 'list' | 'new' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId]   = useState(null)

  const location = useLocation()

    useEffect(() => {
    if (location.pathname === '/admin/fixtures/new') {
        setView('new')
    }
    }, [location.pathname])

  const EMPTY_FORM = {
    home_team: 'Machakos United', away_team: '', match_date: '',
    venue: '', competition: 'KPL', matchday: 1,
    ticket_price: 500, tickets_available: 1000,
  }

  const fetchFixtures = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/fixtures/')
      setFixtures(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFixtures() }, [])

  const handleCreate = async (form) => {
    await apiClient.post('/api/admin/fixtures/', form)
    await fetchFixtures()
    setView('list')
  }

  const handleUpdate = async (form) => {
    await apiClient.patch(`/api/admin/fixtures/${editTarget.id}/`, form)
    await fetchFixtures()
    setView('list')
    setEditTarget(null)
  }

  const handleDelete = async (id) => {
    await apiClient.delete(`/api/admin/fixtures/${id}/`)
    setDeleteId(null)
    await fetchFixtures()
  }

  // format datetime-local value from ISO string
  const toDatetimeLocal = (isoStr) => {
    if (!isoStr) return ''
    return new Date(isoStr).toISOString().slice(0, 16)
  }

  if (view === 'new') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-green-500 rounded-full" />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">
            Add Fixture
          </h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <FixtureForm
            initial={EMPTY_FORM}
            onSave={handleCreate}
            onCancel={() => setView('list')}
          />
        </div>
      </div>
    )
  }

  if (view === 'edit' && editTarget) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-yellow-500 rounded-full" />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">
            Edit Fixture
          </h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <FixtureForm
            initial={{ ...editTarget, match_date: toDatetimeLocal(editTarget.match_date) }}
            onSave={handleUpdate}
            onCancel={() => { setView('list'); setEditTarget(null) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-green-500 rounded-full" />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">
            Fixtures
          </h1>
          <span className="text-xs text-gray-600 bg-white/5 border border-white/10
                           px-2 py-0.5 rounded-full">
            {fixtures.length}
          </span>
        </div>
        <button
          onClick={() => setView('new')}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2
                     rounded-lg uppercase tracking-widest text-xs transition-all"
        >
          + Add Fixture
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-white/[0.03]
                                    border border-white/10 rounded-xl" />
          ))}
        </div>
      ) : fixtures.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-xl">
          <p className="text-gray-600 mb-4">No fixtures yet</p>
          <button onClick={() => setView('new')}
                  className="text-green-400 text-sm border border-green-500/20
                             px-4 py-2 rounded-full hover:border-green-500/40 transition-colors">
            Add your first fixture
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Match', 'Date', 'Competition', 'Tickets', 'Result', 'Actions'].map(h => (
                  <th key={h}
                      className="text-left px-4 py-3 text-xs text-gray-600
                                 uppercase tracking-widest font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fixtures.map(f => (
                <tr key={f.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">
                      {f.home_team} vs {f.away_team}
                    </p>
                    <p className="text-gray-600 text-xs">{f.venue}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(f.match_date).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-green-400 bg-green-500/10
                                     px-2 py-0.5 rounded-full">
                      {f.competition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                    {f.tickets_available}
                  </td>
                  <td className="px-4 py-3">
                    {f.result ? (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        f.result.outcome === 'WIN'  ? 'bg-green-500/15 text-green-400' :
                        f.result.outcome === 'DRAW' ? 'bg-yellow-500/15 text-yellow-400' :
                                                      'bg-red-500/15 text-red-400'
                      }`}>
                        {f.result.home_score}–{f.result.away_score}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-700">Upcoming</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditTarget(f); setView('edit') }}
                        className="text-xs text-gray-500 hover:text-white border
                                   border-white/10 hover:border-white/20 px-3 py-1
                                   rounded-lg transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(f.id)}
                        className="text-xs text-gray-500 hover:text-red-400 border
                                   border-white/10 hover:border-red-500/20 px-3 py-1
                                   rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                        flex items-center justify-center p-4">
          <div className="bg-[#0f1a0f] border border-red-500/20 rounded-2xl p-6
                          max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Delete Fixture?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete the fixture and its result.
              Ticket orders will be protected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                      className="flex-1 border border-white/10 text-gray-400 py-2
                                 rounded-lg text-sm hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold
                                 py-2 rounded-lg text-sm transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}