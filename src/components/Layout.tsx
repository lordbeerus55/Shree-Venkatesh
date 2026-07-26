import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const [systemReportsOpen, setSystemReportsOpen] = useState(false)
  const [gameManagementOpen, setGameManagementOpen] = useState(false)
  const [bookieCornerOpen, setBookieCornerOpen] = useState(false)
  const [reportManagementOpen, setReportManagementOpen] = useState(false)
  const [walletManagementOpen, setWalletManagementOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [noticeManagementOpen, setNoticeManagementOpen] = useState(false)
  const [mainStarlineOpen, setMainStarlineOpen] = useState(false)
  const [mainJackpotOpen, setMainJackpotOpen] = useState(false)
  
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 overflow-y-auto">
        {/* Brand Logo */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">Shree Venkatesh</h1>
          {admin && <p className="text-xs text-gray-500 mt-0.5">{admin.username}</p>}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 pb-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-tachometer-alt mr-3"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/users"
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  isActive('/users') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-users mr-3"></i>
                <span>All Users</span>
              </Link>
            </li>
            
            {/* System Reports */}
            <li>
              <button
                onClick={() => setSystemReportsOpen(!systemReportsOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-database mr-3"></i>
                  <span>System Reports</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${systemReportsOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {systemReportsOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/system-reports/market-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Market Win/Bid
                    </Link>
                  </li>
                  <li>
                    <Link to="/deposit-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Deposit Transactions
                    </Link>
                  </li>
                  <li>
                    <Link to="/withdraw-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Withdraw Transactions
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Game Management */}
            <li>
              <button
                onClick={() => setGameManagementOpen(!gameManagementOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-gamepad mr-3"></i>
                  <span>Game Management</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${gameManagementOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {gameManagementOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/markets" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Providers
                    </Link>
                  </li>
                  <li>
                    <Link to="/rates/edit" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Rates
                    </Link>
                  </li>
                  <li>
                    <Link to="/result" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Result
                    </Link>
                  </li>
                  <li>
                    <Link to="/generate-result" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Generate Result
                    </Link>
                  </li>
                  <li>
                    <Link to="/bet-revert" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Bid Revert
                    </Link>
                  </li>
                  <li>
                    <Link to="/winner-prediction" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Winner Prediction
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Bookie Corner */}
            <li>
              <button
                onClick={() => setBookieCornerOpen(!bookieCornerOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-book mr-3"></i>
                  <span>Bookie Corner</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${bookieCornerOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {bookieCornerOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/cutting-list" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Cutting List
                    </Link>
                  </li>
                  <li>
                    <Link to="/oc-cutting-group" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      OC Cutting Group
                    </Link>
                  </li>
                  <li>
                    <Link to="/oc-loss" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Loss Cutting
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Report Management */}
            <li>
              <button
                onClick={() => setReportManagementOpen(!reportManagementOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-file-alt mr-3"></i>
                  <span>Report Management</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${reportManagementOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {reportManagementOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/bet-filter" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Bid History
                    </Link>
                  </li>
                  <li>
                    <Link to="/winner-history" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Winning History
                    </Link>
                  </li>
                  <li>
                    <Link to="/sell-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Customer Sell Report
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Wallet Management */}
            <li>
              <button
                onClick={() => setWalletManagementOpen(!walletManagementOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-wallet mr-3"></i>
                  <span>Wallet Management</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${walletManagementOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {walletManagementOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/transaction-history" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Fund Report
                    </Link>
                  </li>
                  <li>
                    <Link to="/deposit-requests" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Deposit Requests
                    </Link>
                  </li>
                  <li>
                    <Link to="/withdraw-requests" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Withdraw Points Request
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Settings */}
            <li>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-cog mr-3"></i>
                  <span>Settings</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${settingsOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {settingsOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/change-password" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <Link to="/manual-payment" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Manual Deposit Methods
                    </Link>
                  </li>
                  <li>
                    <Link to="/deposit-withdraw-timings" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Withdraw Timings
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact-us" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Contact Us Details
                    </Link>
                  </li>
                  <li>
                    <Link to="/manage-settings" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Main Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/manage-payment" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Payment Gateway Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/image-slider" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Image Slider
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Notice Management */}
            <li>
              <button
                onClick={() => setNoticeManagementOpen(!noticeManagementOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-bell mr-3"></i>
                  <span>Notice Management</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${noticeManagementOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {noticeManagementOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/bell_notifications" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Bell Notifications
                    </Link>
                  </li>
                  <li>
                    <Link to="/send_notifications" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Send Notification
                    </Link>
                  </li>
                  <li>
                    <Link to="/content" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Manage Contents
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Personal Games Section */}
            <li className="mt-4">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Personal Games
              </div>
            </li>

            {/* Main Starline */}
            <li>
              <button
                onClick={() => setMainStarlineOpen(!mainStarlineOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-star mr-3"></i>
                  <span>Main Starline</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${mainStarlineOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {mainStarlineOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/personal-games/main-starline/provider" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Provider
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-starline/rates" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Rates
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-starline/bid-history" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Bid History
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-starline/result" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Result
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-starline/result-history" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Result History
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-starline/sell-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Sell Report
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-starline/winning-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Winning Report
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Main Jackpot */}
            <li>
              <button
                onClick={() => setMainJackpotOpen(!mainJackpotOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <i className="fas fa-trophy mr-3"></i>
                  <span>Main Jackpot</span>
                </div>
                <i className={`fas fa-angle-left transition-transform ${mainJackpotOpen ? 'rotate-90' : ''}`}></i>
              </button>
              {mainJackpotOpen && (
                <ul className="ml-8 mt-1 space-y-1">
                  <li>
                    <Link to="/personal-games/main-jackpot/provider" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Provider
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-jackpot/rates" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Rates
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-jackpot/bid-history" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Bid History
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-jackpot/result" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Game Result
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-jackpot/result-history" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Result History
                    </Link>
                  </li>
                  <li>
                    <Link to="/personal-games/main-jackpot/sell-report" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                      Sell Report
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-end">
          <button onClick={handleLogout} className="px-3 py-1.5 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition">
            <i className="fas fa-sign-out-alt mr-1"></i> Logout
          </button>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
