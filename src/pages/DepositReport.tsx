import { useState, useEffect, useMemo } from 'react'
import Pagination from '../components/Pagination'
import { depositsApi, ApiDeposit } from '../lib/api'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const ranges: Record<string, { start: string; end: string }> = {
  Today: { start: formatDate(new Date()), end: formatDate(new Date()) },
  Yesterday: { start: formatDate(new Date(Date.now() - 86400000)), end: formatDate(new Date(Date.now() - 86400000)) },
  'Last 7 Days': { start: formatDate(new Date(Date.now() - 7 * 86400000)), end: formatDate(new Date()) },
  'Last 30 Days': { start: formatDate(new Date(Date.now() - 30 * 86400000)), end: formatDate(new Date()) },
  'This Month': { start: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end: formatDate(new Date()) },
  'Last Month': {
    start: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
    end: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0))
  }
}

export default function DepositReport() {
  const [deposits, setDeposits] = useState<ApiDeposit[]>([])
  const [total, setTotal] = useState(0)
  const [startDate, setStartDate] = useState(formatDate(new Date()))
  const [endDate, setEndDate] = useState(formatDate(new Date()))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const load = () =>
    depositsApi.list({ startDate, endDate, page: currentPage, limit: pageSize })
      .then(({ requests, total: t }) => { setDeposits(requests); setTotal(t) })
      .catch(console.error)

  useEffect(() => { load() }, [currentPage, pageSize])

  const applyRange = (label: string) => {
    if (label === 'Custom Range') return
    const range = ranges[label]
    if (range) { setStartDate(range.start); setEndDate(range.end); setPickerOpen(false) }
  }

  const filteredData = useMemo(() =>
    deposits.filter((row) =>
      !search || [row.user?.mobile, row.user?.name, row.paymentMethod, String(row.amount), row.status]
        .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    ), [deposits, search])

  const totalAmount = filteredData.reduce((sum, row) => sum + row.amount, 0)
  const totalTransactions = total

  const summaryByType = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {}
    filteredData.forEach((row) => {
      const key = row.paymentMethod || 'Unknown'
      if (!map[key]) map[key] = { amount: 0, count: 0 }
      map[key].amount += row.amount
      map[key].count += 1
    })
    return map
  }, [filteredData])

  const totalPages = Math.ceil(total / pageSize) || 1
  const displayedData = filteredData

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deposit Transactions</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Deposit Summary</h3>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={`${startDate} - ${endDate}`}
                onClick={() => setPickerOpen(!pickerOpen)}
                placeholder="Select date range"
                className="px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer w-60"
              />
              {pickerOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range'].map((label) => (
                      <li key={label}>
                        <button
                          onClick={() => applyRange(label)}
                          className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-100 text-gray-700"
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => setPickerOpen(false)} className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
                    <button onClick={() => setPickerOpen(false)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="mb-4">
            <div className="bg-blue-600 text-white rounded-lg p-4">
              <h5 className="text-sm font-medium">Total Deposits</h5>
              <h3 className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</h3>
              <small>Total Transactions: {totalTransactions}</small>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(summaryByType).map(([type, { amount, count }]) => (
              <div key={type} className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700">{type.toUpperCase()}</h5>
                <h4 className="text-xl font-bold text-gray-900">₹{amount.toFixed(2)}</h4>
                <small className="text-gray-500">Transactions: {count}</small>
              </div>
            ))}
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
                <th className="px-4 py-2 border border-gray-300">ID</th>
                <th className="px-4 py-2 border border-gray-300">Mobile</th>
                <th className="px-4 py-2 border border-gray-300">Username</th>
                <th className="px-4 py-2 border border-gray-300">Amount</th>
                <th className="px-4 py-2 border border-gray-300">Deposit Type</th>
                <th className="px-4 py-2 border border-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-500 border border-gray-300">No data</td></tr>
              ) : displayedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">{row.id}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.user?.mobile}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.user?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border border-gray-300">{row.paymentMethod}</td>
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
