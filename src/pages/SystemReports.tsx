import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { reportsApi } from '../lib/api'

interface MarketTransaction { market: string; bidAmount: number; winAmount: number; profitLoss: number }

export default function SystemReports() {
  const [marketData, setMarketData] = useState<MarketTransaction[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const loadData = () =>
    reportsApi.marketTransactions(startDate).then(setMarketData).catch(console.error)

  useEffect(() => { loadData() }, [])

  const filteredData = marketData.filter(row =>
    Object.values(row).some(value => String(value).toLowerCase().includes(search.toLowerCase()))
  )

  const totalBid = filteredData.reduce((sum, row) => sum + row.bidAmount, 0)
  const totalWin = filteredData.reduce((sum, row) => sum + row.winAmount, 0)
  const totalProfitLoss = filteredData.reduce((sum, row) => sum + row.profitLoss, 0)

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredData.length / pageSize)
  const displayedData = pageSize === -1 ? filteredData : filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Reports</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Market Winning/Bidding Transactions</h3>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Filter
            </button>
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
                <th className="px-4 py-2 border border-gray-300">Sr No</th>
                <th className="px-4 py-2 border border-gray-300">Market</th>
                <th className="px-4 py-2 border border-gray-300">Bid Amount</th>
                <th className="px-4 py-2 border border-gray-300">Win Amount</th>
                <th className="px-4 py-2 border border-gray-300">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">{i + 1}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.market}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.bidAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.winAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <span className={row.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {row.profitLoss.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

          <table className="w-full text-sm text-left border-collapse border border-gray-300 mt-4">
            <tbody>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-4 py-2 border border-gray-300" colSpan={2}>Total</td>
                <td className="px-4 py-2 border border-gray-300">{totalBid.toFixed(2)}</td>
                <td className="px-4 py-2 border border-gray-300">{totalWin.toFixed(2)}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <span className={totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {totalProfitLoss.toFixed(2)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
