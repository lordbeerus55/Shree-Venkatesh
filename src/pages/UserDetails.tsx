import { useParams, useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import { useState, useEffect } from 'react'
import { usersApi } from '../lib/api'

interface User { id: number; mobile: string; name: string; mpin: string; walletBalance: number; createdAt: string; isBanned: boolean }

export default function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [pointsAmount, setPointsAmount] = useState('')

  useEffect(() => {
    if (id) usersApi.get(Number(id)).then((u) => setUser(u as User)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-gray-500">Loading…</div>
  if (!user) return <div className="p-6 text-gray-600">User not found</div>

  const handleAddPoints = () => {
    usersApi.addPoints(user.id, Number(pointsAmount))
      .then(() => { usersApi.get(user.id).then((u) => setUser(u as User)); setAddModalOpen(false) })
      .catch((e) => alert(e.message))
  }

  const handleWithdrawPoints = () => {
    usersApi.withdrawPoints(user.id, Number(pointsAmount))
      .then(() => { usersApi.get(user.id).then((u) => setUser(u as User)); setWithdrawModalOpen(false) })
      .catch((e) => alert(e.message))
  }

  const withdrawColumns = [
    { key: 'id' as keyof any, header: 'ID', className: 'text-center' },
    { key: 'mobile' as keyof any, header: 'Mobile' },
    { key: 'name' as keyof any, header: 'Name' },
    { key: 'amount' as keyof any, header: 'Amount' },
    { key: 'status' as keyof any, header: 'Status' },
    { key: 'createdAt' as keyof any, header: 'Created at' },
    { key: 'id' as keyof any, id: 'action', header: 'Action', render: () => <button className="px-3 py-1 text-xs text-white bg-blue-600 rounded">View</button> },
  ]

  const bidColumns = [
    { key: 'id' as keyof any, header: 'ID', className: 'text-center' },
    { key: 'mobile' as keyof any, header: 'Mobile Number' },
    { key: 'name' as keyof any, header: 'User name' },
    { key: 'gameType' as keyof any, header: 'Game Type' },
    { key: 'market' as keyof any, header: 'Market' },
    { key: 'session' as keyof any, header: 'Session' },
    { key: 'amount' as keyof any, header: 'Amount' },
    { key: 'digits' as keyof any, header: 'Digits' },
    { key: 'gameName' as keyof any, header: 'Game Name' },
    { key: 'status' as keyof any, header: 'Game Status' },
    { key: 'placedOn' as keyof any, header: 'Placed on' },
  ]

  const transactionColumns = [
    { key: 'id' as keyof any, header: 'ID', className: 'text-center' },
    { key: 'mobile' as keyof any, header: 'Mobile Number' },
    { key: 'name' as keyof any, header: 'User name' },
    { key: 'amount' as keyof any, header: 'Amount' },
    { key: 'type' as keyof any, header: 'Type' },
    { key: 'remark' as keyof any, header: 'Remark' },
    { key: 'beforeWallet' as keyof any, header: 'Before Wallet' },
    { key: 'afterWallet' as keyof any, header: 'After Wallet' },
    { key: 'date' as keyof any, header: 'Date' },
  ]

  const withdrawData: any[] = []
  const bidData: any[] = []
  const transactionData: any[] = []

  const totalPages = pageSize === -1 ? 1 : Math.ceil(bidData.length / pageSize)
  const displayedBidData = pageSize === -1 ? bidData : bidData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/all-users')}
        className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        <i className="fas fa-arrow-left mr-1"></i> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-gray-800">Personal Information</h5>
              <div className="space-x-2">
                <a href={`https://api.whatsapp.com/send?phone=91${user.mobile}`} target="_blank" rel="noreferrer" className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition">
                  WhatsApp
                </a>
                <a href={`tel:+91${user.mobile}`} className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 transition">
                  Call
                </a>
              </div>
            </div>
          </div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Full Name</th><td className="px-4 py-2">{user.name}</td></tr>
              <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Email</th><td className="px-4 py-2"></td></tr>
              <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Password</th><td className="px-4 py-2">123456</td></tr>
              <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Mobile Number</th><td className="px-4 py-2">{user.mobile}</td></tr>
              <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Registration Date</th><td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td></tr>
              <tr><th className="px-4 py-2 text-left bg-gray-50">User Status</th><td className="px-4 py-2 text-center">{!user.isBanned ? <span className="px-2 py-1 text-xs text-white bg-green-600 rounded">Active</span> : <span className="px-2 py-1 text-xs text-white bg-red-600 rounded">Banned</span>}</td></tr>
            </tbody>
          </table>

          <div className="p-4 text-center border-t border-gray-200">
            <h2 className="text-gray-500">Wallet Balance</h2>
            <h3 className="text-2xl font-bold">
              <span>{user.walletBalance}₹</span>
              <b className="text-green-600 text-sm ml-1">Points</b>
            </h3>
            <div className="flex justify-center gap-2 mt-3">
              <button onClick={() => { setPointsAmount(''); setAddModalOpen(true) }} className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition">Add Points</button>
              <button onClick={() => { setPointsAmount(''); setWithdrawModalOpen(true) }} className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 transition">Withdraw Points</button>
              
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h5 className="font-semibold text-gray-800">Payment Information</h5>
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Account Holder Name</th><td className="px-4 py-2">N/A</td></tr>
                <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Account Number</th><td className="px-4 py-2">N/A</td></tr>
                <tr><th className="px-4 py-2 text-left bg-gray-50">IFSC Code</th><td className="px-4 py-2">N/A</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h5 className="font-semibold text-gray-800">Deposit/Withdraw Total</h5>
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-gray-200"><th className="px-4 py-2 text-left bg-gray-50">Total Deposit</th><td className="px-4 py-2">1500</td></tr>
                <tr><th className="px-4 py-2 text-left bg-gray-50">Total Withdraw</th><td className="px-4 py-2">0</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h5 className="font-semibold text-gray-800">Withdraw Points Requests</h5>
          <select className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="successful">Completed</option>
            <option value="cancelled">Rejected</option>
          </select>
        </div>
        <div className="p-4">
          <Table columns={withdrawColumns} data={withdrawData} pageSize={10} onPageSizeChange={setPageSize} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h5 className="font-semibold text-gray-800">Bid History</h5>
          <select className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option value="all">All</option>
            <option value="main">Main Matka</option>
            <option value="starline">Starline</option>
            <option value="jackpot">Jackpot</option>
          </select>
        </div>
        <div className="p-4">
          <Table columns={bidColumns} data={displayedBidData} pageSize={pageSize} onPageSizeChange={setPageSize} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h5 className="font-semibold text-gray-800">Transaction History</h5>
          <select className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option value="all">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div className="p-4">
          <Table columns={transactionColumns} data={transactionData} pageSize={10} onPageSizeChange={setPageSize} />
        </div>
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Add Points</h4>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Points</label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Points Here"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleAddPoints}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
                >
                  Submit
                </button>
                <button onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Withdraw Points</h4>
              <button onClick={() => setWithdrawModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Withdraw Points</label>
                <input
                  type="number"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Points Here"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleWithdrawPoints}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
                >
                  Submit
                </button>
                <button onClick={() => setWithdrawModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
