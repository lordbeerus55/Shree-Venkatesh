import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import { usersApi, ApiUser } from '../lib/api'

type User = ApiUser

export default function AllUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState('credit')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', mobile: '', mpin: '' })
  const loadUsers = (page = 1) => {
    setLoading(true)
    usersApi.list({ page, limit: pageSize === -1 ? 1000 : pageSize })
      .then(({ users: u, total: t }) => { setUsers(u); setTotal(t) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers(currentPage) }, [currentPage, pageSize])

  const mockUsers = users

  const columns = [
    { key: 'id' as keyof User, header: 'ID', className: 'text-center' },
    { key: 'mobile' as keyof User, header: 'Mobile' },
    { key: 'name' as keyof User, header: 'Name' },
    { key: 'mpin' as keyof User, header: 'MPin' },
    { 
      key: 'walletBalance' as keyof User, 
      header: 'Wallet',
      render: (value: number, row: User) => (
        <span>
          {value}{' '}
          <button 
            onClick={(e) => { 
              e.stopPropagation()
              setSelectedUser(row)
              setAmount('')
              setTransactionType('credit')
              setModalOpen(true)
            }}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            <i className="fas fa-edit"></i>
          </button>
        </span>
      )
    },
    { key: 'createdAt' as keyof User, header: 'Registered on', render: (v: string) => new Date(v).toLocaleDateString() },
    { 
      key: 'isBanned' as keyof User, 
      header: 'Active',
      render: (value: boolean, row: User) => (
        <button 
          onClick={(e) => { e.stopPropagation(); usersApi.toggleBan(row.id).then(() => loadUsers(currentPage)).catch(console.error) }}
          className={`px-2 py-1 text-xs text-white rounded ${value ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {value ? 'Unblock' : 'Block'}
        </button>
      )
    },
    { 
      key: 'id' as keyof User, 
      id: 'action',
      header: 'Action',
      render: (_value: number, row: User) => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/users/${row.id}`) }}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          View
        </button>
      )
    },
  ]

  const totalPages = pageSize === -1 ? 1 : Math.ceil(total / pageSize)
  const displayedUsers = mockUsers

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
        <button 
          onClick={() => {
            setNewUser({ name: '', mobile: '', mpin: '' })
            setCreateModalOpen(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Create User
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading users…</div>
      ) : (
      <Table 
        columns={columns} 
        data={displayedUsers}
        getRowKey={(row) => row.id}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
      )}
      
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Create User</h4>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="number"
                  maxLength={10}
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MPIN (4-digit)</label>
                <input
                  type="text"
                  value={newUser.mpin}
                  onChange={(e) => setNewUser({ ...newUser, mpin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    usersApi.create({ name: newUser.name, mobile: newUser.mobile, mpin: newUser.mpin })
                      .then(() => { setCreateModalOpen(false); loadUsers(1) })
                      .catch((err) => alert(err.message))
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Add/Withdraw Points</h4>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <input type="hidden" value={selectedUser.id} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Points Here"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Debit/Credit</label>
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    if (!selectedUser) return
                    const fn = transactionType === 'credit' ? usersApi.addPoints : usersApi.withdrawPoints
                    fn(selectedUser.id, parseFloat(amount))
                      .then(() => { setModalOpen(false); loadUsers(currentPage) })
                      .catch((err) => alert(err.message))
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
                >
                  Submit
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
