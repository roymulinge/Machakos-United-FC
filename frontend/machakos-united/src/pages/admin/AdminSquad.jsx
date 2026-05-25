// src/pages/admin/AdminSquad.jsx
import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

const inputClass = `w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                    rounded-lg px-4 py-2.5 text-sm outline-none transition-all
                    focus:ring-2 focus:ring-green-500 focus:border-transparent`

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}

const EMPTY_PLAYER = {
  name: '', squad_number: '', position: 'GK', nationality: 'Kenyan',
  appearances: 0, goals: 0, assists: 0, clean_sheets: 0,
  bio: '', is_active: true,
}

function PlayerForm({ initial, onSave, onCancel }) {
  const [form, setForm]     = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      setError(err.response?.data?.squad_number?.[0] || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name">
          <input name="name" value={form.name} onChange={handleChange}
                 placeholder="John Ochieng'" required className={inputClass} />
        </Field>
        <Field label="Squad Number">
          <input type="number" name="squad_number" value={form.squad_number}
                 onChange={handleChange} min="1" max="99" required
                 className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Position">
          <select name="position" value={form.position} onChange={handleChange}
                  className={inputClass}>
            <option value="GK">Goalkeeper</option>
            <option value="DEF">Defender</option>
            <option value="MID">Midfielder</option>
            <option value="FWD">Forward</option>
          </select>
        </Field>
        <Field label="Nationality">
          <input name="nationality" value={form.nationality}
                 onChange={handleChange} className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { name: 'appearances', label: 'Apps'   },
          { name: 'goals',       label: 'Goals'  },
          { name: 'assists',     label: 'Assists' },
          { name: 'clean_sheets',label: 'Clean'  },
        ].map(({ name, label }) => (
          <Field key={name} label={label}>
            <input type="number" name={name} value={form[name]}
                   onChange={handleChange} min="0"
                   className={inputClass} />
          </Field>
        ))}
      </div>

      <Field label="Bio (optional)">
        <textarea name="bio" value={form.bio} onChange={handleChange}
                  rows={2} placeholder="Player background…"
                  className={`${inputClass} resize-none`} />
      </Field>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="is_active" checked={form.is_active}
               onChange={handleChange}
               className="w-4 h-4 accent-green-500" />
        <span className="text-gray-400 text-sm">Active (visible on squad page)</span>
      </label>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">⚠ {error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
                className="px-6 py-2.5 border border-white/10 text-gray-400 text-sm
                           rounded-lg hover:border-white/20 transition-colors uppercase
                           tracking-widest">
          Cancel
        </button>
        <button type="submit" disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50
                           text-white font-bold py-2.5 rounded-lg uppercase tracking-widest
                           text-sm transition-all">
          {saving ? 'Saving…' : 'Save Player'}
        </button>
      </div>
    </form>
  )
}

export default function AdminSquad() {
  const [players, setPlayers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState('list')
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [filter, setFilter]         = useState('ALL')

  const fetchPlayers = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/squad/')
      setPlayers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlayers() }, [])

  const handleCreate = async form => {
    await apiClient.post('/api/admin/squad/', form)
    await fetchPlayers()
    setView('list')
  }

  const handleUpdate = async form => {
    await apiClient.patch(`/api/admin/squad/${editTarget.id}/`, form)
    await fetchPlayers()
    setView('list')
    setEditTarget(null)
  }

  const handleDelete = async id => {
    await apiClient.delete(`/api/admin/squad/${id}/`)
    setDeleteId(null)
    await fetchPlayers()
  }

  const positionColor = {
    GK: 'text-yellow-400 bg-yellow-500/10',
    DEF:'text-blue-400   bg-blue-500/10',
    MID:'text-green-400  bg-green-500/10',
    FWD:'text-red-400    bg-red-500/10',
  }

  const filtered = filter === 'ALL'
    ? players
    : players.filter(p => p.position === filter)

  if (view === 'new' || (view === 'edit' && editTarget)) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-1 h-7 rounded-full ${view === 'new' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">
            {view === 'new' ? 'Add Player' : 'Edit Player'}
          </h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <PlayerForm
            initial={view === 'new' ? EMPTY_PLAYER : editTarget}
            onSave={view === 'new' ? handleCreate : handleUpdate}
            onCancel={() => { setView('list'); setEditTarget(null) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-green-500 rounded-full" />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">Squad</h1>
          <span className="text-xs text-gray-600 bg-white/5 border border-white/10
                           px-2 py-0.5 rounded-full">
            {players.length}
          </span>
        </div>
        <button onClick={() => setView('new')}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2
                           rounded-lg uppercase tracking-widest text-xs transition-all">
          + Add Player
        </button>
      </div>

      {/* position filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
          <button key={pos} onClick={() => setFilter(pos)}
                  className={`text-xs uppercase tracking-widest px-3 py-1.5 rounded-full
                              border transition-all ${
                    filter === pos
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-white/10 text-gray-500 hover:border-white/20'
                  }`}>
            {pos}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-14 bg-white/[0.03]
                                    border border-white/10 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['#', 'Name', 'Position', 'Apps', 'Goals', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-600
                                         uppercase tracking-widest font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono text-sm">
                    {p.squad_number}
                  </td>
                  <td className="px-4 py-3 text-white text-sm font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                                     ${positionColor[p.position]}`}>
                      {p.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                    {p.appearances}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm font-mono">
                    {p.goals}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.is_active
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditTarget(p); setView('edit') }}
                        className="text-xs text-gray-500 hover:text-white border
                                   border-white/10 hover:border-white/20 px-3 py-1
                                   rounded-lg transition-all">
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="text-xs text-gray-500 hover:text-red-400 border
                                   border-white/10 hover:border-red-500/20 px-3 py-1
                                   rounded-lg transition-all">
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                        flex items-center justify-center p-4">
          <div className="bg-[#0f1a0f] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Delete Player?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This permanently removes the player from the squad.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                      className="flex-1 border border-white/10 text-gray-400 py-2
                                 rounded-lg text-sm transition-colors">
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