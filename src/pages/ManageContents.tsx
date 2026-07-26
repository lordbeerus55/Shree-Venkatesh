import { useState, useEffect, FormEvent } from 'react'
import { contentsApi } from '../lib/api'

type ContentKey = 'videos' | 'withdraw_rules' | 'game_rules'

export default function ManageContents() {
  const [activeTab, setActiveTab] = useState<ContentKey>('videos')
  const [content, setContent] = useState<Record<ContentKey, string>>({ videos: '', withdraw_rules: '', game_rules: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    contentsApi.list().then((data) => {
      setContent({
        videos: data['videos'] || '',
        withdraw_rules: data['withdraw_rules'] || '',
        game_rules: data['game_rules'] || '',
      })
    }).catch(console.error)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setMsg(''); setLoading(true)
    try {
      await contentsApi.update(activeTab, content[activeTab])
      setMsg('Content updated successfully')
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed') }
    finally { setLoading(false) }
  }

  const labelMap: Record<ContentKey, string> = {
    videos: 'Videos',
    withdraw_rules: 'Withdraw rules',
    game_rules: 'Game rules',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Content</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Update Content</h3>
        </div>
        <div className="p-4">
          <div className="flex border-b border-gray-200 mb-4">
            {(Object.keys(labelMap) as ContentKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
              >
                {labelMap[key]}
              </button>
            ))}
          </div>
          {msg && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form onSubmit={handleSubmit} className="space-y-4"
          >
            <input type="hidden" name="content_key" value={activeTab} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{labelMap[activeTab]} content</label>
              <textarea
                value={content[activeTab]}
                onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
              />
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? 'Saving…' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
