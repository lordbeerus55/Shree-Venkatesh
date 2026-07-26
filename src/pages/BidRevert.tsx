import { useMemo, useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { marketsApi, bidsApi, ApiMarket, ApiBid } from '../lib/api'

export default function BidRevert() {
  const [markets, setMarkets] = useState<ApiMarket[]>([])
  const [bets, setBets] = useState<ApiBid[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [marketFilter, setMarketFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => { marketsApi.list().then(setMarkets).catch(console.error) }, [])

  const loadBets = () => {
    const params: Parameters<typeof bidsApi.list>[0] = { date, status: 'pending' }
    if (marketFilter) params.marketId = Number(marketFilter)
    bidsApi.list(params)
      .then(({ bids }) => setBets(bids))
      .catch(console.error)
  }

  const handleRevertSelected = async () => {
    if (!selected.length || !confirm(`Revert ${selected.length} bet(s)?`)) return
    for (const id of selected) { await bidsApi.revert(id).catch(console.error) }
    setSelected([])
    loadBets()
  }

  const filteredBets = useMemo(() => {
    if (!search) return bets
    return bets.filter((bet) =>
      [bet.user?.name, bet.user?.mobile, bet.market?.name, bet.number]
        .some((v) => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
    )
  }, [bets, search])

  const totalPages = Math.ceil(filteredBets.length / pageSize)
  const displayedBets = filteredBets.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSelectAll = () => {
    if (selected.length === displayedBets.length) {
      setSelected([])
    } else {
      setSelected(displayedBets.map((b) => b.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid Revert</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded text-sm">
            <strong>Bet Revert</strong> - This page allows you to revert bets. Once bets are reverted, they will be deleted permanently and cannot be recovered. Any deleted bets amount will be credited back to user's wallet.
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="">All Markets</option>
                {markets.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select User (Optional)</label>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Search for a user"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => loadBets()}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setDate(new Date().toISOString().split('T')[0]); setMarketFilter(''); setUserFilter(''); setSearch(''); setBets([]) }}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {selected.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleRevertSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
              >
                Revert Selected Bets
              </button>
            </div>
          )}
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
                <th className="px-4 py-2 border border-gray-300">
                  <input
                    type="checkbox"
                    checked={displayedBets.length > 0 && selected.length === displayedBets.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-2 border border-gray-300">Date</th>
                <th className="px-4 py-2 border border-gray-300">User Name</th>
                <th className="px-4 py-2 border border-gray-300">Mobile</th>
                <th className="px-4 py-2 border border-gray-300">Market</th>
                <th className="px-4 py-2 border border-gray-300">Session</th>
                <th className="px-4 py-2 border border-gray-300">Game</th>
                <th className="px-4 py-2 border border-gray-300">Number</th>
                <th className="px-4 py-2 border border-gray-300">Amount</th>
                <th className="px-4 py-2 border border-gray-300">Created At</th>
              </tr>
            </thead>
            <tbody>
              {displayedBets.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 border border-gray-300 text-center text-gray-500" colSpan={10}>
                    No data available in table
                  </td>
                </tr>
              ) : (
                displayedBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selected.includes(bet.id)}
                        onChange={() => toggleSelect(bet.id)}
                      />
                    </td>
                    <td className="px-4 py-2 border border-gray-300">{new Date(bet.bidDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border border-gray-300">{bet.user?.name}</td>
                    <td className="px-4 py-2 border border-gray-300">{bet.user?.mobile}</td>
                    <td className="px-4 py-2 border border-gray-300">{bet.market?.name}</td>
                    <td className="px-4 py-2 border border-gray-300">{bet.session}</td>
                    <td className="px-4 py-2 border border-gray-300">{bet.gameType}</td>
                    <td className="px-4 py-2 border border-gray-300">{bet.number}</td>
                    <td className="px-4 py-2 border border-gray-300">{Number(bet.amount).toFixed(2)}</td>
                    <td className="px-4 py-2 border border-gray-300">{new Date(bet.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
