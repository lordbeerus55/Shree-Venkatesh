import { createContext, useContext, useState, ReactNode } from 'react'
import { authApi, AuthAccount, setAuthSession } from '../lib/api'

interface AuthContextValue {
  admin: AuthAccount | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  canWrite: boolean
  isReadOnly: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AuthAccount | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    setAuthSession(res.token, res.admin)
    setToken(res.token)
    setAdmin(res.admin)
  }

  const logout = () => {
    setAuthSession(null, null)
    setToken(null)
    setAdmin(null)
  }

  const canWrite = admin?.role === 'ADMIN'
  const isReadOnly = admin?.role === 'VIEWER'

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading: false, canWrite, isReadOnly }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
