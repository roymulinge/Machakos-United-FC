import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const { requestPasswordReset } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setStatus('loading')
    setError('')

    try {
      await requestPasswordReset(email)
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
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
          <p className="text-gray-600 text-sm mt-2 tracking-widest uppercase">
            Password Reset
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          {status === 'sent' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-green-700 text-2xl">✓</span>
              </div>
              <h2 className="text-[#1a1a1a] font-semibold text-xl mb-2">Check your email</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                If an account exists for{' '}
                <span className="text-[#1a1a1a] font-semibold">{email}</span>,
                we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-white bg-black hover:bg-green-700 px-6 py-2.5 rounded transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-green-700 rounded-full" />
                <h2 className="text-[#1a1a1a] text-xl font-semibold uppercase tracking-wide">
                  Reset Password
                </h2>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white border border-gray-300 text-[#1a1a1a] placeholder-gray-400 rounded px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                  {error && (
                    <p className="mt-1.5 text-xs text-red-600">Warning: {error}</p>
                  )}
                </div>

                {status === 'error' && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-black hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded uppercase tracking-widest text-sm transition-all duration-200 active:scale-[0.98]"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-500 text-xs uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <p className="text-center text-gray-600 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-green-700 hover:text-black font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
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