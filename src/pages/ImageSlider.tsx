import { useState, useEffect, useRef } from 'react'
import Pagination from '../components/Pagination'
import { sliderApi } from '../lib/api'

interface SliderImage { id: number; imageUrl: string; redirectUrl: string; sortOrder: number; isActive: boolean }

export default function ImageSlider() {
  const [images, setImages] = useState<SliderImage[]>([])
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [redirect, setRedirect] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => sliderApi.list().then(setImages).catch(console.error)
  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setSubmitting(true)
    const fd = new FormData()
    fd.append('image', file)
    if (redirect) fd.append('redirectUrl', redirect)
    try {
      await sliderApi.upload(fd)
      load(); setModalOpen(false); setRedirect('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) { alert(err instanceof Error ? err.message : 'Upload failed') }
    finally { setSubmitting(false) }
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this image?')) return
    sliderApi.delete(id).then(load).catch(console.error)
  }

  const filtered = images.filter((img) =>
    [img.imageUrl, img.redirectUrl].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Image Slider</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Image Slider</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Add Image
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
                <th className="px-4 py-2 border border-gray-300">Image</th>
                <th className="px-4 py-2 border border-gray-300">Redirect</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayed.length > 0 ? (
                displayed.map((img) => (
                  <tr key={img.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300 text-center">{img.id}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      {img.imageUrl ? <img src={img.imageUrl} alt="slide" className="h-12 object-cover rounded" /> : '—'}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">{img.redirectUrl || '—'}</td>
                    <td className="px-4 py-2 border border-gray-300">
                      <button onClick={() => handleDelete(img.id)} className="px-2 py-1 text-xs text-white bg-red-600 rounded">Delete</button>
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Add Image</h4>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleUpload}
              className="p-4 space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Image</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL (Optional)</label>
                <input
                  type="text"
                  value={redirect}
                  onChange={(e) => setRedirect(e.target.value)}
                  placeholder="url with http or https"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-60">{submitting ? 'Uploading…' : 'Submit'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
