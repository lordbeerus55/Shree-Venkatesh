import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AllUsers from './pages/AllUsers'
import UserDetails from './pages/UserDetails'
import SystemReports from './pages/SystemReports'
import DepositReport from './pages/DepositReport'
import WithdrawReport from './pages/WithdrawReport'
import Markets from './pages/Markets'
import GameRates from './pages/GameRates'
import GameResult from './pages/GameResult'
import GenerateResult from './pages/GenerateResult'
import BidRevert from './pages/BidRevert'
import CuttingList from './pages/CuttingList'
import OCGroupCombined from './pages/OCGroupCombined'
import OCLoss from './pages/OCLoss'
import WinnerPrediction from './pages/WinnerPrediction'
import BetFilter from './pages/BetFilter'
import WinnerHistory from './pages/WinnerHistory'
import SellReport from './pages/SellReport'
import TransactionHistory from './pages/TransactionHistory'
import DepositRequests from './pages/DepositRequests'
import WithdrawRequests from './pages/WithdrawRequests'
import ChangePassword from './pages/ChangePassword'
import ManualPayment from './pages/ManualPayment'
import WithdrawDepositTimings from './pages/WithdrawDepositTimings'
import ContactUs from './pages/ContactUs'
import ManageSettings from './pages/ManageSettings'
import ManagePayment from './pages/ManagePayment'
import ImageSlider from './pages/ImageSlider'
import BellNotifications from './pages/BellNotifications'
import SendNotifications from './pages/SendNotifications'
import ManageContents from './pages/ManageContents'
import GameManagement from './pages/GameManagement'
import BookieCorner from './pages/BookieCorner'
import ReportManagement from './pages/ReportManagement'
import WalletManagement from './pages/WalletManagement'
import Settings from './pages/Settings'
import NoticeManagement from './pages/NoticeManagement'
import MainStarline from './pages/personal-games/MainStarline'
import MainJackpot from './pages/personal-games/MainJackpot'
import Layout from './components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading…</div>
  if (!admin) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<AllUsers />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/system-reports/market-report" element={<SystemReports />} />
          <Route path="/deposit-report" element={<DepositReport />} />
          <Route path="/withdraw-report" element={<WithdrawReport />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/rates/edit" element={<GameRates />} />
          <Route path="/result" element={<GameResult />} />
          <Route path="/generate-result" element={<GenerateResult />} />
          <Route path="/bet-revert" element={<BidRevert />} />
          <Route path="/cutting-list" element={<CuttingList />} />
          <Route path="/oc-cutting-group" element={<OCGroupCombined />} />
          <Route path="/oc-loss" element={<OCLoss />} />
          <Route path="/winner-prediction" element={<WinnerPrediction />} />
          <Route path="/bet-filter" element={<BetFilter />} />
          <Route path="/winner-history" element={<WinnerHistory />} />
          <Route path="/sell-report" element={<SellReport />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          <Route path="/deposit-requests" element={<DepositRequests />} />
          <Route path="/withdraw-requests" element={<WithdrawRequests />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/manual-payment" element={<ManualPayment />} />
          <Route path="/deposit-withdraw-timings" element={<WithdrawDepositTimings />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/manage-settings" element={<ManageSettings />} />
          <Route path="/manage-payment" element={<ManagePayment />} />
          <Route path="/image-slider" element={<ImageSlider />} />
          <Route path="/bell_notifications" element={<BellNotifications />} />
          <Route path="/send_notifications" element={<SendNotifications />} />
          <Route path="/content" element={<ManageContents />} />
          <Route path="/game-management" element={<GameManagement />} />
          <Route path="/bookie-corner" element={<BookieCorner />} />
          <Route path="/report-management" element={<ReportManagement />} />
          <Route path="/wallet-management" element={<WalletManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notice-management" element={<NoticeManagement />} />
          <Route path="/personal-games/main-starline" element={<MainStarline />} />
          <Route path="/personal-games/main-jackpot" element={<MainJackpot />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
