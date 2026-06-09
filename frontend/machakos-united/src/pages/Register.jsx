import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

const inputClass =
  'w-full bg-white border border-gray-300 text-[#1a1a1a] placeholder-gray-400 rounded px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-green-700 focus:border-transparent'

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
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

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { registerUser } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errors = {}
    if (!formData.first_name.trim()) errors.first_name = 'Required'
    if (!formData.last_name.trim()) errors.last_name = 'Required'
    if (!formData.email.includes('@')) errors.email = 'Enter a valid email'
    if (formData.password.length < 8) errors.password = 'Minimum 8 characters'
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await registerUser(formData)
      navigate('/profile')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
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

  const passwordStrength = (() => {
    const p = formData.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-700'][passwordStrength]

  return (
    <div
      className="min-h-screen bg-white text-[#1a1a1a] grid place-items-center px-4 pt-28 pb-16 relative overflow-hidden"
      style={pageStyle}
    >
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-green-700 rotate-45 mx-auto mb-5" />
          <h1 className="text-[#1a1a1a] text-3xl font-semibold uppercase leading-none">
            Machakos <span className="text-green-700">United</span>
          </h1>
          <p className="text-gray-600 text-sm mt-2 tracking-widest uppercase">Join the Club</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-1 h-6 bg-green-700 rounded-full" />
            <h2 className="text-[#1a1a1a] text-xl font-semibold uppercase tracking-wide">
              Create Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={fieldErrors.first_name}>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className={inputClass}
                />
              </Field>

              <Field label="Last Name" error={fieldErrors.last_name}>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={inputClass}
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
                className={inputClass}
              />
            </Field>

            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black text-xs uppercase tracking-wide transition-colors"
                >
                  {showPassword ? 'hide' : 'show'}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColor : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Strength: <span className="text-gray-700">{strengthLabel}</span>
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
                placeholder="password"
                className={inputClass}
              />
            </Field>

            {globalError && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{globalError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-black hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded uppercase tracking-widest text-sm transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-gray-600 text-sm">
            Already a member?{' '}
            <Link to="/login" className="text-green-700 hover:text-black font-semibold transition-colors">
              Sign in
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