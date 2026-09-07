import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../contexts/CustomerAuthContext'

const links = [
  { to: '/play', label: 'Home', end: true },
  { to: '/play/bids', label: 'My Bids' },
  { to: '/play/results', label: 'Results' },
  { to: '/play/wallet', label: 'Wallet' },
]

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { customer, logout } = useCustomerAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-indigo-950 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Shree Venkatesh Games</h1>
            <p className="text-xs text-indigo-200">Welcome, {customer?.name || customer?.username || 'Player'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-800 px-3 py-1 text-sm font-semibold">₹{Number(customer?.walletBalance || 0).toFixed(2)}</span>
            <button
              onClick={() => { logout(); navigate('/play/login') }}
              className="rounded border border-indigo-400 px-3 py-1.5 text-sm hover:bg-indigo-900"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 ${isActive ? 'border-amber-400 text-amber-300' : 'border-transparent text-indigo-100 hover:text-white'}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-4 md:p-6">{children}</main>
    </div>
  )
}
