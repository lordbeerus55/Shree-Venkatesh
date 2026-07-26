import { useState, useEffect } from 'react'
import { settingsApi } from '../lib/api'

export default function ManagePayment() {
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [qrFile, setQrFile] = useState<File | null>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)

  useEffect(() => {
    settingsApi.list().then((s) => {
      if (s.qr_image_url) setQrImageUrl(s.qr_image_url)
    }).catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Gateway Settings</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Payment Gateway Settings</h3>
        </div>
        <div className="p-4 max-w-2xl space-y-6">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setSubmitting(true); setMsg('')
              
              let finalQrUrl = qrImageUrl
              if (qrFile) {
                const formData = new FormData()
                formData.append('qrImage', qrFile)
                const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/payments`, {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
                  body: formData,
                }).catch((err) => { alert(err.message); return null })
                if (uploadRes) {
                  const uploadData = await uploadRes.json()
                  finalQrUrl = uploadData.qrImageUrl
                }
              }

              await settingsApi.update({
                qr_image_url: finalQrUrl || '',
              }).then(() => {
                setQrImageUrl(finalQrUrl)
                setQrFile(null)
                setMsg('Settings updated')
              }).catch((err) => alert(err.message))
              setSubmitting(false)
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">QR Code Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">{submitting ? 'Updating…' : 'Update'}</button>

            {(qrImageUrl || qrFile) && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">QR Code Preview</h4>
                <div className="flex justify-center">
                  <img 
                    src={qrFile ? URL.createObjectURL(qrFile) : `${import.meta.env.VITE_API_URL.replace('/api', '')}${qrImageUrl}`} 
                    alt="QR Code" 
                    className="max-w-md w-full h-auto border border-gray-300 rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}


