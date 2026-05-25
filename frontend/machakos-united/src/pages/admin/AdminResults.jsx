// src/pages/admin/AdminResults.jsx
import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

const inputClass = `w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                    rounded-lg px-4 py-2.5 text-sm outline-none transition-all
                    focus:ring-2 focus:ring-green-500 focus:border-transparent`

function Field({ label, children, hint }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs uppercase tracking-widest text-gray-500">{label}</label>
        {hint && <span className="text-xs text-gray-700">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ── Add Result Form ───────────────────────────────────────────────────────────
function AddResultForm({ fixture, onSave, onCancel }) {
  const [form, setForm]     = useState({
    fixture:     fixture.id,
    home_score:  0,
    away_score:  0,
    outcome:     'WIN',
    scorers:     '',
    match_report:'',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // auto-calculate outcome based on scores
  // called whenever home_score or away_score changes
  const handleScoreChange = e => {
    const { name, value } = e.target
    const updated = { ...form, [name]: Number(value) }

    // determine outcome automatically
    const home = name === 'home_score' ? Number(value) : form.home_score
    const away = name === 'away_score' ? Number(value) : form.away_score
    updated.outcome = home > away ? 'WIN' : home < away ? 'LOSS' : 'DRAW'

    setForm(updated)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch (err) {
      const data = err.response?.data
      if (data?.non_field_errors) {
        setError(data.non_field_errors[0])
      } else if (data?.fixture) {
        setError('This fixture already has a result. Edit it instead.')
      } else {
        setError('Failed to save result. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const outcomeColor = {
    WIN:  'text-green-400',
    DRAW: 'text-yellow-400',
    LOSS: 'text-red-400',
  }[form.outcome]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* fixture summary — read only */}
      <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Match</p>
        <p className="text-white font-bold">
          {fixture.home_team} vs {fixture.away_team}
        </p>
        <p className="text-gray-500 text-xs mt-0.5">
          {fixture.competition_display} · MD{fixture.matchday} · {fixture.venue}
        </p>
      </div>

      {/* scoreline */}
      <div className="grid grid-cols-3 gap-4 items-center">
        <Field label={fixture.home_team}>
          <input
            type="number"
            name="home_score"
            value={form.home_score}
            onChange={handleScoreChange}
            min="0" max="20"
            // text-center + text-4xl makes it look like a real scoreboard
            className={`${inputClass} text-center text-4xl font-black py-4`}
          />
        </Field>

        {/* outcome display — auto-calculated from scores */}
        <div className="text-center pt-5">
          <div className={`text-2xl font-black uppercase tracking-widest ${outcomeColor}`}>
            {form.outcome}
          </div>
          <p className="text-gray-700 text-xs mt-1">Auto-calculated</p>
        </div>

        <Field label={fixture.away_team}>
          <input
            type="number"
            name="away_score"
            value={form.away_score}
            onChange={handleScoreChange}
            min="0" max="20"
            className={`${inputClass} text-center text-4xl font-black py-4`}
          />
        </Field>
      </div>

      {/* override outcome manually if needed */}
      <Field label="Outcome" hint="Auto-set from scores — override if needed">
        <div className="flex gap-2">
          {['WIN', 'DRAW', 'LOSS'].map(o => (
            <button
              key={o}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, outcome: o }))}
              className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase
                          tracking-widest border transition-all ${
                form.outcome === o
                  ? o === 'WIN'  ? 'border-green-500  bg-green-500/15  text-green-400'
                  : o === 'DRAW' ? 'border-yellow-500 bg-yellow-500/15 text-yellow-400'
                  :                'border-red-500    bg-red-500/15    text-red-400'
                  : 'border-white/10 text-gray-600 hover:border-white/20'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </Field>

      {/* scorers */}
      <Field label="Goal Scorers" hint="optional">
        <input
          name="scorers"
          value={form.scorers}
          onChange={handleChange}
          placeholder="Ochieng' 12', Mwangi 90+3'"
          className={inputClass}
        />
      </Field>

      {/* match report */}
      <Field label="Match Report" hint="optional">
        <textarea
          name="match_report"
          value={form.match_report}
          onChange={handleChange}
          rows={3}
          placeholder="A brief summary of the match…"
          className={`${inputClass} resize-none`}
        />
      </Field>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">⚠ {error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-white/10 text-gray-400 text-sm
                     rounded-lg hover:border-white/20 transition-colors uppercase
                     tracking-widest"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50
                     text-white font-bold py-2.5 rounded-lg uppercase tracking-widest
                     text-sm transition-all"
        >
          {saving ? 'Saving…' : 'Save Result'}
        </button>
      </div>
    </form>
  )
}

// ── Edit Result Form ──────────────────────────────────────────────────────────
function EditResultForm({ result, fixture, onSave, onCancel }) {
  const [form, setForm]     = useState({
    home_score:   result.home_score,
    away_score:   result.away_score,
    outcome:      result.outcome,
    scorers:      result.scorers || '',
    match_report: result.match_report || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleScoreChange = e => {
    const { name, value } = e.target
    const updated = { ...form, [name]: Number(value) }
    const home = name === 'home_score' ? Number(value) : form.home_score
    const away = name === 'away_score' ? Number(value) : form.away_score
    updated.outcome = home > away ? 'WIN' : home < away ? 'LOSS' : 'DRAW'
    setForm(updated)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(form)
    } catch {
      setError('Failed to update result.')
    } finally {
      setSaving(false)
    }
  }

  const outcomeColor = {
    WIN:  'text-green-400',
    DRAW: 'text-yellow-400',
    LOSS: 'text-red-400',
  }[form.outcome]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Editing Result</p>
        <p className="text-white font-bold">
          {fixture.home_team} vs {fixture.away_team}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        <Field label={fixture.home_team}>
          <input type="number" name="home_score" value={form.home_score}
                 onChange={handleScoreChange} min="0" max="20"
                 className={`${inputClass} text-center text-4xl font-black py-4`} />
        </Field>
        <div className="text-center pt-5">
          <div className={`text-2xl font-black uppercase ${outcomeColor}`}>
            {form.outcome}
          </div>
        </div>
        <Field label={fixture.away_team}>
          <input type="number" name="away_score" value={form.away_score}
                 onChange={handleScoreChange} min="0" max="20"
                 className={`${inputClass} text-center text-4xl font-black py-4`} />
        </Field>
      </div>

      <div className="flex gap-2">
        {['WIN', 'DRAW', 'LOSS'].map(o => (
          <button key={o} type="button"
                  onClick={() => setForm(prev => ({ ...prev, outcome: o }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase
                              tracking-widest border transition-all ${
                    form.outcome === o
                      ? o === 'WIN'  ? 'border-green-500  bg-green-500/15  text-green-400'
                      : o === 'DRAW' ? 'border-yellow-500 bg-yellow-500/15 text-yellow-400'
                      :                'border-red-500    bg-red-500/15    text-red-400'
                      : 'border-white/10 text-gray-600 hover:border-white/20'
                  }`}>
            {o}
          </button>
        ))}
      </div>

      <Field label="Goal Scorers" hint="optional">
        <input name="scorers" value={form.scorers} onChange={handleChange}
               placeholder="Ochieng' 12', Mwangi 90+3'" className={inputClass} />
      </Field>

      <Field label="Match Report" hint="optional">
        <textarea name="match_report" value={form.match_report} onChange={handleChange}
                  rows={3} className={`${inputClass} resize-none`} />
      </Field>

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
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50
                           text-white font-bold py-2.5 rounded-lg uppercase tracking-widest
                           text-sm transition-all">
          {saving ? 'Updating…' : 'Update Result'}
        </button>
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminResults() {
  const [fixtures, setFixtures]   = useState([])
  const [loading, setLoading]     = useState(true)
  // selectedFixture — the fixture we're adding/editing a result for
  const [selectedFixture, setSelectedFixture] = useState(null)
  // mode: null | 'add' | 'edit'
  const [mode, setMode]           = useState(null)
  // filter: 'pending' = no result yet, 'done' = has result, 'all'
  const [filter, setFilter]       = useState('pending')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchFixtures = async () => {
    try {
      // use admin endpoint — gets ALL fixtures including past ones
      const { data } = await apiClient.get('/api/admin/fixtures/')
      setFixtures(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFixtures() }, [])

  const handleAddResult = async form => {
    // POST to admin results endpoint
    await apiClient.post('/api/admin/results/', form)
    await fetchFixtures()
    setMode(null)
    setSelectedFixture(null)
    // show success message for 3 seconds
    setSuccessMsg('Result added successfully')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleEditResult = async form => {
    // PATCH — partial update of existing result
    await apiClient.patch(
      `/api/admin/results/${selectedFixture.result.id}/`,
      form
    )
    await fetchFixtures()
    setMode(null)
    setSelectedFixture(null)
    setSuccessMsg('Result updated successfully')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleDeleteResult = async resultId => {
    await apiClient.delete(`/api/admin/results/${resultId}/`)
    await fetchFixtures()
    setSuccessMsg('Result removed')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // filter fixtures based on whether they have a result
  const filteredFixtures = fixtures.filter(f => {
    if (filter === 'pending') return !f.result
    if (filter === 'done')    return  f.result
    return true
  })

  // show the add/edit form
  if (mode === 'add' && selectedFixture) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-green-500 rounded-full" />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">
            Add Result
          </h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <AddResultForm
            fixture={selectedFixture}
            onSave={handleAddResult}
            onCancel={() => { setMode(null); setSelectedFixture(null) }}
          />
        </div>
      </div>
    )
  }

  if (mode === 'edit' && selectedFixture) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-yellow-500 rounded-full" />
          <h1 className="text-white text-xl font-black uppercase tracking-tight">
            Edit Result
          </h1>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <EditResultForm
            fixture={selectedFixture}
            result={selectedFixture.result}
            onSave={handleEditResult}
            onCancel={() => { setMode(null); setSelectedFixture(null) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-green-500 rounded-full" />
        <h1 className="text-white text-xl font-black uppercase tracking-tight">
          Results
        </h1>
        <span className="text-xs text-gray-600 bg-white/5 border border-white/10
                         px-2 py-0.5 rounded-full">
          {filteredFixtures.length}
        </span>
      </div>

      {/* success banner */}
      {successMsg && (
        <div className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20
                        rounded-xl flex items-center gap-2">
          <span className="text-green-400">✓</span>
          <p className="text-green-400 text-sm">{successMsg}</p>
        </div>
      )}

      {/* filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'pending', label: 'Needs Result' },
          { key: 'done',    label: 'Has Result'   },
          { key: 'all',     label: 'All'          },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs uppercase tracking-widest px-3 py-1.5 rounded-full
                        border transition-all ${
              filter === key
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-white/10 text-gray-500 hover:border-white/20'
            }`}
          >
            {label}
            {/* show count badge */}
            <span className="ml-1.5 text-gray-600">
              {key === 'pending' ? fixtures.filter(f => !f.result).length
               : key === 'done'  ? fixtures.filter(f =>  f.result).length
               :                   fixtures.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-white/[0.03]
                                    border border-white/10 rounded-xl" />
          ))}
        </div>
      ) : filteredFixtures.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-xl">
          <p className="text-gray-600 text-sm">
            {filter === 'pending'
              ? 'All matches have results — great work!'
              : 'No matches found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFixtures.map(fixture => {
            const matchDate = new Date(fixture.match_date)
            const isPast    = matchDate < new Date()
            const hasResult = !!fixture.result

            return (
              <div
                key={fixture.id}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-4
                           hover:border-white/15 transition-colors"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">

                  {/* left: match info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-white font-bold text-sm">
                        {fixture.home_team}
                        <span className="text-gray-600 mx-2 font-normal">vs</span>
                        {fixture.away_team}
                      </p>
                      {/* show score if result exists */}
                      {hasResult && (
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          fixture.result.outcome === 'WIN'
                            ? 'bg-green-500/15 text-green-400'
                            : fixture.result.outcome === 'DRAW'
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-red-500/15 text-red-400'
                        }`}>
                          {fixture.result.home_score}–{fixture.result.away_score}
                          {' '}({fixture.result.outcome})
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs">
                      {fixture.competition_display} · MD{fixture.matchday} ·{' '}
                      {matchDate.toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                    {/* show scorers if result has them */}
                    {hasResult && fixture.result.scorers && (
                      <p className="text-gray-600 text-xs mt-1">
                        ⚽ {fixture.result.scorers}
                      </p>
                    )}
                  </div>

                  {/* right: action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!hasResult && isPast && (
                      // past match with no result → Add Result button
                      <button
                        onClick={() => {
                          setSelectedFixture(fixture)
                          setMode('add')
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold
                                   px-4 py-2 rounded-lg text-xs uppercase tracking-widest
                                   transition-all"
                      >
                        + Add Result
                      </button>
                    )}

                    {!hasResult && !isPast && (
                      // future match — can still pre-add if needed
                      <button
                        onClick={() => {
                          setSelectedFixture(fixture)
                          setMode('add')
                        }}
                        className="border border-white/10 hover:border-white/20 text-gray-500
                                   hover:text-white px-4 py-2 rounded-lg text-xs uppercase
                                   tracking-widest transition-all"
                      >
                        Pre-add
                      </button>
                    )}

                    {hasResult && (
                      // has result → Edit and Delete options
                      <>
                        <button
                          onClick={() => {
                            setSelectedFixture(fixture)
                            setMode('edit')
                          }}
                          className="border border-white/10 hover:border-white/20 text-gray-400
                                     hover:text-white px-3 py-2 rounded-lg text-xs uppercase
                                     tracking-widest transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteResult(fixture.result.id)}
                          className="border border-white/10 hover:border-red-500/20 text-gray-500
                                     hover:text-red-400 px-3 py-2 rounded-lg text-xs uppercase
                                     tracking-widest transition-all"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}