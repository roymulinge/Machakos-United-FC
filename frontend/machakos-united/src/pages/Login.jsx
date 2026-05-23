import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

// ─── tiny reusable field wrapper ───────────────────────────────────────────
// Accepts a label, the input element as children, and an optional error string
function Field({ label, error, children }) {
  return (
    // mb-5 = margin-bottom spacing between fields
    <div className="mb-5">
      {/* uppercase tracking-widest = spaced-out small caps label — editorial feel */}
      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 font-medium">
        {label}
      </label>
      {children}
      {/* only renders the error paragraph if error string is truthy */}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  // showPassword toggles between type="password" and type="text"
  const [showPassword, setShowPassword] = useState(false)

  const { loginUser } = useAuth()
  const navigate      = useNavigate()

  const handleSubmit = async (e) => {
    // e.preventDefault() stops the browser from reloading the page on form submit
    e.preventDefault()
    setError('')        // clear previous errors before a new attempt
    setLoading(true)    // show spinner while the API call is in-flight

    try {
      await loginUser(email, password)
      navigate('/profile')
    } catch (err) {
      // optional chaining (?.) safely accesses nested properties that may not exist
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      // finally always runs — whether the try succeeded or the catch fired
      setLoading(false)
    }
  }

  return (
    // min-h-screen = fills full viewport height
    // grid place-items-center = centres child both horizontally and vertically
    <div className="min-h-screen bg-[#0a0f0a] grid place-items-center px-4 py-16 relative overflow-hidden">

      {/* ── decorative pitch-line background stripes ──────────────────── */}
      {/* aria-hidden hides decorative elements from screen readers */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* diagonal green lines evoke a football pitch texture */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        {/* large faded circle — centre circle of a pitch */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full border border-green-900/30" />
        {/* floodlight glow from top-right */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl" />
      </div>

      {/* ── main card ──────────────────────────────────────────────────── */}
      {/* relative z-10 keeps the card above the decorative background */}
      <div className="relative z-10 w-full max-w-md">

        {/* club identity header */}
        <div className="text-center mb-10">
          {/* the green rotated diamond — same as Navbar logo mark */}
          <div className="w-10 h-10 bg-green-500 rotate-45 mx-auto mb-5" />
          <h1 className="text-white text-3xl font-black uppercase tracking-tight leading-none">
            Machakos <span className="text-green-400">United</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-widest uppercase">Member Portal</p>
        </div>

        {/* form card — semi-transparent dark surface */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

          {/* tab-style heading */}
          <div className="flex items-center gap-3 mb-8">
            {/* green left-border accent — common in sports UI */}
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-white text-xl font-bold uppercase tracking-wide">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* noValidate disables browser's default validation UI — we handle it ourselves */}

            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                // w-full = stretch to container width
                // bg-white/5 = very subtle white tint on dark bg
                // focus:ring-2 focus:ring-green-500 = green glow on focus
                // focus:border-transparent = hide default border when focused
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                           rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200
                           focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </Field>

            <Field label="Password">
              {/* relative container so we can position the show/hide button inside */}
              <div className="relative">
                <input
                  // toggle between password and text type
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  // pr-12 = padding-right to leave space for the eye button
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                             rounded-lg px-4 py-3 pr-12 text-sm outline-none transition-all duration-200
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {/* show/hide password toggle button */}
                <button
                  type="button"  // type="button" prevents this from submitting the form
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300
                             text-xs uppercase tracking-wide transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'hide' : 'show'}
                </button>
              </div>
            </Field>

            {/* forgot password link — right aligned */}
            <div className="flex justify-end mb-6 -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-green-400 transition-colors tracking-wide"
              >
                Forgot password?
              </Link>
            </div>

            {/* global error banner — only shows when error state is non-empty */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* submit button */}
            <button
              type="submit"
              disabled={loading}
              // disabled:opacity-50 = dims button while loading
              // disabled:cursor-not-allowed = shows ⊘ cursor while loading
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50
                         disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                         uppercase tracking-widest text-sm transition-all duration-200
                         active:scale-[0.98]"
            >
              {/* ternary: show spinner text while loading, normal text otherwise */}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* register link */}
          <p className="text-center text-gray-500 text-sm">
            No account?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>

        {/* back to home */}
        <p className="text-center mt-6">
          <Link to="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors tracking-wide">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}