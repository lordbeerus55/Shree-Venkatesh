import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { alertsApi, ApiAdminAlert } from '../lib/api'

const POLL_INTERVAL_MS = 45000

export default function AdminAlertBell() {
  const [alerts, setAlerts] = useState<ApiAdminAlert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = () => alertsApi.list(1, 10)
      .then((response) => { setAlerts(response.alerts); setUnreadCount(response.unreadCount) })
      .catch(console.error)
    load()
    const timer = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) {
      alertsApi.markSeen()
        .then(() => setUnreadCount(0))
        .catch(console.error)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button onClick={toggle} className="relative px-2 py-1.5 text-gray-700 hover:text-gray-900" aria-label="Admin alerts">
        <i className="fas fa-bell text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] rounded-full bg-red-600 px-1 text-center text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800">Alerts</div>
          <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
            {alerts.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">No alerts yet</li>}
            {alerts.map((alert) => (
              <li key={alert.id} className="px-4 py-3 text-sm">
                <p className="font-medium text-gray-800">{alert.title}</p>
                <p className="text-gray-600">{alert.body}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(alert.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <Link to="/alerts" onClick={() => setOpen(false)} className="block border-t border-gray-200 px-4 py-2 text-center text-sm text-blue-700 hover:bg-gray-50">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
