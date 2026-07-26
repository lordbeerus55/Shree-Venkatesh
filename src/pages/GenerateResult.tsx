import { useState, useEffect } from 'react'
import { marketsApi, ApiMarket, resultsApi } from '../lib/api'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const ranges: Record<string, { start: string; end: string }> = {
  Today: { start: formatDate(new Date()), end: formatDate(new Date()) },
  Yesterday: { start: formatDate(new Date(Date.now() - 86400000)), end: formatDate(new Date(Date.now() - 86400000)) },
  'Last 7 Days': { start: formatDate(new Date(Date.now() - 7 * 86400000)), end: formatDate(new Date()) },
  'Last 30 Days': { start: formatDate(new Date(Date.now() - 30 * 86400000)), end: formatDate(new Date()) },
  'This Month': { start: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end: formatDate(new Date()) },
  'Last Month': {
    start: formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
    end: formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 0))
  }
}

export default function GenerateResult() {
  const [apiMarkets, setApiMarkets] = useState<ApiMarket[]>([])
  const [startDate, setStartDate] = useState(formatDate(new Date()))
  const [endDate, setEndDate] = useState(formatDate(new Date()))
  const [pickerOpen, setPickerOpen] = useState(false)
  const [marketId, setMarketId] = useState('')
  const [openPana, setOpenPana] = useState('')
  const [closePana, setClosePana] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { marketsApi.list().then(setApiMarkets).catch(console.error) }, [])

  const applyRange = (label: string) => {
    if (label === 'Custom Range') return
    const range = ranges[label]
    if (range) {
      setStartDate(range.start)
      setEndDate(range.end)
      setPickerOpen(false)
    }
  }

  const handleGenerate = async () => {
    if (!marketId || !startDate) { alert('Please select a market and date'); return }
    setSubmitting(true); setMsg('')
    try {
      await resultsApi.declare({ marketId: Number(marketId), resultDate: startDate, openPana: openPana || undefined, closePana: closePana || undefined })
      setMsg('Result declared successfully')
      setOpenPana(''); setClosePana('')
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setSubmitting(false) }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Result</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Generate Result</h3>
        </div>
        <div className="p-4">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={`${startDate} - ${endDate}`}
                  onClick={() => setPickerOpen(!pickerOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer"
                />
                {pickerOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range'].map((label) => (
                        <li key={label}>
                          <button
                            onClick={() => applyRange(label)}
                            className="w-full text-left px-3 py-1.5 rounded hover:bg-gray-100 text-gray-700"
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end gap-2 mt-3">
                      <button onClick={() => setPickerOpen(false)} className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
                      <button onClick={() => setPickerOpen(false)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">Apply</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="" disabled>Select Game</option>
                {apiMarkets.map((m: ApiMarket) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Open Pana</label>
              <input
                type="text"
                value={openPana}
                onChange={(e) => setOpenPana(e.target.value)}
                placeholder="e.g. 123"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Close Pana</label>
              <input
                type="text"
                value={closePana}
                onChange={(e) => setClosePana(e.target.value)}
                placeholder="e.g. 456"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <button
                onClick={handleGenerate}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? 'Generating…' : 'Generate Result'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
