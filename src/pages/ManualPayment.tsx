import { useState, useEffect } from 'react'
import Pagination from '../components/Pagination'
import { paymentsApi } from '../lib/api'

interface PaymentMethod { id: number; qrImageUrl: string | null; upiId: string; isActive: boolean }

export default function ManualPayment() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => paymentsApi.list().then((d) => setMethods(d as PaymentMethod[])).catch(console.error)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrFile) { alert('Please select a QR code image'); return }
    setSubmitting(true)
    const formData = new FormData()
    formData.append('qrImage', qrFile)

    await fetch(`${import.meta.env.VITE_API_URL}/payments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      body: formData,
    }).catch((err) => alert(err.message))

    load(); setModalOpen(false); setQrFile(null)
    setSubmitting(false)
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this payment method?')) return
    paymentsApi.delete(id).then(load).catch((err) => alert(err.message))
  }

  const filtered = methods.filter((m) =>
    Object.values(m).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manual Payment Details</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Manual Payment Details</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Add Details
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
                <th className="px-4 py-2 border border-gray-300">QR Code</th>
                <th className="px-4 py-2 border border-gray-300">Status</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? (
                displayed.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 text-center">{m.id}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      {m.qrImageUrl ? (
                        <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${m.qrImageUrl}`} alt="QR" className="h-16 w-16 object-contain" />
                      ) : <span className="text-gray-400">No image</span>}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <span className={`px-2 py-1 text-xs rounded ${m.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button onClick={() => handleDelete(m.id)} className="px-2 py-1 text-xs text-white bg-red-600 rounded">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-600 border border-gray-300">
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Payment Method</h3>
            <form onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
                {qrFile && (
                  <div className="mt-2">
                    <img src={URL.createObjectURL(qrFile)} alt="Preview" className="h-24 w-24 object-contain border border-gray-200 rounded" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
