import { useState, useEffect, FormEvent } from 'react'
import { gameRatesApi, ApiGameRates } from '../lib/api'

type GameRatesData = { [K in keyof Omit<ApiGameRates, 'id'>]: string }

const toStrings = (r: ApiGameRates): GameRatesData => ({
  single: String(r.single), jodi: String(r.jodi), singlePana: String(r.singlePana),
  doublePana: String(r.doublePana), triplePana: String(r.triplePana),
  sp: String(r.sp), dp: String(r.dp), tp: String(r.tp),
  fp: String(r.fp), cp: String(r.cp), halfSangam: String(r.halfSangam), fullSangam: String(r.fullSangam),
})

const DEFAULT: GameRatesData = { single:'10', jodi:'100', singlePana:'160', doublePana:'320', triplePana:'1000', sp:'150', dp:'300', tp:'1000', fp:'150', cp:'150', halfSangam:'1200', fullSangam:'12000' }

export default function GameRates() {
  const [rates, setRates] = useState<GameRatesData>(DEFAULT)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    gameRatesApi.get().then((r) => { if (r) setRates(toStrings(r)) }).catch(console.error)
  }, [])

  const handleChange = (field: keyof GameRatesData, value: string) => {
    setRates((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setMsg(''); setLoading(true)
    try {
      await gameRatesApi.update(Object.fromEntries(Object.entries(rates).map(([k, v]) => [k, Number(v)])) as Partial<ApiGameRates>)
      setMsg('Rates updated successfully')
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setLoading(false) }
  }

  const fields: { key: keyof GameRatesData; label: string }[] = [
    { key: 'single', label: 'Single' },
    { key: 'jodi', label: 'Jodi' },
    { key: 'singlePana', label: 'Single Pana' },
    { key: 'doublePana', label: 'Double Pana' },
    { key: 'triplePana', label: 'Triple Pana' },
    { key: 'sp', label: 'SP' },
    { key: 'dp', label: 'DP' },
    { key: 'tp', label: 'TP' },
    { key: 'fp', label: 'Family Pana' },
    { key: 'cp', label: 'Cycle Pana' },
    { key: 'halfSangam', label: 'Half Sangam' },
    { key: 'fullSangam', label: 'Full Sangam' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Game Rates</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Game Rates</h3>
        </div>
        <div className="p-4">
          {msg && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form onSubmit={handleSubmit} className="space-y-4"
          >
            {fields.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
                <input
                  type="text"
                  value={rates[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  required={key === 'single'}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            ))}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Update Rates'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
