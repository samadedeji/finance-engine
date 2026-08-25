import type { AuthResponse, Business, ChatResponse, Period, Report, Transaction } from './types'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const TOKEN_KEY = 'fiengine.token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  register(body: { name: string; phone_number: string; password: string; business_type?: string }) {
    return request<AuthResponse>('/api/register', { method: 'POST', body: JSON.stringify(body) })
  },
  login(body: { phone_number: string; password: string }) {
    return request<AuthResponse>('/api/login', { method: 'POST', body: JSON.stringify(body) })
  },
  getReport(_businessId: number, period: Period = 'week') {
    return request<Report>(`/api/reports?period=${period}`)
  },
  createTransaction(body: {
    business_id?: number
    type: string
    amount: number
    category: string
    date?: string
    note?: string
  }) {
    const { business_id: _, ...payload } = body
    return request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(payload) })
  },
  listTransactions(_businessId: number) {
    return request<Transaction[]>(`/api/transactions`)
  },
  chat(_businessId: number, message: string) {
    return request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },
  updateProfile(body: { name?: string; business_type?: string; phone_number?: string }) {
    return request<Business>('/api/profile', { method: 'PUT', body: JSON.stringify(body) })
  },
  changePassword(body: { current_password: string; new_password: string }) {
    return request<{ message: string }>('/api/change-password', { method: 'POST', body: JSON.stringify(body) })
  },
}

const BUSINESS_KEY = 'fiengine.business'

export const auth = {
  getBusiness(): Business | null {
    const raw = localStorage.getItem(BUSINESS_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as Business
    } catch {
      return null
    }
  },
  setBusiness(b: Business, token?: string) {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(b))
    if (token) localStorage.setItem(TOKEN_KEY, token)
  },
  clear() {
    localStorage.removeItem(BUSINESS_KEY)
    localStorage.removeItem(TOKEN_KEY)
  },
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}