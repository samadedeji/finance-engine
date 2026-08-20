import type { Business, ChatResponse, Period, Report, Transaction } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  register(body: { name: string; phone_number: string; password: string; business_type?: string }) {
    return request<Business>('/api/register', { method: 'POST', body: JSON.stringify(body) })
  },
  login(body: { phone_number: string; password: string }) {
    return request<Business>('/api/login', { method: 'POST', body: JSON.stringify(body) })
  },
  getReport(businessId: number, period: Period = 'week') {
    return request<Report>(`/api/reports?business_id=${businessId}&period=${period}`)
  },
  createTransaction(body: {
    business_id: number
    type: string
    amount: number
    category: string
    date?: string
    note?: string
  }) {
    return request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(body) })
  },
  listTransactions(businessId: number) {
    return request<Transaction[]>(`/api/transactions?business_id=${businessId}`)
  },
  chat(businessId: number, message: string) {
    return request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ business_id: businessId, message }),
    })
  },
}

const STORAGE_KEY = 'fiengine.business'

export const auth = {
  getBusiness(): Business | null {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as Business
    } catch {
      return null
    }
  },
  setBusiness(b: Business) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
  },
  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}