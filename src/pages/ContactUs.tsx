import { useState, useEffect } from 'react'
import { settingsApi } from '../lib/api'

export default function ContactUs() {
  const [whatsapp, setWhatsapp] = useState('')
  const [callNumber, setCallNumber] = useState('')
  const [telegramGroup, setTelegramGroup] = useState('')
  const [whatsappGroup, setWhatsappGroup] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    settingsApi.list().then((s) => {
      if (s.whatsapp) setWhatsapp(s.whatsapp)
      if (s.call_number) setCallNumber(s.call_number)
      if (s.telegram_group) setTelegramGroup(s.telegram_group)
      if (s.whatsapp_group) setWhatsappGroup(s.whatsapp_group)
    }).catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Contact Us</h3>
        </div>
        <div className="p-4 max-w-lg">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setSubmitting(true); setMsg('')
              await settingsApi.update({ whatsapp, call_number: callNumber, telegram_group: telegramGroup, whatsapp_group: whatsappGroup })
                .then(() => setMsg('Contact info updated')).catch((err) => alert(err.message))
              setSubmitting(false)
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">Whatsapp</label>
              <input
                type="text"
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="call_number" className="block text-sm font-medium text-gray-700 mb-1">Call number</label>
              <input
                type="text"
                id="call_number"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="telegram_group" className="block text-sm font-medium text-gray-700 mb-1">Telegram group</label>
              <input
                type="text"
                id="telegram_group"
                value={telegramGroup}
                onChange={(e) => setTelegramGroup(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label htmlFor="whatsapp_group" className="block text-sm font-medium text-gray-700 mb-1">Whatsapp group</label>
              <input
                type="text"
                id="whatsapp_group"
                value={whatsappGroup}
                onChange={(e) => setWhatsappGroup(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
              {submitting ? 'Updating…' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
