import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../components/Pagination'
import { alertsApi, ApiAdminAlert } from '../lib/api'

const PAGE_SIZE = 20

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<ApiAdminAlert[]>([])
  const [total, setTotal] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    alertsApi.list(currentPage, PAGE_SIZE)
      .then((response) => { setAlerts(response.alerts); setTotal(response.total) })
      .catch(console.error)
  }, [currentPage])

  useEffect(() => {
    alertsApi.list(1, PAGE_SIZE)
      .then((response) => { setNewCount(response.unreadCount); return alertsApi.markSeen() })
      .catch(console.error)
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Alerts</h3>
          {newCount > 0 && <span className="text-sm text-gray-700">{newCount} new since your last visit</span>}
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border border-gray-300 text-center">ID</th>
                <th className="px-4 py-2 border border-gray-300">Alert</th>
                <th className="px-4 py-2 border border-gray-300">Details</th>
                <th className="px-4 py-2 border border-gray-300">Customer</th>
                <th className="px-4 py-2 border border-gray-300">Received at</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300 text-center">{alert.id}</td>
                  <td className="px-4 py-2 border border-gray-300 font-medium">{alert.title}</td>
                  <td className="px-4 py-2 border border-gray-300">{alert.body}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    {alert.user
                      ? <Link to={`/users/${alert.user.id}`} className="text-blue-700 hover:underline">{alert.user.name} ({alert.user.mobile})</Link>
                      : <span className="text-gray-500">Deleted</span>}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">{new Date(alert.createdAt).toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-600 border border-gray-300">No alerts yet</td>
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
