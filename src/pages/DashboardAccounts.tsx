import { FormEvent, useEffect, useState } from 'react'
import { accountsApi, DashboardAccount } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardAccounts() {
  const { canWrite } = useAuth()
  const [accounts, setAccounts] = useState<DashboardAccount[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    if (!canWrite) return
    setLoading(true)
    accountsApi.list()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [canWrite])

  const createViewer = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await accountsApi.createViewer(username, password)
      setUsername('')
      setPassword('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create viewer')
    }
  }

  if (!canWrite) {
    return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">Administrator access required.</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Users</h2>
      {error && <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}

      <form onSubmit={createViewer} className="bg-white rounded-lg shadow p-5 mb-6 grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Viewer username</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={50}
            pattern="[a-zA-Z0-9._-]+"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <p className="mt-1 text-xs text-gray-500">At least 12 characters. Send it securely.</p>
        </div>
        <div className="flex items-end">
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Create read-only user</button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? <div className="p-6 text-gray-500">Loading dashboard users…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t border-gray-200">
                  <td className="px-4 py-3">{account.username}</td>
                  <td className="px-4 py-3">{account.role}</td>
                  <td className="px-4 py-3">{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={async () => {
                        const nextPassword = window.prompt('Enter a new password of at least 12 characters')
                        if (!nextPassword) return
                        try {
                          await accountsApi.resetPassword(account.id, nextPassword)
                          window.alert('Password reset successfully')
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Unable to reset password')
                        }
                      }}
                      className="px-3 py-1.5 text-white bg-gray-600 rounded hover:bg-gray-700"
                    >
                      Reset password
                    </button>
                    {account.role === 'VIEWER' && (
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete viewer ${account.username}?`)) return
                          try {
                            await accountsApi.delete(account.id)
                            load()
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Unable to delete viewer')
                          }
                        }}
                        className="px-3 py-1.5 text-white bg-red-600 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!accounts.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500">No dashboard users found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
