import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

// ─── reusable field wrapper ──────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
          {label}
        </label>
        {/* optional hint text on the right — e.g. character count */}
        {hint && <span className="text-xs text-gray-600">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── avatar initials generator ───────────────────────────────────────────
// Takes a user object and returns up to 2 initials e.g. "JD" for John Doe
function getInitials(user) {
  if (!user) return '?'
  const first = user.first_name?.[0] || ''
  const last  = user.last_name?.[0]  || ''
  return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?'
}

export default function Profile() {
  const { user, updateUserProfile, logoutUser } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name:   user?.first_name          || '',
    last_name:    user?.last_name           || '',
    bio:          user?.profile?.bio        || '',
    phone_number: user?.profile?.phone_number || '',
  })

  // status tracks the save feedback: null | 'saving' | 'success' | 'error'
  const [status, setStatus] = useState(null)

  // isDirty tracks whether the user has changed anything — disables save if not
  const [isDirty, setIsDirty] = useState(false)

  // sync formData when user object changes (e.g. after first load from API)
  useEffect(() => {
    if (user) {
      setFormData({
        first_name:   user.first_name            || '',
        last_name:    user.last_name             || '',
        bio:          user.profile?.bio          || '',
        phone_number: user.profile?.phone_number || '',
      })
    }
  }, [user])  // re-runs whenever user object reference changes

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setIsDirty(true)   // mark form as changed
    setStatus(null)    // clear save status when user edits
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setStatus('saving')
    try {
      await updateUserProfile(formData)
      setStatus('success')
      setIsDirty(false)
      // auto-clear the success message after 3 seconds
      setTimeout(() => setStatus(null), 3000)
    } catch (err) {
      setStatus('error')
    }
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  // guard: if not logged in, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] grid place-items-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 bg-green-500 rotate-45 mx-auto mb-6" />
          <p className="text-gray-400 mb-6">You need to be signed in to view your profile.</p>
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3
                       rounded-lg uppercase tracking-widest text-sm transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] px-4 py-20 relative overflow-hidden">

      {/* ── decorative background ─────────────────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* ── top bar: breadcrumb + logout ──────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors tracking-wide">
            ← Home
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors
                       uppercase tracking-widest border border-white/10 hover:border-red-500/30
                       px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>

        {/* ── profile header card ───────────────────────────────────── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6 flex items-center gap-5">

          {/* avatar circle with initials */}
          <div className="w-16 h-16 rounded-full bg-green-600/20 border-2 border-green-500/30
                          flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 font-black text-xl">{getInitials(user)}</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* min-w-0 prevents flex child from overflowing */}
            <h1 className="text-white text-xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            {/* truncate shortens long emails with an ellipsis */}
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
          </div>

          {/* member badge */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs uppercase tracking-widest text-green-400 font-medium">Member</span>
            <div className="w-6 h-0.5 bg-green-500" />
          </div>
        </div>

        {/* ── edit form card ────────────────────────────────────────── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">

          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-white text-xl font-bold uppercase tracking-wide">Edit Profile</h2>
          </div>

          <form onSubmit={handleUpdate} noValidate>

            {/* two-column name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name">
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                             rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </Field>
              <Field label="Last Name">
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                             rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </Field>
            </div>

            <Field label="Phone Number" hint="Format: 07XXXXXXXX or 254XXXXXXXXX">
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0712345678"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                           rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </Field>

            {/* hint shows character count for bio */}
            <Field label="Bio" hint={`${formData.bio.length}/200`}>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength={200}
                rows={3}
                placeholder="Tell us about yourself…"
                // resize-none prevents the textarea from being manually resized
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                           rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                           focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </Field>

            {/* status feedback messages */}
            {status === 'success' && (
              <div className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">✓ Profile updated successfully</p>
              </div>
            )}
            {status === 'error' && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">⚠ Update failed. Please try again.</p>
              </div>
            )}

            {/* save button — disabled when nothing changed OR while saving */}
            <button
              type="submit"
              disabled={!isDirty || status === 'saving'}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                         uppercase tracking-widest text-sm transition-all duration-200
                         active:scale-[0.98]"
            >
              {status === 'saving' ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── danger zone ───────────────────────────────────────────── */}
        <div className="mt-6 bg-white/[0.02] border border-red-500/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-red-500/60 rounded-full" />
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wide">Account</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Sign out of your account</p>
              <p className="text-gray-600 text-xs mt-0.5">You can sign back in anytime</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40
                         text-xs uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}