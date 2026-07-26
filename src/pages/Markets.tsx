import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { marketsApi, ApiMarket } from '../lib/api'

type Schedule = ApiMarket['schedules'][number]
type Market = ApiMarket

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// "14:30" → "02:30 PM"
function to12Hour(time24: string): string {
  const [hStr, mStr] = time24.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr || '00'
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`
}

// "02:30 PM" → "14:30"
function to24Hour(time12: string): string {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time12
  let h = parseInt(match[1], 10)
  const m = match[2]
  const ampm = match[3].toUpperCase()
  if (ampm === 'AM') { if (h === 12) h = 0 }
  else { if (h !== 12) h += 12 }
  return `${String(h).padStart(2, '0')}:${m}`
}

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [dayModal, setDayModal] = useState<{ marketId: number; schedule: Schedule } | null>(null)
  const [addScheduleModal, setAddScheduleModal] = useState<{ marketId: number; dayOfWeek: string } | null>(null)
  const [marketModal, setMarketModal] = useState<Market | null>(null)
  const [deleteModal, setDeleteModal] = useState<Market | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const load = () => marketsApi.list().then(setMarkets).catch(console.error)
  useEffect(() => { load() }, [])

  const handleAddMarket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await marketsApi.create({ name: fd.get('game_name') as string, type: 'main' }).catch((err) => alert(err.message))
    load(); setAddModalOpen(false)
  }

  const handleUpdateMarket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!marketModal) return
    const fd = new FormData(e.currentTarget)
    await marketsApi.update(marketModal.id, { name: fd.get('name') as string }).catch((err) => alert(err.message))
    load(); setMarketModal(null)
  }

  const handleDeleteMarket = async () => {
    if (!deleteModal) return
    await marketsApi.delete(deleteModal.id).catch((err) => alert(err.message))
    load(); setDeleteModal(null)
  }

  const handleAddSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!addScheduleModal) return
    const fd = new FormData(e.currentTarget)
    await marketsApi.createSchedule(addScheduleModal.marketId, {
      dayOfWeek: addScheduleModal.dayOfWeek,
      openTime: to12Hour(fd.get('open') as string),
      closeTime: to12Hour(fd.get('close') as string),
      isActive: fd.get('active') === 'yes',
    }).catch((err) => alert(err.message))
    load(); setAddScheduleModal(null)
  }

  const handleUpdateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!dayModal) return
    const fd = new FormData(e.currentTarget)
    await marketsApi.updateSchedule(dayModal.marketId, dayModal.schedule.id, {
      openTime: to12Hour(fd.get('open') as string),
      closeTime: to12Hour(fd.get('close') as string),
      isActive: fd.get('active') === 'yes',
    }).catch((err) => alert(err.message))
    load(); setDayModal(null)
  }

  const totalPages = Math.ceil(markets.length / pageSize)
  const displayedMarkets = markets.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Markets</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Add Market
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
          </div>

          <table className="w-full text-sm text-left border-collapse border border-gray-300 min-w-max">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Market</th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-2 border border-gray-300">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedMarkets.map((market) => (
                <tr key={market.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex flex-col">
                      <strong>{market.name}</strong>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setMarketModal(market)}
                          className="px-2 py-1 text-xs text-white bg-cyan-600 rounded hover:bg-cyan-700 transition"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal(market)}
                          className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700 transition"
                        >
                          <i className="fas fa-trash mr-1"></i> Delete
                        </button>
                      </div>
                    </div>
                  </td>
                  {days.map((dayName) => {
                    const s = market.schedules?.find((sc) => sc.dayOfWeek === dayName)
                    return (
                    <td key={dayName} className="px-4 py-2 border border-gray-300 align-top">
                      {s ? (
                      <div>
                        <span className={`px-2 py-0.5 text-xs rounded text-white ${s.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="mt-1 text-xs text-gray-600">
                          <div>Open: {s.openTime}</div>
                          <div>Close: {s.closeTime}</div>
                        </div>
                        <button
                          onClick={() => setDayModal({ marketId: market.id, schedule: s })}
                          className="mt-2 px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                      ) : (
                        <button
                          onClick={() => setAddScheduleModal({ marketId: market.id, dayOfWeek: dayName })}
                          className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 transition"
                          title={`Add schedule for ${dayName}`}
                        >
                          <i className="fas fa-plus"></i> Add
                        </button>
                      )}
                    </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {dayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Edit Game</h4>
              <button onClick={() => setDayModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdateSchedule} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                <input
                  type="time"
                  name="open"
                  defaultValue={to24Hour(dayModal.schedule.openTime)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                <input
                  type="time"
                  name="close"
                  defaultValue={to24Hour(dayModal.schedule.closeTime)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Active</label>
                <select
                  name="active"
                  defaultValue={dayModal.schedule.isActive ? 'yes' : 'no'}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">Update Game</button>
                <button type="button" onClick={() => setDayModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {marketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Edit Game</h4>
              <button onClick={() => setMarketModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdateMarket} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={marketModal.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                <input
                  type="time"
                  name="open"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                <input
                  type="time"
                  name="close"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Active</label>
                <select
                  name="active"
                  defaultValue="yes"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">Update Game</button>
                <button type="button" onClick={() => setMarketModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Add Schedule — {addScheduleModal.dayOfWeek}
              </h4>
              <button onClick={() => setAddScheduleModal(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                <input
                  type="time"
                  name="open"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                <input
                  type="time"
                  name="close"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Active</label>
                <select
                  name="active"
                  defaultValue="yes"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">Add Schedule</button>
                <button type="button" onClick={() => setAddScheduleModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Delete {deleteModal.name}?</h4>
            <div className="flex justify-end gap-2">
              <button onClick={handleDeleteMarket} className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">Delete</button>
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Add Game</h4>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleAddMarket}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Game Name</label>
                <input
                  type="text"
                  name="game_name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                <input
                  type="time"
                  name="open_time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                <input
                  type="time"
                  name="close_time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700">Add Game</button>
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
