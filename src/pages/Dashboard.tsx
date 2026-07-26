import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { reportsApi } from '../lib/api'

interface Stats { adminWallet: number; totalUsers: number; bannedUsers: number; todayBetAmount: number; todayWinAmount: number; todayProfit: number; todayDeposit: number; todayWithdrawComplete: number; todayAdminDeposit: number; todayAdminWithdraw: number; totalWalletBalance: number }

const STAT_MAP = (s: Stats) => [
  { label: 'Your wallet', value: s.adminWallet.toFixed(2), link: '/transaction-history' },
  { label: 'Total Users', value: String(s.totalUsers), link: '/users' },
  { label: 'Today Bet Amount', value: s.todayBetAmount.toFixed(2), link: '/system-reports/market-report' },
  { label: 'Today Profit', value: s.todayProfit.toFixed(2), link: '/system-reports/market-report' },
  { label: 'Today Withdraw Complete', value: s.todayWithdrawComplete.toFixed(2), link: '/withdraw-requests' },
  { label: 'Today Deposit', value: s.todayDeposit.toFixed(2), link: '/deposit-report' },
  { label: 'Today Winning Amount', value: s.todayWinAmount.toFixed(2), link: '/system-reports/market-report' },
  { label: 'Total Wallet Balance', value: s.totalWalletBalance.toFixed(2), link: '/users' },
  { label: 'Banned Users', value: String(s.bannedUsers), link: '/users' },
  { label: 'Today Admin Deposit', value: s.todayAdminDeposit.toFixed(2), link: '/deposit-report' },
  { label: 'Today Admin Withdraw', value: s.todayAdminWithdraw.toFixed(2), link: '/transaction-history' },
]

export default function Dashboard() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = (d: string) => {
    setLoading(true)
    reportsApi.dashboard(d)
      .then((data) => setStats(data as unknown as Stats))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadStats(date) }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    loadStats(date)
  }

  const statItems = stats ? STAT_MAP(stats) : []

  return (
    <div>
      <div className="mb-2">
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                FILTER DATA
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat, index) => (
            <div key={index} className="rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="bg-white p-5 text-center">
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600 mt-1">{stat.label}</p>
              </div>
              <Link
                to={stat.link}
                className="block py-3 text-center text-sm text-white hover:opacity-90 transition"
                style={{ background: 'linear-gradient(to right, #1e40af, #991b1b)' }}
              >
                More info <i className="fas fa-arrow-circle-right ml-1"></i>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
