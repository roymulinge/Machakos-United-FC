// src/pages/TicketsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'

// ─── constants ────────────────────────────────────────────────────────────────
// How often we poll the order status after STK push (milliseconds)
const POLL_INTERVAL_MS = 3000
// How many times we poll before giving up
const POLL_MAX_ATTEMPTS = 20

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────
// Shows which step the user is on: Select → Details → Pay → Confirm
function StepIndicator({ currentStep }) {
  const steps = ['Select Match', 'Your Details', 'Payment', 'Confirmed']

  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const stepNum  = i + 1
        const isActive = stepNum === currentStep
        const isDone   = stepNum < currentStep

        return (
          <div key={label} className="flex items-center">
            {/* circle */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                              text-xs font-black transition-all duration-300 ${
                isDone   ? 'bg-green-500 text-white' :
                isActive ? 'bg-green-600 text-white ring-4 ring-green-500/20' :
                           'bg-white/5 text-gray-600 border border-white/10'
              }`}>
                {/* checkmark for completed steps */}
                {isDone ? '✓' : stepNum}
              </div>
              <span className={`text-xs uppercase tracking-widest whitespace-nowrap
                               transition-colors duration-300 ${
                isActive ? 'text-green-400' : isDone ? 'text-gray-400' : 'text-gray-700'
              }`}>
                {label}
              </span>
            </div>

            {/* connector line between steps */}
            {i < steps.length - 1 && (
              <div className={`w-12 h-px mx-2 mb-5 transition-colors duration-300 ${
                isDone ? 'bg-green-500' : 'bg-white/10'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Fixture selector ─────────────────────────────────────────────────
function FixtureSelector({ selectedFixture, onSelect }) {
  const [fixtures, setFixtures] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await apiClient.get('/api/matches/fixtures/')
        setFixtures(data)
      } catch {
        // handled silently — empty list shown
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
          <div key={i} className="animate-pulse h-20 bg-white/[0.03]
                                  border border-white/10 rounded-xl" />
        ))}
      </div>
    )
  }

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12 bg-white/[0.02] border border-white/10 rounded-2xl">
        <p className="text-gray-500">No upcoming fixtures available.</p>
        <Link to="/fixtures"
              className="mt-4 inline-block text-green-400 text-sm hover:text-green-300">
          View full schedule →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {fixtures.map(fixture => {
        const { date, time } = formatDate(fixture.match_date)
        const isSelected = selectedFixture?.id === fixture.id
        const isSoldOut  = fixture.is_sold_out

        return (
          <button
            key={fixture.id}
            onClick={() => !isSoldOut && onSelect(fixture)}
            disabled={isSoldOut}
            // w-full + text-left makes the button behave like a block element
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                        ${isSelected
                          ? 'border-green-500 bg-green-500/10'
                          : isSoldOut
                            ? 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* left: teams */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {fixture.home_team}
                  <span className="text-gray-600 mx-2 font-normal">vs</span>
                  {fixture.away_team}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {fixture.competition_display} · MD{fixture.matchday}
                </p>
              </div>

              {/* center: date */}
              <div className="text-center flex-shrink-0">
                <p className="text-xs text-gray-400 font-medium">{date}</p>
                <p className="text-xs text-gray-600">{time} EAT</p>
              </div>

              {/* right: price or sold out */}
              <div className="flex-shrink-0 text-right">
                {isSoldOut ? (
                  <span className="text-xs text-red-400 uppercase tracking-wide">Sold Out</span>
                ) : (
                  <>
                    <p className="text-green-400 font-black text-sm">
                      KES {Number(fixture.ticket_price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {fixture.tickets_available} left
                    </p>
                  </>
                )}
              </div>

              {/* selected indicator */}
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                isSelected ? 'border-green-500 bg-green-500' : 'border-gray-600'
              }`}>
                {isSelected && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Step 2: Buyer details form ───────────────────────────────────────────────
function BuyerDetailsForm({ fixture, formData, onChange, quantity, onQuantityChange }) {
  const unitPrice  = Number(fixture.ticket_price)
  const total      = unitPrice * quantity

  return (
    <div className="space-y-6">
      {/* fixture summary card */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <p className="text-xs text-green-400 uppercase tracking-widest mb-1">Selected Match</p>
        <p className="text-white font-bold">
          {fixture.home_team} vs {fixture.away_team}
        </p>
        <p className="text-gray-400 text-sm mt-0.5">
          {formatDate(fixture.match_date).date} · {fixture.venue}
        </p>
      </div>

      {/* quantity selector */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">
          Number of Tickets
        </label>
        {/* flex row of quantity buttons */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onQuantityChange(n)}
              className={`w-12 h-12 rounded-xl font-bold text-sm transition-all ${
                quantity === n
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* buyer name */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
          Full Name
        </label>
        <input
          name="buyer_name"
          value={formData.buyer_name}
          onChange={onChange}
          placeholder="John Doe"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                     rounded-lg px-4 py-3 text-sm outline-none transition-all
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* MPesa phone */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
          MPesa Phone Number
        </label>
        <input
          name="buyer_phone"
          value={formData.buyer_phone}
          onChange={onChange}
          placeholder="0712345678"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                     rounded-lg px-4 py-3 text-sm outline-none transition-all
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-600 mt-1.5">
          The STK push will be sent to this number
        </p>
      </div>

      {/* email (optional) */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">
          Email <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="email"
          name="buyer_email"
          value={formData.buyer_email}
          onChange={onChange}
          placeholder="you@example.com"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600
                     rounded-lg px-4 py-3 text-sm outline-none transition-all
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* total summary */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4
                      flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Total</p>
          <p className="text-xs text-gray-600 mt-0.5">
            {quantity} × KES {unitPrice.toLocaleString()}
          </p>
        </div>
        <p className="text-white text-2xl font-black">
          KES {total.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

// ─── Step 3: Payment / polling screen ────────────────────────────────────────
function PaymentPolling({ orderId, totalAmount, onSuccess, onFailed }) {
  const [attempts, setAttempts] = useState(0)
  const [pollStatus, setPollStatus] = useState('waiting')
  // 'waiting' | 'polling' | 'success' | 'failed' | 'timeout'

  // useCallback memoizes the function — prevents it being recreated on every render
  // which would cause the useEffect to loop infinitely
  const pollOrder = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/api/tickets/orders/${orderId}/`)

      if (data.status === 'COMPLETE') {
        setPollStatus('success')
        onSuccess(data)
        return true   // signal to stop polling
      }

      if (data.status === 'FAILED') {
        setPollStatus('failed')
        onFailed()
        return true   // signal to stop polling
      }

      return false    // still PENDING — keep polling
    } catch {
      return false    // network error — keep trying
    }
  }, [orderId, onSuccess, onFailed])

  useEffect(() => {
    setPollStatus('polling')
    let attemptCount = 0

    // setInterval runs pollOrder every POLL_INTERVAL_MS milliseconds
    const interval = setInterval(async () => {
      attemptCount++
      setAttempts(attemptCount)

      const done = await pollOrder()

      if (done || attemptCount >= POLL_MAX_ATTEMPTS) {
        clearInterval(interval)   // stop polling
        if (!done) setPollStatus('timeout')
      }
    }, POLL_INTERVAL_MS)

    // cleanup: clear interval when component unmounts
    // prevents memory leaks and stale state updates
    return () => clearInterval(interval)
  }, [pollOrder])

  const progress = Math.min((attempts / POLL_MAX_ATTEMPTS) * 100, 100)

  return (
    <div className="text-center py-8">

      {/* animated phone icon */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* pulsing rings */}
        {pollStatus === 'polling' && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-green-500/30
                            animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-green-500/20
                            animate-ping animation-delay-300" />
          </>
        )}
        {/* centre circle */}
        <div className={`absolute inset-4 rounded-full flex items-center justify-center
                         transition-colors duration-500 ${
          pollStatus === 'success' ? 'bg-green-500' :
          pollStatus === 'failed'  ? 'bg-red-500'   :
          pollStatus === 'timeout' ? 'bg-yellow-500' :
                                     'bg-green-600/30 border border-green-500/40'
        }`}>
          <span className="text-2xl">
            {pollStatus === 'success' ? '✓' :
             pollStatus === 'failed'  ? '✕' :
             pollStatus === 'timeout' ? '⏱' : '📱'}
          </span>
        </div>
      </div>

      {/* status text */}
      {pollStatus === 'polling' && (
        <>
          <h3 className="text-white text-xl font-bold mb-2">
            Check Your Phone
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">
            An MPesa prompt has been sent to your phone.
            Enter your PIN to complete the payment of{' '}
            <span className="text-green-400 font-bold">
              KES {Number(totalAmount).toLocaleString()}
            </span>.
          </p>
          {/* progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-700 mt-2">
              Waiting for confirmation…
            </p>
          </div>
        </>
      )}

      {pollStatus === 'timeout' && (
        <>
          <h3 className="text-yellow-400 text-xl font-bold mb-2">
            Still Waiting…
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">
            Payment is taking longer than expected. If you completed the payment,
            check your orders in your profile.
          </p>
          <Link
            to="/profile"
            className="text-green-400 text-sm border border-green-500/20 px-6 py-2
                       rounded-full hover:border-green-500/40 transition-colors"
          >
            View My Orders
          </Link>
        </>
      )}

      {pollStatus === 'failed' && (
        <>
          <h3 className="text-red-400 text-xl font-bold mb-2">
            Payment Failed
          </h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            The payment was cancelled or failed. Please try again.
          </p>
        </>
      )}
    </div>
  )
}

// ─── Step 4: Confirmation screen ──────────────────────────────────────────────
function TicketConfirmation({ order }) {
  const { date, time } = formatDate(order.fixture_detail.match_date)

  return (
    <div className="text-center">

      {/* success animation */}
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center
                      mx-auto mb-6 animate-[scaleIn_0.4s_ease_forwards]">
        <span className="text-white text-3xl font-black">✓</span>
      </div>

      <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
        You're In!
      </h3>
      <p className="text-gray-400 text-sm mb-8">
        Payment confirmed · Ticket #{order.id}
      </p>

      {/* ticket card */}
      <div className="bg-white/[0.03] border border-green-500/20 rounded-2xl
                      overflow-hidden text-left mb-6">
        {/* green top strip */}
        <div className="h-1 bg-green-500" />

        <div className="p-6">
          {/* match info */}
          <p className="text-xs text-green-400 uppercase tracking-widest mb-3">Match</p>
          <p className="text-white font-bold text-lg mb-0.5">
            {order.fixture_detail.home_team} vs {order.fixture_detail.away_team}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {date} · {time} EAT · {order.fixture_detail.venue}
          </p>

          {/* divider with scissors icon — ticket aesthetic */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-dashed border-white/10" />
            <span className="text-gray-700 text-xs">✂</span>
            <div className="flex-1 border-t border-dashed border-white/10" />
          </div>

          {/* ticket details grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Tickets',  value: `×${order.quantity}`        },
              { label: 'Total',    value: `KES ${Number(order.total_amount).toLocaleString()}` },
              { label: 'Receipt',  value: order.mpesa_receipt_number || '—' },
              { label: 'Buyer',    value: order.buyer_name            },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-white text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* ticket code — the QR placeholder */}
          {order.ticket_code && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Entry Code</p>
              {/* font-mono makes the code easy to read character by character */}
              <p className="text-green-400 font-mono font-black text-xl tracking-widest">
                {order.ticket_code}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Show this at the gate
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to="/"
          className="text-sm text-gray-500 border border-white/10 px-6 py-2.5
                     rounded-full hover:border-white/20 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/profile"
          className="text-sm text-green-400 border border-green-500/20 px-6 py-2.5
                     rounded-full hover:border-green-500/40 transition-colors"
        >
          My Orders
        </Link>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const { user }    = useAuth()
  // useSearchParams reads URL query params e.g. /tickets?fixture=3
  const [searchParams] = useSearchParams()
  const fixtureIdFromUrl = searchParams.get('fixture')

  // ── state ─────────────────────────────────────────────────────────────
  const [step, setStep]                   = useState(1)
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [quantity, setQuantity]           = useState(1)
  const [formData, setFormData]           = useState({
    buyer_name:  user?.first_name ? `${user.first_name} ${user.last_name}` : '',
    buyer_phone: '',
    buyer_email: user?.email || '',
  })
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState(null)
  const [currentOrderId, setCurrentOrderId]   = useState(null)
  const [totalAmount, setTotalAmount]         = useState(0)
  const [confirmedOrder, setConfirmedOrder]   = useState(null)

  // if user came from /tickets?fixture=3, pre-load that fixture
  useEffect(() => {
    if (!fixtureIdFromUrl) return
    const fetchFixture = async () => {
      try {
        const { data } = await apiClient.get(`/api/matches/fixtures/${fixtureIdFromUrl}/`)
        setSelectedFixture(data)
        // pre-select and jump to step 2
        if (!data.is_sold_out) setStep(2)
      } catch {
        // fixture not found — user picks manually
      }
    }
    fetchFixture()
  }, [fixtureIdFromUrl])

  // generic change handler for the buyer form
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // validate before submitting
  const validate = () => {
    if (!formData.buyer_name.trim())  return 'Full name is required'
    if (!formData.buyer_phone.trim()) return 'Phone number is required'
    if (!selectedFixture)             return 'Please select a fixture'
    return null   // null = no error = valid
  }

  // initiate payment — called when user clicks "Pay with MPesa"
  const handlePayment = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    if (!user) { setError('You must be logged in to buy tickets'); return }

    setError(null)
    setSubmitting(true)

    try {
      const { data } = await apiClient.post('/api/tickets/initiate/', {
        fixture_id:  selectedFixture.id,
        quantity,
        buyer_name:  formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email,
      })

      // store order info and move to polling step
      setCurrentOrderId(data.order_id)
      setTotalAmount(data.total_amount)
      setStep(3)

    } catch (err) {
      const msg = err.response?.data?.error
             || err.response?.data?.detail
             || 'Payment initiation failed. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // called by PaymentPolling when MPesa confirms success
  const handlePaymentSuccess = useCallback((order) => {
    setConfirmedOrder(order)
    setStep(4)
  }, [])

  // called by PaymentPolling when MPesa reports failure
  const handlePaymentFailed = useCallback(() => {
    setStep(2)
    setError('Payment was cancelled or failed. Please try again.')
  }, [])

  // ── can proceed check ─────────────────────────────────────────────────
  const canProceedStep1 = !!selectedFixture
  const canProceedStep2 = formData.buyer_name.trim() && formData.buyer_phone.trim()

  return (
    <div className="min-h-screen bg-[#0a0f0a] pt-20 pb-16 px-4 relative overflow-hidden">

      {/* decorative background */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #16a34a 0px, #16a34a 1px, transparent 1px, transparent 60px)'
          }}
        />
        <div className="absolute top-0 right-0 w-[500px] h-[500px]
                        rounded-full bg-green-600/5 blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">

        {/* page header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-1 h-8 bg-green-500 rounded-full" />
            <h1 className="text-white text-4xl font-black uppercase tracking-tight">
              Tickets
            </h1>
            <div className="w-1 h-8 bg-green-500 rounded-full" />
          </div>
          <p className="text-gray-500 text-sm tracking-wide">
            Secure your seat · Pay with MPesa
          </p>
        </div>

        {/* not logged in warning */}
        {!user && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4
                          flex items-start gap-3">
            <span className="text-yellow-400 flex-shrink-0">⚠</span>
            <div>
              <p className="text-yellow-300 text-sm font-medium">Sign in required</p>
              <p className="text-yellow-400/60 text-xs mt-0.5">
                You need to{' '}
                <Link to="/login" className="underline hover:text-yellow-300">sign in</Link>
                {' '}before purchasing tickets.
              </p>
            </div>
          </div>
        )}

        {/* step indicator — hidden on confirmation step */}
        {step < 4 && <StepIndicator currentStep={step} />}

        {/* main card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-green-500" />

          <div className="p-6 md:p-8">

            {/* ── step 1: select fixture ── */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-green-500 rounded-full" />
                  <h2 className="text-white font-bold uppercase tracking-wide">
                    Select a Match
                  </h2>
                </div>
                <FixtureSelector
                  selectedFixture={selectedFixture}
                  onSelect={setSelectedFixture}
                />
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full mt-6 bg-green-600 hover:bg-green-500 disabled:opacity-40
                             disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                             uppercase tracking-widest text-sm transition-all active:scale-[0.98]"
                >
                  Continue →
                </button>
              </>
            )}

            {/* ── step 2: buyer details ── */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-green-500 rounded-full" />
                  <h2 className="text-white font-bold uppercase tracking-wide">
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
                  <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">⚠ {error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {/* back button */}
                  <button
                    onClick={() => { setStep(1); setError(null) }}
                    className="px-6 py-3 border border-white/10 hover:border-white/20
                               text-gray-400 text-sm rounded-lg transition-colors uppercase
                               tracking-widest"
                  >
                    ← Back
                  </button>

                  {/* pay button */}
                  <button
                    onClick={handlePayment}
                    disabled={!canProceedStep2 || submitting || !user}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-40
                               disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg
                               uppercase tracking-widest text-sm transition-all active:scale-[0.98]"
                  >
                    {submitting ? 'Sending to MPesa…' : 'Pay with MPesa →'}
                  </button>
                </div>
              </>
            )}

            {/* ── step 3: MPesa polling ── */}
            {step === 3 && currentOrderId && (
              <PaymentPolling
                orderId={currentOrderId}
                totalAmount={totalAmount}
                onSuccess={handlePaymentSuccess}
                onFailed={handlePaymentFailed}
              />
            )}

            {/* ── step 4: confirmed ── */}
            {step === 4 && confirmedOrder && (
              <TicketConfirmation order={confirmedOrder} />
            )}

          </div>
        </div>

        {/* back to fixtures link */}
        {step <= 2 && (
          <p className="text-center mt-6">
            <Link to="/fixtures"
                  className="text-gray-600 text-xs hover:text-gray-400 uppercase
                             tracking-widest transition-colors">
              ← Back to Fixtures
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}