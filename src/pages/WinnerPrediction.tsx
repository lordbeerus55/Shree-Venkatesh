import { useMemo, useState, useEffect } from 'react'
import panasData from '../fixtures/panas.json'
import { marketsApi, ApiMarket, bidsApi, ApiBid } from '../lib/api'

const panas: string[] = panasData as string[]

function calculateDigit(pana: string): string {
  if (!pana || pana.length !== 3) return ''
  const sum = pana.split('').reduce((acc, d) => acc + Number(d), 0)
  return String(sum % 10)
}

export default function WinnerPrediction() {
  const [apiMarkets, setApiMarkets] = useState<ApiMarket[]>([])
  const [winners, setWinners] = useState<ApiBid[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [marketId, setMarketId] = useState('')
  const [session, setSession] = useState('')
  const [openPana, setOpenPana] = useState('')
  const [closePana, setClosePana] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)

  const openDigit = useMemo(() => calculateDigit(openPana), [openPana])
  const closeDigit = useMemo(() => calculateDigit(closePana), [closePana])

  useEffect(() => { marketsApi.list().then(setApiMarkets).catch(console.error) }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Winner Prediction</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Winner Prediction</h3>
        </div>
        <div className="p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setLoading(true)
              const { bids } = await bidsApi.list({ date, marketId: marketId ? Number(marketId) : undefined, status: 'won' }).catch(() => ({ bids: [] as ApiBid[], total: 0 }))
              setWinners(bids); setShowResults(true); setLoading(false)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
                <select
                  value={marketId}
                  onChange={(e) => setMarketId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="" disabled>Select Game</option>
                  {apiMarkets.map((m: ApiMarket) => (
                    <option key={m.id} value={String(m.id)}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="" disabled>Select Session</option>
                  <option value="open">Open</option>
                  <option value="close">Close</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Pana</label>
                <select
                  value={openPana}
                  onChange={(e) => setOpenPana(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="" disabled>Select Pana</option>
                  {panas.map((p) => (
                    <option key={`open-${p}`} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Digit</label>
                <input
                  type="number"
                  value={openDigit}
                  readOnly
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Close Pana</label>
                <select
                  value={closePana}
                  onChange={(e) => setClosePana(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="" disabled>Select Pana</option>
                  {panas.map((p) => (
                    <option key={`close-${p}`} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Close Digit</label>
                <input
                  type="number"
                  value={closeDigit}
                  readOnly
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
                />
              </div>
            </div>
            <div>
              <button type="submit" disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
                {loading ? 'Loading…' : 'SHOW WINNERS'}
              </button>
            </div>
          </form>
        </div>

        {showResults && (
          <div className="p-4 border-t border-gray-200 overflow-x-auto">
            {winners.length === 0 ? (
              <p className="text-sm text-gray-500">No winners found.</p>
            ) : (
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300">User</th>
                    <th className="px-4 py-2 border border-gray-300">Mobile</th>
                    <th className="px-4 py-2 border border-gray-300">Game Type</th>
                    <th className="px-4 py-2 border border-gray-300">Number</th>
                    <th className="px-4 py-2 border border-gray-300">Bid Amount</th>
                    <th className="px-4 py-2 border border-gray-300">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300">{w.user?.name}</td>
                      <td className="px-4 py-2 border border-gray-300">{w.user?.mobile}</td>
                      <td className="px-4 py-2 border border-gray-300">{w.gameType}</td>
                      <td className="px-4 py-2 border border-gray-300">{w.number}</td>
                      <td className="px-4 py-2 border border-gray-300">{w.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 border border-gray-300">{w.session}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
