import { useState } from 'react'
import { notificationsApi } from '../lib/api'

export default function SendNotifications() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [topic, setTopic] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Notification</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Send Notification</h3>
        </div>
        <div className="p-4 max-w-2xl">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setSubmitting(true); setMsg('')
              await notificationsApi.create({ title, body: description })
                .then(() => { setMsg('Notification sent'); setTitle(''); setDescription('') })
                .catch((err) => alert(err.message))
              setSubmitting(false)
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Notification Title:</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Notification Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
              <select
                id="user-filter"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All users</option>
              </select>
            </div>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
              {submitting ? 'Sending…' : 'Send Notification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
