import { useState, useEffect, useMemo } from 'react'
import Pagination from '../components/Pagination'
import { depositsApi, ApiDeposit } from '../lib/api'

const today = new Date().toISOString().split('T')[0]

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function DepositRequests() {
  const [requests, setRequests] = useState<ApiDeposit[]>([])
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const load = () => {
    depositsApi.list({ status: statusFilter, startDate, endDate, page: currentPage, limit: pageSize })
      .then(({ requests: r }) => setRequests(r))
      .catch(console.error)
  }

  useEffect(() => { load() }, [statusFilter, startDate, endDate, currentPage, pageSize])

  const handleApprove = (id: number) => depositsApi.approve(id).then(load).catch((e) => alert(e.message))
  const handleReject = (id: number) => depositsApi.reject(id).then(load).catch((e) => alert(e.message))

  const filtered = useMemo(() => {
    if (!search) return requests
    return requests.filter((r) =>
      [r.user?.name, r.user?.mobile, r.paymentMethod, r.transactionRef, r.status]
        .some((v) => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
    )
  }, [requests, search])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deposit Requests</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Deposit Requests</h3>
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
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
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
                <th className="px-4 py-2 border border-gray-300">Amount</th>
                <th className="px-4 py-2 border border-gray-300">Deposit Mode</th>
                <th className="px-4 py-2 border border-gray-300">Transaction ID</th>
                <th className="px-4 py-2 border border-gray-300">Image</th>
                <th className="px-4 py-2 border border-gray-300">Note</th>
                <th className="px-4 py-2 border border-gray-300">Status</th>
                <th className="px-4 py-2 border border-gray-300">Date</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? (
                displayed.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 text-center">{r.id}</td>
                    <td className="px-4 py-2 border border-gray-300">{r.user?.mobile}</td>
                    <td className="px-4 py-2 border border-gray-300">{r.user?.name}</td>
                    <td className="px-4 py-2 border border-gray-300">{Number(r.amount).toFixed(2)}</td>
                    <td className="px-4 py-2 border border-gray-300">{r.paymentMethod}</td>
                    <td className="px-4 py-2 border border-gray-300">{r.transactionRef}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      {r.proofImageUrl ? <a href={r.proofImageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">View</a> : '—'}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">{r.adminRemark || '—'}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <span className={`px-1 py-0.5 text-xs rounded ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border border-gray-300 space-x-1">
                      {r.status === 'pending' && <>
                        <button onClick={() => handleApprove(r.id)} className="px-2 py-1 text-xs text-white bg-green-600 rounded">Approve</button>
                        <button onClick={() => handleReject(r.id)} className="px-2 py-1 text-xs text-white bg-red-600 rounded">Reject</button>
                      </>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-4 text-center text-gray-600 border border-gray-300">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
