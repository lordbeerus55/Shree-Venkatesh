const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

let customerToken: string | null = null

export function setCustomerToken(token: string | null): void {
  customerToken = token
}

async function customerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${BASE}/customer${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(body.error || body.message || 'Request failed')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export interface Customer {
  id: number
  name: string
  mobile?: string
  username?: string
  walletBalance: number | string
  fundsReserved?: number | string
}

export interface CustomerMarket {
  id: number
  name: string
  type?: string
  isActive: boolean
  openTime?: string
  closeTime?: string
  schedules?: Array<{ dayOfWeek?: string; openTime: string; closeTime: string; isActive?: boolean }>
}

export interface CustomerResult {
  id: number
  resultDate?: string
  date?: string
  openPana?: string
  closePana?: string
  openResult?: string
  closeResult?: string
  result?: string
  openDigit?: string
  closeDigit?: string
  jodi?: string
  market?: { id: number; name: string }
  marketName?: string
}

export interface CustomerBid {
  id: number
  bidDate: string
  session: string
  gameType: string
  number: string
  amount: number | string
  winningAmount?: number | string
  payoutMultiplier?: number | string
  status: string
  createdAt?: string
  market?: { id: number; name: string }
  marketName?: string
}

export interface WalletTransaction {
  id: number
  amount: number
  type: string
  remark?: string
  beforeBalance?: number | string
  afterBalance?: number | string
  createdAt?: string
  date?: string
}

export interface MoneyRequest {
  id: number
  amount: number | string
  status: string
  createdAt?: string
  paymentMethod?: string
  transactionRef?: string
  accountHolder?: string
  accountNumber?: string
  ifscCode?: string
  upiId?: string
}

export interface BidPayload {
  marketId: number
  bidDate: string
  session: string
  gameType: string
  number: string
  amount: number
  idempotencyKey: string
}

export const customerApi = {
  login: (identifier: string, credential: string) =>
    customerRequest<{ token: string; customer: Customer }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, credential }),
    }),
  register: (data: { name: string; mobile: string; mpin: string; username: string; password: string }) =>
    customerRequest<{ token: string; customer: Customer }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => customerRequest<Customer>('/me'),
  markets: () => customerRequest<CustomerMarket[] | { markets: CustomerMarket[] }>('/markets'),
  rates: () => customerRequest<Record<string, number> | { rates: Record<string, number> }>('/rates'),
  results: () => customerRequest<CustomerResult[] | { results: CustomerResult[] }>('/results'),
  placeBid: (data: BidPayload) =>
    customerRequest<CustomerBid>('/bids', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  bids: () => customerRequest<CustomerBid[] | { bids: CustomerBid[] }>('/bids'),
  wallet: () => customerRequest<
    WalletTransaction[] | { transactions?: WalletTransaction[]; balance?: number; walletBalance?: number }
  >('/wallet'),
  createDeposit: (data: { amount: number; paymentMethod?: string; transactionRef?: string; idempotencyKey: string }) =>
    customerRequest<MoneyRequest>('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deposits: () => customerRequest<MoneyRequest[] | { requests: MoneyRequest[] }>('/deposits'),
  createWithdrawal: (data: {
    amount: number
    accountHolder?: string
    accountNumber?: string
    ifscCode?: string
    upiId?: string
    idempotencyKey: string
  }) => customerRequest<MoneyRequest>('/withdrawals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  withdrawals: () => customerRequest<MoneyRequest[] | { requests: MoneyRequest[] }>('/withdrawals'),
}

export function unwrapList<T>(value: T[] | Record<string, T[]>, key: string): T[] {
  if (Array.isArray(value)) return value
  const list = value[key]
  return Array.isArray(list) ? list : []
}
