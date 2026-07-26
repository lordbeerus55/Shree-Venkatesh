import { useState, useEffect } from 'react'
import { marketsApi, ApiMarket, reportsApi } from '../lib/api'

const gameTypes = [
  { value: 'all', label: 'All' },
  { value: 'single', label: 'Single' },
  { value: 'jodi', label: 'Jodi' },
  { value: 'pana', label: 'Pana' },
]

const sortOptions = [
  { value: 'number', label: 'Sort By Number' },
  { value: 'amount', label: 'Sort By Amount' },
]

interface SellRow { gameType: string; count: number; totalAmount: number }

export default function SellReport() {
  const [apiMarkets, setApiMarkets] = useState<ApiMarket[]>([])
  const [reportData, setReportData] = useState<SellRow[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [marketId, setMarketId] = useState('')
  const [gameType, setGameType] = useState('')
  const [session, setSession] = useState('open')
  const [sortBy, setSortBy] = useState('number')
  const [showReport, setShowReport] = useState(false)

  useEffect(() => { marketsApi.list().then(setApiMarkets).catch(console.error) }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sell Report</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Sell Report</h3>
        </div>
        <div className="p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const data = await reportsApi.sellReport(date).catch((err) => { alert(err.message); return [] })
              setReportData(data ?? []); setShowReport(true)
            }}
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="" disabled>Select Market</option>
                {apiMarkets.map((m: ApiMarket) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="" disabled>Select Game</option>
                {gameTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="open">Open</option>
                <option value="close">Close</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Get Report
              </button>
            </div>
          </form>
        </div>

        {showReport && (
          <div className="p-4 border-t border-gray-200 overflow-x-auto">
            {reportData.length === 0 ? (
              <p className="text-sm text-gray-500">No data found.</p>
            ) : (
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100 font-semibold">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300">Game Type</th>
                    <th className="px-4 py-2 border border-gray-300">Count</th>
                    <th className="px-4 py-2 border border-gray-300">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border border-gray-300">{r.gameType}</td>
                      <td className="px-4 py-2 border border-gray-300">{r.count}</td>
                      <td className="px-4 py-2 border border-gray-300">{r.totalAmount.toFixed(2)}</td>
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
