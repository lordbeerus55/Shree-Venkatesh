import { createContext, ReactNode, useContext, useState } from 'react'
import { Customer, customerApi, setCustomerToken } from '../lib/customerApi'

interface CustomerAuthValue {
  customer: Customer | null
  token: string | null
  login: (identifier: string, credential: string) => Promise<void>
  register: (data: { name: string; mobile: string; mpin: string; username: string; password: string }) => Promise<void>
  logout: () => void
  refreshCustomer: () => Promise<Customer>
}

const CustomerAuthContext = createContext<CustomerAuthValue | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [token, setTokenState] = useState<string | null>(null)

  const startSession = (response: { token: string; customer: Customer }) => {
    setCustomerToken(response.token)
    setTokenState(response.token)
    setCustomer(response.customer)
  }

  const login = async (identifier: string, credential: string) => {
    startSession(await customerApi.login(identifier, credential))
  }

  const register = async (data: { name: string; mobile: string; mpin: string; username: string; password: string }) => {
    startSession(await customerApi.register(data))
  }

  const logout = () => {
    setCustomerToken(null)
    setTokenState(null)
    setCustomer(null)
  }

  const refreshCustomer = async () => {
    const current = await customerApi.me()
    setCustomer(current)
    return current
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, token, login, register, logout, refreshCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const value = useContext(CustomerAuthContext)
  if (!value) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider')
  return value
}
