import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { bidsApi, ApiBid, marketsApi, ApiMarket } from '../lib/api'

const bidTypes = [
  { value: 'all', label: 'All' },
  { value: 'single', label: 'Single' },
  { value: 'jodi', label: 'Jodi' },
  { value: 'pana', label: 'Pana' },
  { value: 'sangam', label: 'Sangam' },
]

export default function BetFilter() {
  const [apiMarkets, setApiMarkets] = useState<ApiMarket[]>([])
  const [bets, setBets] = useState<ApiBid[]>([])
  const [total, setTotal] = useState(0)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [marketId, setMarketId] = useState('')
  const [user, setUser] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [bidType, setBidType] = useState('all')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { marketsApi.list().then(setApiMarkets).catch(console.error) }, [])

  const loadBets = () => {
    bidsApi.list({
      date: startDate,
      marketId: marketId ? Number(marketId) : undefined,
      status: bidType !== 'all' ? bidType : undefined,
      page: currentPage,
      limit: pageSize,
    }).then(({ bids, total: t }) => { setBets(bids); setTotal(t) }).catch(console.error)
  }

  useEffect(() => { loadBets() }, [currentPage, pageSize])

  const filteredBets = bets.filter((bet) =>
    search ? Object.values({ ...bet, market: bet.market?.name, user: bet.user?.name, mobile: bet.user?.mobile })
      .some((v) => String(v).toLowerCase().includes(search.toLowerCase())) : true
  )

  const displayedBets = filteredBets
  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bet History</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Bet History</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="">All Markets</option>
                {apiMarkets.map((m: ApiMarket) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select User (Optional)</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Search for a user"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bid Type</label>
              <select
                value={bidType}
                onChange={(e) => setBidType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {bidTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setCurrentPage(1); loadBets() }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-700">
              <label>
                Show{' '}
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                  className="mx-1 px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={total}>All</option>
                </select>{' '}
                entries
              </label>
            </div>
            <div className="text-sm text-gray-700">
              <label>
                Search:{' '}
                <input
                  type="search"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </label>
            </div>
          </div>

          <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Date</th>
                <th className="px-4 py-2 border border-gray-300">Game Type</th>
                <th className="px-4 py-2 border border-gray-300">Market</th>
                <th className="px-4 py-2 border border-gray-300">Session</th>
                <th className="px-4 py-2 border border-gray-300">Game</th>
                <th className="px-4 py-2 border border-gray-300">Number</th>
                <th className="px-4 py-2 border border-gray-300">Amount</th>
                <th className="px-4 py-2 border border-gray-300">Status</th>
                <th className="px-4 py-2 border border-gray-300">User Name</th>
                <th className="px-4 py-2 border border-gray-300">Mobile</th>
                <th className="px-4 py-2 border border-gray-300">Created At</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedBets.length === 0 ? (
                <tr><td colSpan={12} className="px-4 py-4 text-center text-gray-500 border border-gray-300">No data found</td></tr>
              ) : displayedBets.map((bet) => (
                <tr key={bet.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">{bet.bidDate}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.gameType}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.market?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.session}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.gameType}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.number}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">{bet.status}</span>
                  </td>
                  <td className="px-4 py-2 border border-gray-300">{bet.user?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{bet.user?.mobile}</td>
                  <td className="px-4 py-2 border border-gray-300">{new Date(bet.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 border border-gray-300">—</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
