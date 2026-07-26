import { useState, useEffect, useMemo } from 'react'
import Pagination from '../components/Pagination'
import { walletApi } from '../lib/api'

interface WalletTx {
  id: number
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  remark: string
  createdAt: string
  user?: { mobile: string; name: string }
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<WalletTx[]>([])
  const [total, setTotal] = useState(0)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    walletApi.list({ type: typeFilter !== 'all' ? typeFilter : undefined, page: currentPage })
      .then(({ transactions: txs, total: t }) => { setTransactions(txs as WalletTx[]); setTotal(t) })
      .catch(console.error)
  }, [typeFilter, currentPage])

  const filtered = useMemo(() =>
    transactions.filter((t) =>
      !search || [t.user?.mobile, t.remark, String(t.amount)]
        .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
    ), [transactions, search])

  const totalPages = Math.ceil(total / pageSize) || 1
  const displayed = filtered

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
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
                <th className="px-4 py-2 border border-gray-300">Remark</th>
                <th className="px-4 py-2 border border-gray-300">Before Wallet</th>
                <th className="px-4 py-2 border border-gray-300">Amount</th>
                <th className="px-4 py-2 border border-gray-300">After Wallet</th>
                <th className="px-4 py-2 border border-gray-300">Type</th>
                <th className="px-4 py-2 border border-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-4 text-center text-gray-500 border border-gray-300">No data</td></tr>
              ) : displayed.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300 text-center">{t.id}</td>
                  <td className="px-4 py-2 border border-gray-300">{t.user?.mobile}</td>
                  <td className="px-4 py-2 border border-gray-300">{t.remark}</td>
                  <td className="px-4 py-2 border border-gray-300">{t.balanceBefore?.toFixed(2) ?? '—'}</td>
                  <td className="px-4 py-2 border border-gray-300">{t.amount}</td>
                  <td className="px-4 py-2 border border-gray-300">{t.balanceAfter?.toFixed(2) ?? '—'}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    <span className={`px-2 py-1 text-xs rounded ${t.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t.type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border border-gray-300">{new Date(t.createdAt).toLocaleDateString()}</td>
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
