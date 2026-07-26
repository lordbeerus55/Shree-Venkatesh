import { useState, useEffect } from 'react'
import { marketsApi, ApiMarket, bidsApi, ApiBid } from '../lib/api'

const gameTypes = [
  { value: 'all', label: 'All' },
  { value: 'single', label: 'Single' },
  { value: 'jodi', label: 'Jodi' },
  { value: 'pana', label: 'Pana' },
  { value: 'half_sangam', label: 'Half Sangam' },
  { value: 'full_sangam', label: 'Full Sangam' },
]

export default function OCLoss() {
  const [apiMarkets, setApiMarkets] = useState<ApiMarket[]>([])
  const [bids, setBids] = useState<ApiBid[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [marketId, setMarketId] = useState('')
  const [session, setSession] = useState('')
  const [gameType, setGameType] = useState('all')
  const [percent, setPercent] = useState('')
  const [results, setResults] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { marketsApi.list().then(setApiMarkets).catch(console.error) }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Loss Cutting</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">OC Group Combined</h3>
        </div>
        <div className="p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setLoading(true)
              const { bids: b } = await bidsApi.list({ date, marketId: marketId ? Number(marketId) : undefined }).catch(() => ({ bids: [] as ApiBid[], total: 0 }))
              setBids(b); setResults(true); setLoading(false)
            }}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
          >
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
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="" disabled>Select Session</option>
                <option value="open">Open</option>
                <option value="close">Close</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {gameTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percent</label>
              <input
                type="number"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <button type="submit" disabled={loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
                {loading ? 'Loading…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {results && (
          <div className="p-4 border-t border-gray-200 overflow-x-auto">
            {bids.length === 0 ? <p className="text-sm text-gray-500">No data found.</p> : (
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300">User</th>
                    <th className="px-4 py-2 border border-gray-300">Mobile</th>
                    <th className="px-4 py-2 border border-gray-300">Game Type</th>
                    <th className="px-4 py-2 border border-gray-300">Number</th>
                    <th className="px-4 py-2 border border-gray-300">Amount</th>
                    <th className="px-4 py-2 border border-gray-300">Session</th>
                    <th className="px-4 py-2 border border-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300">{b.user?.name}</td>
                      <td className="px-4 py-2 border border-gray-300">{b.user?.mobile}</td>
                      <td className="px-4 py-2 border border-gray-300">{b.gameType}</td>
                      <td className="px-4 py-2 border border-gray-300">{b.number}</td>
                      <td className="px-4 py-2 border border-gray-300">{b.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 border border-gray-300">{b.session}</td>
                      <td className="px-4 py-2 border border-gray-300">{b.status}</td>
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
