// src/pages/TicketsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

const POLL_INTERVAL_MS = 3000
const POLL_MAX_ATTEMPTS = 20

const pageStyle = {
  fontFamily: '"Spezia Serif", Georgia, "Times New Roman", serif',
  fontSynthesis: 'none',
}

const inputClass =
  'w-full bg-white border border-gray-300 text-[#1a1a1a] placeholder-gray-400 rounded px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-green-700 focus:border-transparent'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: d.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

function StepIndicator({ currentStep }) {
  const steps = ['Select Match', 'Your Details', 'Payment', 'Confirmed']

  return (
    <div className="flex items-center justify-center gap-0 mb-12 overflow-x-auto">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isDone
                    ? 'bg-green-700 text-white'
                    : isActive
                      ? 'bg-black text-white ring-4 ring-gray-200'
                      : 'bg-white text-gray-500 border border-gray-300'
                }`}
              >
                {isDone ? '✓' : stepNum}
              </div>

              <span
                className={`text-xs uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-green-700' : isDone ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`w-12 h-px mx-2 mb-5 transition-colors duration-300 ${
                  isDone ? 'bg-green-700' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FixtureSelector({ selectedFixture, onSelect }) {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/fixtures/')
        setFixtures(data)
      } catch {
        // empty state shown
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-20 bg-gray-100 border border-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
        <p className="text-gray-600">No upcoming fixtures available.</p>
        <Link to="/fixtures" className="mt-4 inline-block text-green-700 text-sm hover:text-black font-semibold">
          View full schedule -&gt;
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {fixtures.map(fixture => {
        const { date, time } = formatDate(fixture.match_date)
        const isSelected = selectedFixture?.id === fixture.id
        const isSoldOut = fixture.is_sold_out

        return (
          <button
            key={fixture.id}
            onClick={() => !isSoldOut && onSelect(fixture)}
            disabled={isSoldOut}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
              isSelected
                ? 'border-green-700 bg-green-50'
                : isSoldOut
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[#1a1a1a] font-semibold text-sm truncate">
                  {fixture.home_team}
                  <span className="text-gray-400 mx-2 font-normal">vs</span>
                  {fixture.away_team}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {fixture.competition_display} - MD{fixture.matchday}
                </p>
              </div>

              <div className="text-center flex-shrink-0">
                <p className="text-xs text-gray-700 font-semibold">{date}</p>
                <p className="text-xs text-gray-500">{time} EAT</p>
              </div>

              <div className="flex-shrink-0 text-right">
                {isSoldOut ? (
                  <span className="text-xs text-red-600 uppercase tracking-wide font-semibold">Sold Out</span>
                ) : (
                  <>
                    <p className="text-green-700 font-semibold text-sm">
                      KES {Number(fixture.ticket_price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{fixture.tickets_available} left</p>
                  </>
                )}
              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                  isSelected ? 'border-green-700 bg-green-700' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-full h-full rounded-full bg-white scale-50" />}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function BuyerDetailsForm({ fixture, formData, onChange, quantity, onQuantityChange }) {
  const unitPrice = Number(fixture.ticket_price)
  const total = unitPrice * quantity

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-xs text-green-700 uppercase tracking-widest mb-1 font-semibold">Selected Match</p>
        <p className="text-[#1a1a1a] font-semibold">
          {fixture.home_team} vs {fixture.away_team}
        </p>
        <p className="text-gray-600 text-sm mt-0.5">
          {formatDate(fixture.match_date).date} - {fixture.venue}
        </p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-600 mb-3 font-semibold">
          Number of Tickets
        </label>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onQuantityChange(n)}
              className={`w-12 h-12 rounded font-semibold text-sm transition-all ${
                quantity === n
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:border-black'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-semibold">
          Full Name
        </label>
        <input
          name="buyer_name"
          value={formData.buyer_name}
          onChange={onChange}
          placeholder="John Doe"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-semibold">
          MPesa Phone Number
        </label>
        <input
          name="buyer_phone"
          value={formData.buyer_phone}
          onChange={onChange}
          placeholder="0712345678"
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1.5">The STK push will be sent to this number</p>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 font-semibold">
          Email <span className="text-gray-500 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="email"
          name="buyer_email"
          value={formData.buyer_email}
          onChange={onChange}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Total</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {quantity} x KES {unitPrice.toLocaleString()}
          </p>
        </div>
        <p className="text-[#1a1a1a] text-2xl font-semibold">
          KES {total.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function PaymentPolling({ orderId, totalAmount, onSuccess, onFailed }) {
  const [attempts, setAttempts] = useState(0)
  const [pollStatus, setPollStatus] = useState('waiting')

  const pollOrder = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/api/tickets/orders/${orderId}/`)

      if (data.status === 'COMPLETE') {
        setPollStatus('success')
        onSuccess(data)
        return true
      }

      if (data.status === 'FAILED') {
        setPollStatus('failed')
        onFailed()
        return true
      }

      return false
    } catch {
      return false
    }
  }, [orderId, onSuccess, onFailed])

  useEffect(() => {
    setPollStatus('polling')
    let attemptCount = 0

    const interval = setInterval(async () => {
      attemptCount++
      setAttempts(attemptCount)

      const done = await pollOrder()

      if (done || attemptCount >= POLL_MAX_ATTEMPTS) {
        clearInterval(interval)
        if (!done) setPollStatus('timeout')
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [pollOrder])

  const progress = Math.min((attempts / POLL_MAX_ATTEMPTS) * 100, 100)

  return (
    <div className="text-center py-8">
      <div className="relative w-24 h-24 mx-auto mb-8">
        {pollStatus === 'polling' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-green-700/30 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-green-700/20 animate-ping" />
          </>
        )}

        <div
          className={`absolute inset-4 rounded-full flex items-center justify-center transition-colors duration-500 ${
            pollStatus === 'success'
              ? 'bg-green-700'
              : pollStatus === 'failed'
                ? 'bg-red-600'
                : pollStatus === 'timeout'
                  ? 'bg-yellow-500'
                  : 'bg-green-50 border border-green-200'
          }`}
        >
          <span className="text-2xl">
            {pollStatus === 'success'
              ? '✓'
              : pollStatus === 'failed'
                ? 'x'
                : pollStatus === 'timeout'
                  ? '!'
                  : 'MP'}
          </span>
        </div>
      </div>

      {pollStatus === 'polling' && (
        <>
          <h3 className="text-[#1a1a1a] text-xl font-semibold mb-2">Check Your Phone</h3>
          <p className="text-gray-600 text-sm max-w-xs mx-auto mb-6">
            An MPesa prompt has been sent to your phone. Enter your PIN to complete
            the payment of{' '}
            <span className="text-green-700 font-semibold">
              KES {Number(totalAmount).toLocaleString()}
            </span>.
          </p>

          <div className="max-w-xs mx-auto">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-700 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Waiting for confirmation...</p>
          </div>
        </>
      )}

      {pollStatus === 'timeout' && (
        <>
          <h3 className="text-yellow-700 text-xl font-semibold mb-2">Still Waiting...</h3>
          <p className="text-gray-600 text-sm max-w-xs mx-auto mb-6">
            Payment is taking longer than expected. If you completed the payment,
            check your orders in your profile.
          </p>
          <Link
            to="/profile"
            className="text-white bg-black hover:bg-green-700 text-sm px-6 py-2 rounded transition-colors"
          >
            View My Orders
          </Link>
        </>
      )}

      {pollStatus === 'failed' && (
        <>
          <h3 className="text-red-600 text-xl font-semibold mb-2">Payment Failed</h3>
          <p className="text-gray-600 text-sm max-w-xs mx-auto">
            The payment was cancelled or failed. Please try again.
          </p>
        </>
      )}
    </div>
  )
}

function TicketConfirmation({ order }) {
  const { date, time } = formatDate(order.fixture_detail.match_date)

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-white text-3xl font-semibold">✓</span>
      </div>

      <h3 className="text-[#1a1a1a] text-2xl font-semibold uppercase tracking-tight mb-2">
        You're In!
      </h3>
      <p className="text-gray-600 text-sm mb-8">
        Payment confirmed - Ticket #{order.id}
      </p>

      <div className="bg-white border border-green-200 rounded-lg overflow-hidden text-left mb-6 shadow-sm">
        <div className="h-1 bg-green-700" />

        <div className="p-6">
          <p className="text-xs text-green-700 uppercase tracking-widest mb-3 font-semibold">Match</p>
          <p className="text-[#1a1a1a] font-semibold text-lg mb-0.5">
            {order.fixture_detail.home_team} vs {order.fixture_detail.away_team}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {date} - {time} EAT - {order.fixture_detail.venue}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <span className="text-gray-400 text-xs">ticket</span>
            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Tickets', value: `x${order.quantity}` },
              { label: 'Total', value: `KES ${Number(order.total_amount).toLocaleString()}` },
              { label: 'Receipt', value: order.mpesa_receipt_number || '-' },
              { label: 'Buyer', value: order.buyer_name },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-[#1a1a1a] text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {order.ticket_code && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Entry Code</p>
              <p className="text-green-700 font-semibold text-xl tracking-widest">
                {order.ticket_code}
              </p>
              <p className="text-xs text-gray-500 mt-1">Show this at the gate</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to="/"
          className="text-sm text-gray-600 border border-gray-300 px-6 py-2.5 rounded hover:border-black transition-colors"
        >
          Home
        </Link>
        <Link
          to="/profile"
          className="text-sm text-white bg-black hover:bg-green-700 px-6 py-2.5 rounded transition-colors"
        >
          My Orders
        </Link>
      </div>
    </div>
  )
}

export default function TicketsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const fixtureIdFromUrl = searchParams.get('fixture')

  const [step, setStep] = useState(1)
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({
    buyer_name: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
    buyer_phone: '',
    buyer_email: user?.email || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  useEffect(() => {
    if (!fixtureIdFromUrl) return

    const fetchFixture = async () => {
      try {
        const { data } = await apiClient.get(`/api/matches/fixtures/${fixtureIdFromUrl}/`)
        setSelectedFixture(data)
        if (!data.is_sold_out) setStep(2)
      } catch {
        // user can pick manually
      }
    }

    fetchFixture()
  }, [fixtureIdFromUrl])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!formData.buyer_name.trim()) return 'Full name is required'
    if (!formData.buyer_phone.trim()) return 'Phone number is required'
    if (!selectedFixture) return 'Please select a fixture'
    return null
  }

  const handlePayment = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!user) {
      setError('You must be logged in to buy tickets')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const { data } = await apiClient.post('/api/tickets/initiate/', {
        fixture_id: selectedFixture.id,
        quantity,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email,
      })

      setCurrentOrderId(data.order_id)
      setTotalAmount(data.total_amount)
      setStep(3)
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Payment initiation failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = useCallback((order) => {
    setConfirmedOrder(order)
    setStep(4)
  }, [])

  const handlePaymentFailed = useCallback(() => {
    setStep(2)
    setError('Payment was cancelled or failed. Please try again.')
  }, [])

  const canProceedStep1 = !!selectedFixture
  const canProceedStep2 = formData.buyer_name.trim() && formData.buyer_phone.trim()

  return (
    <div
      className="min-h-screen bg-white text-[#1a1a1a] pt-28 pb-16 px-4 relative overflow-hidden"
      style={pageStyle}
    >
      <div className="relative z-10 max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-700 rounded-full" />
            <h1 className="text-[#1a1a1a] text-4xl font-semibold uppercase tracking-tight">
              Tickets
            </h1>
            <div className="w-1 h-8 bg-green-700 rounded-full" />
          </div>
          <p className="text-gray-600 text-sm tracking-wide">
            Secure your seat - Pay with MPesa
          </p>
        </div>

        {!user && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <span className="text-yellow-700 flex-shrink-0">!</span>
            <div>
              <p className="text-yellow-800 text-sm font-semibold">Sign in required</p>
              <p className="text-yellow-700 text-xs mt-0.5">
                You need to{' '}
                <Link to="/login" className="underline hover:text-black">sign in</Link>
                {' '}before purchasing tickets.
              </p>
            </div>
          </div>
        )}

        {step < 4 && <StepIndicator currentStep={step} />}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="h-0.5 bg-green-700" />

          <div className="p-6 md:p-8">
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-green-700 rounded-full" />
                  <h2 className="text-[#1a1a1a] font-semibold uppercase tracking-wide">
                    Select a Match
                  </h2>
                </div>

                <FixtureSelector selectedFixture={selectedFixture} onSelect={setSelectedFixture} />

                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full mt-6 bg-black hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded uppercase tracking-widest text-sm transition-all active:scale-[0.98]"
                >
                  Continue -&gt;
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-green-700 rounded-full" />
                  <h2 className="text-[#1a1a1a] font-semibold uppercase tracking-wide">
                    Your Details
                  </h2>
                </div>

                <BuyerDetailsForm
                  fixture={selectedFixture}
                  formData={formData}
                  onChange={handleFormChange}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                />

                {error && (
                  <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600 text-sm">Warning: {error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setStep(1)
                      setError(null)
                    }}
                    className="px-6 py-3 border border-gray-300 hover:border-black text-gray-600 text-sm rounded transition-colors uppercase tracking-widest"
                  >
                    Back
                  </button>

                  <button
                    onClick={handlePayment}
                    disabled={!canProceedStep2 || submitting || !user}
                    className="flex-1 bg-black hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded uppercase tracking-widest text-sm transition-all active:scale-[0.98]"
                  >
                    {submitting ? 'Sending to MPesa...' : 'Pay with MPesa -&gt;'}
                  </button>
                </div>
              </>
            )}

            {step === 3 && currentOrderId && (
              <PaymentPolling
                orderId={currentOrderId}
                totalAmount={totalAmount}
                onSuccess={handlePaymentSuccess}
                onFailed={handlePaymentFailed}
              />
            )}

            {step === 4 && confirmedOrder && (
              <TicketConfirmation order={confirmedOrder} />
            )}
          </div>
        </div>

        {step <= 2 && (
          <p className="text-center mt-6">
            <Link
              to="/fixtures"
              className="text-gray-500 text-xs hover:text-black uppercase tracking-widest transition-colors"
            >
              Back to Fixtures
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}