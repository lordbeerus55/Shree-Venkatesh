import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { notificationsApi, ApiNotification } from '../lib/api'

type Notification = ApiNotification

export default function BellNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => notificationsApi.list().then(setNotifications).catch(console.error)
  useEffect(() => { load() }, [])

  const handleCreate = () => {
    setSubmitting(true)
    notificationsApi.create({ title, body: message })
      .then(() => { load(); setModalOpen(false); setTitle(''); setMessage('') })
      .catch((err) => alert(err.message))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this notification?')) return
    notificationsApi.delete(id).then(load).catch(console.error)
  }

  const filtered = notifications.filter((n) =>
    [n.title, n.body].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bell Notifications</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Bell Notifications</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Add Notification
          </button>
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
                <th className="px-4 py-2 border border-gray-300">Title</th>
                <th className="px-4 py-2 border border-gray-300">Notification</th>
                <th className="px-4 py-2 border border-gray-300">Created at</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? (
                displayed.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 text-center">{n.id}</td>
                    <td className="px-4 py-2 border border-gray-300">{n.title}</td>
                    <td className="px-4 py-2 border border-gray-300">{n.body}</td>
                    <td className="px-4 py-2 border border-gray-300">{new Date(n.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button onClick={() => handleDelete(n.id)} className="px-2 py-1 text-xs text-white bg-red-600 rounded">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-600 border border-gray-300">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Add Notifications</h4>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleCreate() }}
              className="p-4 space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification content"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-60">{submitting ? 'Saving…' : 'Submit'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
