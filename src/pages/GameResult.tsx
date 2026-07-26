import { useMemo, useState, useEffect } from 'react'
import panasData from '../fixtures/panas.json'
import { marketsApi, resultsApi, ApiMarket } from '../lib/api'

const panas: string[] = panasData as string[]

function calculateDigit(pana: string): string {
  if (!pana || pana.length !== 3) return ''
  const sum = pana.split('').reduce((acc, d) => acc + Number(d), 0)
  return String(sum % 10)
}

interface ResultRow {
  id: number
  resultDate: string
  openPana: string | null
  closePana: string | null
  market: { name: string }
}

export default function GameResult() {
  const [apiMarkets, setApiMarkets] = useState<ApiMarket[]>([])
  const [results, setResults] = useState<ResultRow[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [marketId, setMarketId] = useState('')
  const [session, setSession] = useState('')
  const [pana, setPana] = useState('')
  const [showActions, setShowActions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const digit = useMemo(() => calculateDigit(pana), [pana])

  useEffect(() => {
    marketsApi.list().then(setApiMarkets).catch(console.error)
  }, [])

  const loadResults = () => {
    resultsApi.list({ date })
      .then(({ results: r }) => setResults(r as ResultRow[]))
      .catch(console.error)
  }

  useEffect(() => { loadResults() }, [date])

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!marketId || !pana) { alert('Select market and pana'); return }
    setSubmitting(true); setMsg('')
    try {
      const payload = session === 'open'
        ? { marketId: Number(marketId), resultDate: date, openPana: pana }
        : { marketId: Number(marketId), resultDate: date, closePana: pana }
      await resultsApi.declare(payload)
      setMsg('Result declared successfully')
      setShowActions(false); setPana(''); setSession('')
      loadResults()
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setSubmitting(false) }
  }

  const openDigit = (p: string | null) => p && p.length === 3 ? String(p.split('').reduce((a, d) => a + Number(d), 0) % 10) : ''

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Game Result</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Declare Result</h3>
        </div>
        <div className="p-4">
          {msg && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form onSubmit={handleDeclare} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
                <select value={marketId} onChange={(e) => setMarketId(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="" disabled>Select Game</option>
                  {apiMarkets.map((m: ApiMarket) => (
                    <option key={m.id} value={String(m.id)}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select value={session} onChange={(e) => setSession(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="" disabled>Select Session</option>
                  <option value="open">Open</option>
                  <option value="close">Close</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pana</label>
                <select value={pana} onChange={(e) => setPana(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                  <option value="" disabled>Select Pana</option>
                  {panas.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Digit</label>
                <input type="number" value={digit} readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100" />
              </div>
            </div>
            <div>
              {!showActions ? (
                <button type="button" onClick={() => setShowActions(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition">
                  SAVE
                </button>
              ) : (
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
                    {submitting ? 'Declaring…' : 'DECLARE RESULT'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Results for {date}</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border border-gray-300">#</th>
                <th className="px-4 py-2 border border-gray-300">Game Name</th>
                <th className="px-4 py-2 border border-gray-300">Result Date</th>
                <th className="px-4 py-2 border border-gray-300">Open Pana</th>
                <th className="px-4 py-2 border border-gray-300">Close Pana</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500 border border-gray-300">No results found</td></tr>
              ) : results.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">{row.id}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.market?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.resultDate}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    {row.openPana ? `${row.openPana}-${openDigit(row.openPana)}` : '—'}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {row.closePana ? `${row.closePana}-${openDigit(row.closePana)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
