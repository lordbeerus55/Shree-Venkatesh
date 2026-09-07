import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCustomerAuth } from '../contexts/CustomerAuthContext'
import {
  CustomerBid,
  CustomerMarket,
  CustomerResult,
  MoneyRequest,
  WalletTransaction,
  customerApi,
  unwrapList,
} from '../lib/customerApi'

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
const cardClass = 'rounded-xl bg-white p-5 shadow-sm border border-slate-200'

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

function displayDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function currentBusinessDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

function resultText(result: CustomerResult) {
  if (result.result) return result.result
  const open = result.openPana || result.openResult
  const close = result.closePana || result.closeResult
  if (!open && !close) return 'Pending'
  return `${open || '---'}-${result.openDigit || '-'} | ${result.jodi || '--'} | ${result.closeDigit || '-'}-${close || '---'}`
}

export function CustomerLogin() {
  const { customer, login } = useCustomerAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [credential, setCredential] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (customer) return <Navigate to="/play" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(identifier.trim(), credential)
      navigate('/play')
    } catch (err) {
      setError(message(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Game Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in with your username or mobile number.</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="customer-identifier" className="mb-1 block text-sm font-medium">Username or mobile</label>
            <input id="customer-identifier" className={inputClass} value={identifier} onChange={(event) => setIdentifier(event.target.value)} required autoFocus autoComplete="username" />
          </div>
          <div>
            <label htmlFor="customer-credential" className="mb-1 block text-sm font-medium">Password or MPIN</label>
            <input id="customer-credential" className={inputClass} type="password" value={credential} onChange={(event) => setCredential(event.target.value)} required autoComplete="current-password" />
          </div>
          <button disabled={submitting} className="w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Signing in…' : 'Sign in to play'}
          </button>
        </form>
        <Link to="/play/register" className="mt-5 block text-center text-sm text-indigo-700 hover:underline">New customer? Create an account</Link>
        <Link to="/login" className="mt-3 block text-center text-sm text-indigo-700 hover:underline">Dashboard Login</Link>
      </div>
    </div>
  )
}

export function CustomerRegister() {
  const { customer, register } = useCustomerAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [mpin, setMpin] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (customer) return <Navigate to="/play" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({ name: name.trim(), mobile: mobile.trim(), mpin, username: username.trim().toLowerCase(), password })
      navigate('/play')
    } catch (err) {
      setError(message(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
        <p className="mt-1 text-sm text-slate-500">Register to start playing right away.</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <label htmlFor="register-name" className="mb-1 block text-sm font-medium">Full name</label>
            <input id="register-name" className={inputClass} value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required autoFocus />
          </div>
          <div>
            <label htmlFor="register-mobile" className="mb-1 block text-sm font-medium">Mobile number</label>
            <input id="register-mobile" className={inputClass} inputMode="numeric" value={mobile} onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))} pattern="\d{10}" title="10-digit mobile number" required />
          </div>
          <div>
            <label htmlFor="register-username" className="mb-1 block text-sm font-medium">Username</label>
            <input id="register-username" className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} pattern="[A-Za-z][A-Za-z0-9._-]{2,49}" title="Start with a letter; 3-50 characters: letters, digits, . _ -" required />
          </div>
          <div>
            <label htmlFor="register-mpin" className="mb-1 block text-sm font-medium">4-digit MPIN</label>
            <input id="register-mpin" className={inputClass} type="password" inputMode="numeric" value={mpin} onChange={(event) => setMpin(event.target.value.replace(/\D/g, '').slice(0, 4))} pattern="\d{4}" title="4-digit MPIN" required />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium">Password</label>
            <input id="register-password" className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} maxLength={128} title="At least 12 characters" required autoComplete="new-password" />
          </div>
          <button disabled={submitting} className="w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <Link to="/play/login" className="mt-5 block text-center text-sm text-indigo-700 hover:underline">Already have an account? Sign in</Link>
      </div>
    </div>
  )
}

export function CustomerHome() {
  const { customer, refreshCustomer } = useCustomerAuth()
  const [markets, setMarkets] = useState<CustomerMarket[]>([])
  const [results, setResults] = useState<CustomerResult[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([customerApi.markets(), customerApi.results(), refreshCustomer()])
      .then(([marketResponse, resultResponse]) => {
        setMarkets(unwrapList(marketResponse, 'markets').filter((market) => market.isActive))
        setResults(unwrapList(resultResponse, 'results'))
      })
      .catch((err) => setError(message(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-slate-500">Loading your games…</p>

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-700 p-6 text-white shadow-lg">
        <p className="text-sm text-indigo-100">Your balance</p>
        <p className="mt-1 text-4xl font-bold">₹{Number(customer?.walletBalance || 0).toFixed(2)}</p>
        <Link to="/play/wallet" className="mt-4 inline-block rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">Manage wallet</Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Active markets</h2><span className="text-sm text-slate-500">{markets.length} available</span></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <Link key={market.id} to={`/play/market/${market.id}`} className={`${cardClass} transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md`}>
              <div className="flex items-start justify-between gap-2"><h3 className="font-bold text-slate-900">{market.name}</h3><span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Available</span></div>
              <p className="mt-2 text-sm text-slate-500">{market.type || 'Market'} · Tap to place a bid</p>
            </Link>
          ))}
          {!markets.length && <p className="text-slate-500">No active markets are available.</p>}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Declared results</h2><Link to="/play/results" className="text-sm text-indigo-700 hover:underline">View all</Link></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.slice(0, 6).map((result) => (
            <div key={result.id} className={cardClass}>
              <p className="text-sm text-slate-500">{result.market?.name || result.marketName || 'Market'} · {displayDate(result.resultDate || result.date)}</p>
              <p className="mt-2 text-xl font-bold text-indigo-800">{resultText(result)}</p>
            </div>
          ))}
          {!results.length && <p className="text-slate-500">No results have been declared.</p>}
        </div>
      </section>
    </div>
  )
}

export function CustomerMarketPage() {
  const { id } = useParams<{ id: string }>()
  const { refreshCustomer } = useCustomerAuth()
  const [market, setMarket] = useState<CustomerMarket | null>(null)
  const [rates, setRates] = useState<Record<string, number>>({})
  const [bidDate, setBidDate] = useState(currentBusinessDate())
  const [session, setSession] = useState('open')
  const [gameType, setGameType] = useState('single')
  const [number, setNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const idempotency = useRef<{ key: string; payload: string } | null>(null)

  useEffect(() => {
    Promise.all([customerApi.markets(), customerApi.rates()])
      .then(([marketResponse, rateResponse]) => {
        const found = unwrapList(marketResponse, 'markets').find((item) => item.id === Number(id)) || null
        setMarket(found)
        const ratePayload = rateResponse as { rates?: Record<string, number> }
        setRates(ratePayload.rates && typeof ratePayload.rates === 'object' ? ratePayload.rates : rateResponse as Record<string, number>)
      })
      .catch((err) => setError(message(err)))
  }, [id])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const numericAmount = Number(amount)
    if (!market || !market.isActive) return setError('This market is not active.')
    if (!bidDate || !session || !gameType || !number.trim()) return setError('Complete all bid fields.')
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return setError('Amount must be greater than zero.')

    const payload = JSON.stringify({ marketId: market.id, bidDate, session, gameType, number: number.trim(), amount: numericAmount })
    if (!idempotency.current || idempotency.current.payload !== payload) {
      idempotency.current = { key: crypto.randomUUID(), payload }
    }
    setSubmitting(true)
    try {
      await customerApi.placeBid({ marketId: market.id, bidDate, session, gameType, number: number.trim(), amount: numericAmount, idempotencyKey: idempotency.current.key })
      const refreshed = await refreshCustomer()
      setSuccess(`Bid placed successfully. New balance: ₹${Number(refreshed.walletBalance).toFixed(2)}`)
      setNumber('')
      setAmount('')
      idempotency.current = null
    } catch (err) {
      setError(message(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!market && !error) return <p className="text-slate-500">Loading market…</p>

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className={`${cardClass} lg:col-span-2`}>
        <h2 className="text-2xl font-bold">{market?.name || 'Market unavailable'}</h2>
        <p className="mt-1 text-sm text-slate-500">Place a bid using your own customer wallet.</p>
        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</div>}
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="bid-date" className="mb-1 block text-sm font-medium">Bid date</label><input id="bid-date" type="date" className={inputClass} value={bidDate} onChange={(event) => setBidDate(event.target.value)} required /></div>
          <div><label htmlFor="bid-session" className="mb-1 block text-sm font-medium">Session</label><select id="bid-session" className={inputClass} value={session} onChange={(event) => setSession(event.target.value)}><option value="open" disabled={['jodi', 'half_sangam', 'full_sangam'].includes(gameType)}>Open</option><option value="close">Close</option></select></div>
          <div><label htmlFor="bid-game-type" className="mb-1 block text-sm font-medium">Game type</label><select id="bid-game-type" className={inputClass} value={gameType} onChange={(event) => { const next = event.target.value; setGameType(next); if (['jodi', 'half_sangam', 'full_sangam'].includes(next)) setSession('close') }}><option value="single">Single</option><option value="jodi">Jodi</option><option value="single_pana">Single Pana</option><option value="double_pana">Double Pana</option><option value="triple_pana">Triple Pana</option><option value="sp">SP</option><option value="dp">DP</option><option value="tp">TP</option><option value="fp">FP</option><option value="cp">CP</option><option value="half_sangam">Half Sangam</option><option value="full_sangam">Full Sangam</option></select></div>
          <div><label htmlFor="bid-number" className="mb-1 block text-sm font-medium">Number</label><input id="bid-number" className={inputClass} value={number} onChange={(event) => setNumber(event.target.value)} required maxLength={20} inputMode="numeric" /></div>
          <div className="sm:col-span-2"><label htmlFor="bid-amount" className="mb-1 block text-sm font-medium">Amount</label><input id="bid-amount" type="number" min="1" step="1" className={inputClass} value={amount} onChange={(event) => setAmount(event.target.value)} required /></div>
          <button disabled={submitting || !market?.isActive} className="sm:col-span-2 rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Placing bid…' : 'Place bid'}</button>
        </form>
      </section>
      <aside className={cardClass}>
        <h3 className="font-bold">Current rates</h3>
        <div className="mt-3 divide-y divide-slate-100">
          {Object.entries(rates).map(([name, rate]) => <div key={name} className="flex justify-between py-2 text-sm"><span className="capitalize text-slate-600">{name.replace(/([A-Z])/g, ' $1')}</span><strong>{rate}</strong></div>)}
          {!Object.keys(rates).length && <p className="text-sm text-slate-500">Rates unavailable.</p>}
        </div>
      </aside>
    </div>
  )
}

export function CustomerBids() {
  const [bids, setBids] = useState<CustomerBid[]>([])
  const [error, setError] = useState('')
  useEffect(() => { customerApi.bids().then((response) => setBids(unwrapList(response, 'bids'))).catch((err) => setError(message(err))) }, [])
  return <ListPage title="My bids" error={error}>{bids.map((bid) => <div key={bid.id} className={cardClass}><div className="flex justify-between gap-3"><div><h3 className="font-bold">{bid.market?.name || bid.marketName || 'Market'}</h3><p className="text-sm text-slate-500">{bid.gameType} · {bid.session} · {bid.number}</p></div><div className="text-right"><p className="font-bold">₹{bid.amount}</p><p className="text-xs uppercase text-slate-500">{bid.status}</p></div></div><p className="mt-3 text-xs text-slate-400">{displayDate(bid.bidDate || bid.createdAt)}</p></div>)}</ListPage>
}

export function CustomerResults() {
  const [results, setResults] = useState<CustomerResult[]>([])
  const [error, setError] = useState('')
  useEffect(() => { customerApi.results().then((response) => setResults(unwrapList(response, 'results'))).catch((err) => setError(message(err))) }, [])
  return <ListPage title="Results" error={error}>{results.map((result) => <div key={result.id} className={cardClass}><p className="text-sm text-slate-500">{result.market?.name || result.marketName || 'Market'}</p><p className="my-2 text-2xl font-bold text-indigo-800">{resultText(result)}</p><p className="text-xs text-slate-400">{displayDate(result.resultDate || result.date)}</p></div>)}</ListPage>
}

function ListPage({ title, error, children }: { title: string; error: string; children: React.ReactNode }) {
  const count = useMemo(() => Array.isArray(children) ? children.length : children ? 1 : 0, [children])
  return <div><h2 className="mb-4 text-2xl font-bold">{title}</h2>{error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}{!count && !error && <p className="text-slate-500">No records found.</p>}</div></div>
}

export function CustomerWallet() {
  const { customer, refreshCustomer } = useCustomerAuth()
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [deposits, setDeposits] = useState<MoneyRequest[]>([])
  const [withdrawals, setWithdrawals] = useState<MoneyRequest[]>([])
  const [depositAmount, setDepositAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [transactionRef, setTransactionRef] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [upiId, setUpiId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState<'deposit' | 'withdraw' | null>(null)
  const depositIdempotency = useRef<{ key: string; payload: string } | null>(null)
  const withdrawalIdempotency = useRef<{ key: string; payload: string } | null>(null)

  const load = async () => {
    const [walletResponse, depositResponse, withdrawalResponse] = await Promise.all([customerApi.wallet(), customerApi.deposits(), customerApi.withdrawals()])
    setTransactions(Array.isArray(walletResponse) ? walletResponse : walletResponse.transactions || [])
    setDeposits(unwrapList(depositResponse, 'requests'))
    setWithdrawals(unwrapList(withdrawalResponse, 'requests'))
    await refreshCustomer()
  }

  useEffect(() => { load().catch((err) => setError(message(err))) }, [])

  const submitDeposit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('')
    const amount = Number(depositAmount)
    if (!Number.isFinite(amount) || amount <= 0) return setError('Deposit amount must be greater than zero.')
    const payload = JSON.stringify({ amount, paymentMethod, transactionRef: transactionRef.trim() })
    if (!depositIdempotency.current || depositIdempotency.current.payload !== payload) {
      depositIdempotency.current = { key: crypto.randomUUID(), payload }
    }
    setSubmitting('deposit')
    try { await customerApi.createDeposit({ amount, paymentMethod, transactionRef: transactionRef.trim() || undefined, idempotencyKey: depositIdempotency.current.key }); depositIdempotency.current = null; setNotice('Deposit request submitted.'); setDepositAmount(''); setTransactionRef(''); await load() } catch (err) { setError(message(err)) } finally { setSubmitting(null) }
  }

  const submitWithdrawal = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('')
    const amount = Number(withdrawAmount)
    if (!Number.isFinite(amount) || amount <= 0) return setError('Withdrawal amount must be greater than zero.')
    if (!upiId.trim()) return setError('Enter a UPI ID for the withdrawal.')
    const payload = JSON.stringify({ amount, upiId: upiId.trim() })
    if (!withdrawalIdempotency.current || withdrawalIdempotency.current.payload !== payload) {
      withdrawalIdempotency.current = { key: crypto.randomUUID(), payload }
    }
    setSubmitting('withdraw')
    try { await customerApi.createWithdrawal({ amount, upiId: upiId.trim(), idempotencyKey: withdrawalIdempotency.current.key }); withdrawalIdempotency.current = null; setNotice('Withdrawal request submitted.'); setWithdrawAmount(''); setUpiId(''); await load() } catch (err) { setError(message(err)) } finally { setSubmitting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold">Wallet</h2><p className="text-sm text-slate-500">Your transactions and money requests</p></div><div className="text-right"><p className="text-3xl font-bold text-indigo-800">₹{Number(customer?.walletBalance || 0).toFixed(2)}</p><p className="text-sm text-slate-500">Reserved: ₹{Number(customer?.fundsReserved || 0).toFixed(2)}</p></div></div>
      {error && <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}{notice && <div className="rounded-lg bg-green-50 p-3 text-green-700">{notice}</div>}
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={submitDeposit} className={cardClass}><h3 className="text-lg font-bold">Request deposit</h3><div className="mt-4 space-y-3"><input type="number" min="1" className={inputClass} placeholder="Amount" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} required /><select className={inputClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option>UPI</option><option>Bank Transfer</option><option>Cash</option></select><input className={inputClass} placeholder="Transaction reference (optional)" value={transactionRef} onChange={(event) => setTransactionRef(event.target.value)} /><button disabled={submitting !== null} className="w-full rounded-lg bg-green-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{submitting === 'deposit' ? 'Submitting…' : 'Submit deposit request'}</button></div></form>
        <form onSubmit={submitWithdrawal} className={cardClass}><h3 className="text-lg font-bold">Request withdrawal</h3><div className="mt-4 space-y-3"><input type="number" min="1" className={inputClass} placeholder="Amount" value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} required /><input className={inputClass} placeholder="UPI ID" value={upiId} onChange={(event) => setUpiId(event.target.value)} required /><button disabled={submitting !== null} className="w-full rounded-lg bg-amber-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{submitting === 'withdraw' ? 'Submitting…' : 'Submit withdrawal request'}</button></div></form>
      </div>
      <History title="Wallet transactions" rows={transactions.map((item) => ({ id: item.id, primary: `${item.type} · ₹${item.amount}`, secondary: item.remark || 'Wallet transaction', date: item.createdAt || item.date, status: item.afterBalance === undefined ? undefined : `Balance ₹${item.afterBalance}` }))} />
      <div className="grid gap-6 lg:grid-cols-2"><History title="Deposit requests" rows={deposits.map((item) => ({ id: item.id, primary: `₹${item.amount}`, secondary: item.paymentMethod || 'Deposit', date: item.createdAt, status: item.status }))} /><History title="Withdrawal requests" rows={withdrawals.map((item) => ({ id: item.id, primary: `₹${item.amount}`, secondary: item.upiId || 'Withdrawal', date: item.createdAt, status: item.status }))} /></div>
    </div>
  )
}

function History({ title, rows }: { title: string; rows: Array<{ id: number; primary: string; secondary: string; date?: string; status?: string }> }) {
  return <section className={cardClass}><h3 className="font-bold">{title}</h3><div className="mt-3 divide-y divide-slate-100">{rows.map((row) => <div key={row.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{row.primary}</p><p className="text-xs text-slate-500">{row.secondary} · {displayDate(row.date)}</p></div>{row.status && <span className="text-xs font-semibold uppercase text-slate-500">{row.status}</span>}</div>)}{!rows.length && <p className="py-3 text-sm text-slate-500">No records found.</p>}</div></section>
}
