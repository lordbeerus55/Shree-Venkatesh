import { useState, useEffect, useMemo } from 'react'
import Pagination from '../components/Pagination'
import { bidsApi, ApiBid } from '../lib/api'

const bidTypes = [
  { value: 'all', label: 'All' },
  { value: 'single', label: 'Single' },
  { value: 'jodi', label: 'Jodi' },
  { value: 'pana', label: 'Pana' },
  { value: 'sangam', label: 'Sangam' },
]

export default function WinnerHistory() {
  const [winnings, setWinnings] = useState<ApiBid[]>([])
  const [total, setTotal] = useState(0)
  const [bidType, setBidType] = useState('all')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    bidsApi.list({ status: 'won', page: currentPage, limit: pageSize })
      .then(({ bids, total: t }) => { setWinnings(bids); setTotal(t) })
      .catch(console.error)
  }, [currentPage, pageSize])

  const filtered = useMemo(() => {
    let data = bidType !== 'all' ? winnings.filter((w) => w.gameType === bidType) : winnings
    if (search) data = data.filter((w) =>
      [w.user?.mobile, w.user?.name, w.gameType, w.market?.name, w.number]
        .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    )
    return data
  }, [bidType, search, winnings])

  const totalPages = Math.ceil(total / pageSize) || 1
  const displayed = filtered

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Winning History</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Winning History</h3>
          <div>
            <select
              value={bidType}
              onChange={(e) => { setBidType(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {bidTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
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
                  <option value={filtered.length}>All</option>
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
                <th className="px-4 py-2 border border-gray-300 text-center">ID</th>
                <th className="px-4 py-2 border border-gray-300">Mobile Number</th>
                <th className="px-4 py-2 border border-gray-300">User name</th>
                <th className="px-4 py-2 border border-gray-300">Game Type</th>
                <th className="px-4 py-2 border border-gray-300">Market</th>
                <th className="px-4 py-2 border border-gray-300">Session</th>
                <th className="px-4 py-2 border border-gray-300">Digits</th>
                <th className="px-4 py-2 border border-gray-300">Amount</th>
                <th className="px-4 py-2 border border-gray-300">Winning Amount</th>
                <th className="px-4 py-2 border border-gray-300">Game Name</th>
                <th className="px-4 py-2 border border-gray-300">Placed on</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-4 text-center text-gray-500 border border-gray-300">No data</td></tr>
              ) : displayed.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300 text-center">{row.id}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.user?.mobile}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.user?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.gameType}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.market?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.session}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.number}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-300">—</td>
                  <td className="px-4 py-2 border border-gray-300">{row.gameType}</td>
                  <td className="px-4 py-2 border border-gray-300">{new Date(row.createdAt).toLocaleDateString()}</td>
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
