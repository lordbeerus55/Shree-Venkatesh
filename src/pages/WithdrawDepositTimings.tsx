import { useState, useEffect } from 'react'
import { timingsApi } from '../lib/api'

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const makeDefault = (start: string, end: string) => Object.fromEntries(days.map((d) => [d, { start, end }]))

export default function WithdrawDepositTimings() {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'deposit'>('withdraw')
  const [withdraw, setWithdraw] = useState<Record<string, { start: string; end: string }>>(makeDefault('07:00', '23:00'))
  const [deposit, setDeposit] = useState<Record<string, { start: string; end: string }>>(makeDefault('09:00', '17:00'))
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    timingsApi.list().then((rows) => {
      const w: Record<string, { start: string; end: string }> = { ...makeDefault('07:00', '23:00') }
      const d: Record<string, { start: string; end: string }> = { ...makeDefault('09:00', '17:00') }
      rows.forEach((r) => {
        const [type, day] = r.type.split('_')
        if (type === 'withdraw' && day) w[day] = { start: r.openTime, end: r.closeTime }
        if (type === 'deposit' && day) d[day] = { start: r.openTime, end: r.closeTime }
      })
      setWithdraw(w); setDeposit(d)
    }).catch(console.error)
  }, [])

  const updateWithdraw = (day: string, field: 'start' | 'end', value: string) =>
    setWithdraw((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))

  const updateDeposit = (day: string, field: 'start' | 'end', value: string) =>
    setDeposit((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))

  const handleSubmit = async (type: 'withdraw' | 'deposit', data: Record<string, { start: string; end: string }>) => {
    setSubmitting(true); setMsg('')
    await Promise.all(days.map((day) =>
      timingsApi.update(`${type}_${day}`, { openTime: data[day].start, closeTime: data[day].end })
    )).then(() => setMsg('Timings updated')).catch((err) => alert(err.message))
    setSubmitting(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Withdraw Timings</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Withdraw Timings</h3>
        </div>
        <div className="p-4">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'withdraw' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
            >
              Withdraw Timings
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'deposit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
            >
              Deposit Timings
            </button>
          </div>

          {activeTab === 'withdraw' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('withdraw', withdraw) }}
              className="space-y-6"
            >
              <input type="hidden" name="type" value="withdraw" />
              {days.map((day) => (
                <div key={`withdraw-${day}`}>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">{day}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time:</label>
                      <input
                        type="time"
                        value={withdraw[day].start}
                        onChange={(e) => updateWithdraw(day, 'start', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time:</label>
                      <input
                        type="time"
                        value={withdraw[day].end}
                        onChange={(e) => updateWithdraw(day, 'end', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
                {submitting ? 'Saving…' : 'Submit'}
              </button>
            </form>
          )}

          {activeTab === 'deposit' && (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('deposit', deposit) }}
              className="space-y-6"
            >
              <input type="hidden" name="type" value="deposit" />
              {days.map((day) => (
                <div key={`deposit-${day}`}>
                  <h4 className="text-md font-semibold text-gray-800 mb-2">{day}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time:</label>
                      <input
                        type="time"
                        value={deposit[day].start}
                        onChange={(e) => updateDeposit(day, 'start', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time:</label>
                      <input
                        type="time"
                        value={deposit[day].end}
                        onChange={(e) => updateDeposit(day, 'end', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
                {submitting ? 'Saving…' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
