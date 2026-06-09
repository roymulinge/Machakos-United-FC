import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

function Field({ label, error, children }) {
  return (
    <div className="mb-5">
      <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span>Warning:</span> {error}
        </p>
      )}
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginUser(email, password)
      navigate('/profile')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] grid place-items-center px-4 pt-28 pb-16 relative overflow-hidden" style={pageStyle}>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-green-700 rotate-45 mx-auto mb-5" />
          <h1 className="text-[#1a1a1a] text-3xl font-semibold uppercase leading-none">
            Machakos <span className="text-green-700">United</span>
          </h1>
          <p className="text-gray-600 text-sm mt-2 tracking-widest uppercase">Member Portal</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 bg-green-700 rounded-full" />
            <h2 className="text-[#1a1a1a] text-xl font-semibold uppercase tracking-wide">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white border border-gray-300 text-[#1a1a1a] placeholder-gray-400 rounded px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-green-700 focus:border-transparent"
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="w-full bg-white border border-gray-300 text-[#1a1a1a] placeholder-gray-400 rounded px-4 py-3 pr-12 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-green-700 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-xs uppercase tracking-wide transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'hide' : 'show'}
                </button>
              </div>
            </Field>

            <div className="flex justify-end mb-6 -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-green-700 transition-colors tracking-wide"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded uppercase tracking-widest text-sm transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-gray-600 text-sm">
            No account?{' '}
            <Link to="/register" className="text-green-700 hover:text-black font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-gray-500 text-xs hover:text-black transition-colors tracking-wide">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}