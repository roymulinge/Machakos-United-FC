// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState(null) // null | 'loading' | 'sent' | 'error'
  const [error, setError]     = useState('')
  const { requestPasswordReset } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required'); return }

    setStatus('loading')
    setError('')

    try {
      await requestPasswordReset(email)
      // always show success — never reveal if email exists (security)
      setStatus('sent')
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] grid place-items-center px-4 py-16
                    relative overflow-hidden">

      {/* decorative background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full border border-green-900/30" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* club header */}
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-green-500 rotate-45 mx-auto mb-5" />
          <h1 className="text-white text-3xl font-black uppercase tracking-tight leading-none">
            Machakos <span className="text-green-400">United</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-widest uppercase">
            Password Reset
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8
                        backdrop-blur-sm">

          {status === 'sent' ? (
            // ── success state ─────────────────────────────────────────────
            <div className="text-center py-4">
              {/* checkmark circle */}
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/30
                              rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-green-400 text-2xl">✓</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                If an account exists for{' '}
                <span className="text-white font-medium">{email}</span>,
                we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-green-400 border border-green-500/20
                           hover:border-green-500/40 px-6 py-2.5 rounded-full
                           transition-colors"
              >
                Back to Sign In
              </Link>
            </div>

          ) : (
            // ── form state ────────────────────────────────────────────────
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-green-500 rounded-full" />
                <h2 className="text-white text-xl font-bold uppercase tracking-wide">
                  Reset Password
                </h2>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-widest
                                   text-gray-400 mb-2 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white
                               placeholder-gray-600 rounded-lg px-4 py-3 text-sm
                               outline-none transition-all duration-200
                               focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {error && (
                    <p className="mt-1.5 text-xs text-red-400">⚠ {error}</p>
                  )}
                </div>

                {status === 'error' && (
                  <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20
                                  rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50
                             disabled:cursor-not-allowed text-white font-bold py-3
                             rounded-lg uppercase tracking-widest text-sm
                             transition-all duration-200 active:scale-[0.98]"
                >
                  {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-600 text-xs uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <p className="text-center text-gray-500 text-sm">
                Remember your password?{' '}
                <Link to="/login"
                      className="text-green-400 hover:text-green-300 font-medium
                                 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center mt-6">
          <Link to="/"
                className="text-gray-600 text-xs hover:text-gray-400 transition-colors
                           tracking-wide">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}