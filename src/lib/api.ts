const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken(): string | null {
  return localStorage.getItem('admin_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    console.error('API Error:', err, 'Status:', res.status, 'Path:', path)
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; admin: { id: number; username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<{ id: number; username: string; walletBalance: number }>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const reportsApi = {
  dashboard: (date?: string) =>
    request<Record<string, number>>(`/reports/dashboard${date ? `?date=${date}` : ''}`),

  marketTransactions: (date?: string) =>
    request<{ market: string; bidAmount: number; winAmount: number; profitLoss: number }[]>(
      `/reports/market-transactions${date ? `?date=${date}` : ''}`
    ),

  sellReport: (date?: string) =>
    request<{ gameType: string; count: number; totalAmount: number }[]>(
      `/reports/sell-report${date ? `?date=${date}` : ''}`
    ),
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: number
  mobile: string
  name: string
  mpin: string
  walletBalance: number
  isActive: boolean
  isBanned: boolean
  createdAt: string
}

export const usersApi = {
  list: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.search) q.set('search', params.search)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return request<{ users: ApiUser[]; total: number }>(`/users?${q}`)
  },

  get: (id: number) => request<ApiUser>(`/users/${id}`),

  create: (data: { name: string; mobile: string; mpin: string }) =>
    request<ApiUser>('/users', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: Partial<ApiUser>) =>
    request<ApiUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) => request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),

  toggleBan: (id: number) =>
    request<ApiUser>(`/users/${id}/ban`, { method: 'PATCH' }),

  addPoints: (id: number, amount: number, remark?: string) =>
    request<ApiUser>(`/users/${id}/add-points`, {
      method: 'POST',
      body: JSON.stringify({ amount, remark }),
    }),

  withdrawPoints: (id: number, amount: number, remark?: string) =>
    request<ApiUser>(`/users/${id}/withdraw-points`, {
      method: 'POST',
      body: JSON.stringify({ amount, remark }),
    }),
}

// ─── Markets ─────────────────────────────────────────────────────────────────

export interface ApiMarket {
  id: number
  name: string
  type: string
  isActive: boolean
  schedules: { id: number; dayOfWeek: string; openTime: string; closeTime: string; isActive: boolean }[]
}

export const marketsApi = {
  list: () => request<ApiMarket[]>('/markets'),
  create: (data: { name: string; type: string }) =>
    request<ApiMarket>('/markets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ApiMarket>) =>
    request<ApiMarket>(`/markets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ message: string }>(`/markets/${id}`, { method: 'DELETE' }),
  createSchedule: (marketId: number, data: { dayOfWeek: string; openTime: string; closeTime: string; isActive: boolean }) =>
    request(`/markets/${marketId}/schedules`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (marketId: number, scheduleId: number, data: { openTime?: string; closeTime?: string; isActive?: boolean }) =>
    request(`/markets/${marketId}/schedules/${scheduleId}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ─── Game Rates ───────────────────────────────────────────────────────────────

export interface ApiGameRates {
  id: number
  single: number
  jodi: number
  singlePana: number
  doublePana: number
  triplePana: number
  sp: number
  dp: number
  tp: number
  fp: number
  cp: number
  halfSangam: number
  fullSangam: number
}

export const gameRatesApi = {
  get: () => request<ApiGameRates>('/game-rates'),
  update: (data: Partial<ApiGameRates>) =>
    request<ApiGameRates>('/game-rates', { method: 'PUT', body: JSON.stringify(data) }),
}

// ─── Results ─────────────────────────────────────────────────────────────────

export const resultsApi = {
  list: (params?: { date?: string; marketId?: number; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.date) q.set('date', params.date)
    if (params?.marketId) q.set('marketId', String(params.marketId))
    if (params?.page) q.set('page', String(params.page))
    return request<{ results: unknown[]; total: number }>(`/results?${q}`)
  },
  declare: (data: { marketId: number; resultDate: string; openPana?: string; closePana?: string }) =>
    request('/results', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Bids ─────────────────────────────────────────────────────────────────────

export interface ApiBid {
  id: number
  bidDate: string
  session: string
  gameType: string
  number: string
  amount: number
  status: string
  createdAt: string
  user: { id: number; name: string; mobile: string }
  market: { id: number; name: string }
}

export const bidsApi = {
  list: (params?: { date?: string; marketId?: number; userId?: number; status?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.date) q.set('date', params.date)
    if (params?.marketId) q.set('marketId', String(params.marketId))
    if (params?.userId) q.set('userId', String(params.userId))
    if (params?.status) q.set('status', params.status)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return request<{ bids: ApiBid[]; total: number }>(`/bids?${q}`)
  },
  revert: (id: number) =>
    request<{ message: string }>(`/bids/${id}/revert`, { method: 'POST' }),
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletApi = {
  list: (params?: { userId?: number; type?: string; page?: number }) => {
    const q = new URLSearchParams()
    if (params?.userId) q.set('userId', String(params.userId))
    if (params?.type) q.set('type', params.type)
    if (params?.page) q.set('page', String(params.page))
    return request<{ transactions: unknown[]; total: number }>(`/wallet?${q}`)
  },
  userHistory: (userId: number) => request<unknown[]>(`/wallet/user/${userId}`),
}

// ─── Deposits ─────────────────────────────────────────────────────────────────

export interface ApiDeposit {
  id: number
  amount: number
  paymentMethod: string
  transactionRef: string
  proofImageUrl: string
  status: string
  adminRemark: string
  createdAt: string
  processedAt: string
  user: { id: number; name: string; mobile: string }
}

export const depositsApi = {
  list: (params?: { status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.status && params.status !== 'all') q.set('status', params.status)
    if (params?.startDate) q.set('startDate', params.startDate)
    if (params?.endDate) q.set('endDate', params.endDate)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return request<{ requests: ApiDeposit[]; total: number }>(`/deposits?${q}`)
  },
  approve: (id: number, remark?: string) =>
    request<{ message: string }>(`/deposits/${id}/approve`, { method: 'POST', body: JSON.stringify({ remark }) }),
  reject: (id: number, remark?: string) =>
    request<{ message: string }>(`/deposits/${id}/reject`, { method: 'POST', body: JSON.stringify({ remark }) }),
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────

export interface ApiWithdrawal {
  id: number
  amount: number
  accountHolder: string
  accountNumber: string
  ifscCode: string
  upiId: string
  status: string
  adminRemark: string
  createdAt: string
  processedAt: string
  user: { id: number; name: string; mobile: string; walletBalance: number }
}

export const withdrawalsApi = {
  list: (params?: { status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.status && params.status !== 'all') q.set('status', params.status)
    if (params?.startDate) q.set('startDate', params.startDate)
    if (params?.endDate) q.set('endDate', params.endDate)
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    return request<{ requests: ApiWithdrawal[]; total: number }>(`/withdrawals?${q}`)
  },
  approve: (id: number, remark?: string) =>
    request<{ message: string }>(`/withdrawals/${id}/approve`, { method: 'POST', body: JSON.stringify({ remark }) }),
  reject: (id: number, remark?: string) =>
    request<{ message: string }>(`/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify({ remark }) }),
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface ApiNotification {
  id: number
  title: string
  body: string
  createdAt: string
}

export const notificationsApi = {
  list: () => request<ApiNotification[]>('/notifications'),
  create: (data: { title: string; body: string }) =>
    request<ApiNotification>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { title: string; body: string }) =>
    request<ApiNotification>(`/notifications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ message: string }>(`/notifications/${id}`, { method: 'DELETE' }),
}

// ─── Contents ─────────────────────────────────────────────────────────────────

export const contentsApi = {
  list: () => request<Record<string, string>>('/contents'),
  update: (key: string, body: string) =>
    request(`/contents/${key}`, { method: 'PUT', body: JSON.stringify({ body }) }),
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export const settingsApi = {
  list: () => request<Record<string, string>>('/settings'),
  update: (data: Record<string, string>) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
}

// ─── Timings ──────────────────────────────────────────────────────────────────

export const timingsApi = {
  list: () => request<{ id: number; type: string; openTime: string; closeTime: string }[]>('/timings'),
  update: (type: string, data: { openTime: string; closeTime: string }) =>
    request(`/timings/${type}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export const paymentsApi = {
  list: () => request<unknown[]>('/payments'),
  create: (data: unknown) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: unknown) => request(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/payments/${id}`, { method: 'DELETE' }),
}

// ─── Slider ───────────────────────────────────────────────────────────────────

export const sliderApi = {
  list: () => request<{ id: number; imageUrl: string; redirectUrl: string; sortOrder: number; isActive: boolean }[]>('/slider'),
  upload: (formData: FormData) => {
    const token = getToken()
    return fetch(`${BASE}/slider`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((r) => r.json())
  },
  delete: (id: number) => request(`/slider/${id}`, { method: 'DELETE' }),
}
