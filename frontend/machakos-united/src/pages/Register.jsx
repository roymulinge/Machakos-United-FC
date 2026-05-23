import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

// ─── reusable field wrapper (same as Login) ──────────────────────────────
function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default function Register() {
  // single formData object holds all fields — cleaner than 5 separate useState calls
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  // fieldErrors holds per-field validation messages (e.g. { email: 'Already taken' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { registerUser } = useAuth()
  const navigate         = useNavigate()

  // generic change handler — [e.target.name] uses computed property key
  // so one function handles ALL inputs instead of writing one per field
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // clear the field-specific error as soon as the user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // client-side validation before hitting the API
  const validate = () => {
    const errors = {}
    if (!formData.first_name.trim()) errors.first_name = 'Required'
    if (!formData.last_name.trim())  errors.last_name  = 'Required'
    if (!formData.email.includes('@')) errors.email    = 'Enter a valid email'
    if (formData.password.length < 8) errors.password  = 'Minimum 8 characters'
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }
    return errors  // empty object = no errors = valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')

    // run validation — if any errors exist, show them and stop
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return  // early return — don't call the API with invalid data
    }

    setLoading(true)
    try {
      await registerUser(formData)
      navigate('/profile')
    } catch (err) {
      // Django returns field errors as { email: ['Already taken.'] }
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // map Django's array errors to single strings for display
        const serverErrors = {}
        Object.entries(data).forEach(([key, val]) => {
          serverErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setFieldErrors(serverErrors)
      } else {
        setGlobalError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // password strength: 0-4 based on criteria met
  const passwordStrength = (() => {
    const p = formData.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8)            score++  // length
    if (/[A-Z]/.test(p))         score++  // uppercase
    if (/[0-9]/.test(p))         score++  // number
    if (/[^A-Za-z0-9]/.test(p))  score++  // special char
    return score
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength]

  return (
    <div className="min-h-screen bg-[#0a0f0a] grid place-items-center px-4 py-16 relative overflow-hidden">

      {/* ── decorative background (same pattern as Login) ─────────────── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full border border-green-900/30" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* club header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-green-500 rotate-45 mx-auto mb-5" />
          <h1 className="text-white text-3xl font-black uppercase tracking-tight leading-none">
            Machakos <span className="text-green-400">United</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-widest uppercase">Join the Club</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-white text-xl font-bold uppercase tracking-wide">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* first name + last name side by side on medium+ screens */}
            {/* grid-cols-2 = two equal columns, gap-4 = space between them */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={fieldErrors.first_name}>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                             rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </Field>
              <Field label="Last Name" error={fieldErrors.last_name}>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                             rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </Field>
            </div>

            <Field label="Email Address" error={fieldErrors.email}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                           rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                             rounded-lg px-4 py-3 pr-12 text-sm outline-none transition-all duration-200
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500
                             hover:text-gray-300 text-xs uppercase tracking-wide transition-colors"
                >
                  {showPassword ? 'hide' : 'show'}
                </button>
              </div>

              {/* password strength meter — only shows when user has typed something */}
              {formData.password && (
                <div className="mt-2">
                  {/* 4 bars — each lights up based on strength score */}
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColor : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Strength: <span className="text-gray-300">{strengthLabel}</span>
                  </p>
                </div>
              )}
            </Field>

            <Field label="Confirm Password" error={fieldErrors.confirm_password}>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                           rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </Field>

            {globalError && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{globalError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-green-600 hover:bg-green-500 disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                         uppercase tracking-widest text-sm transition-all duration-200
                         active:scale-[0.98]"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="text-center text-gray-500 text-sm">
            Already a member?{' '}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors tracking-wide">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}