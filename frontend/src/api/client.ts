import type {
  AuthResponse, Business, ChatResponse, Period, Report, Transaction,
  SavingsGoal, ExpenseAlert, AlertCheck, CompetitorPrice,
  WemaAccount, ReconcileResult, PayoutResult,
  SalesStreak, CalendarDay, RestockReminder, SeasonalTrend, LoanEligibility,
  CategorySuggestion,
} from './types'

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
  // ── Auth ──
  register(body: { name: string; phone_number: string; password: string; business_type?: string }) {
    return request<AuthResponse>('/api/register', { method: 'POST', body: JSON.stringify(body) })
  },
  login(body: { phone_number: string; password: string }) {
    return request<AuthResponse>('/api/login', { method: 'POST', body: JSON.stringify(body) })
  },

  // ── Transactions ──
  createTransaction(body: {
    business_id?: number; type: string; amount: number; category: string; date?: string; note?: string
  }) {
    const { business_id: _, ...payload } = body
    return request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(payload) })
  },
  listTransactions(_businessId: number) {
    return request<Transaction[]>('/api/transactions')
  },
  deleteTransaction(txnId: number) {
    return request<{ message: string; deleted: Transaction }>(`/api/transactions/${txnId}`, { method: 'DELETE' })
  },
  getCategories(_businessId: number) {
    return request<CategorySuggestion[]>('/api/transactions/categories')
  },

  // ── Reports ──
  getReport(_businessId: number, period: Period = 'week') {
    return request<Report>(`/api/reports?period=${period}`)
  },

  // ── Chat ──
  chat(_businessId: number, message: string) {
    return request<ChatResponse>('/api/chat', { method: 'POST', body: JSON.stringify({ message }) })
  },

  // ── Profile ──
  updateProfile(body: { name?: string; business_type?: string; phone_number?: string }) {
    return request<Business>('/api/profile', { method: 'PUT', body: JSON.stringify(body) })
  },
  changePassword(body: { current_password: string; new_password: string }) {
    return request<{ message: string }>('/api/change-password', { method: 'POST', body: JSON.stringify(body) })
  },

  // ── Analytics ──
  getStreak(_businessId: number) {
    return request<SalesStreak>('/api/analytics/streak')
  },
  getCalendar(_businessId: number, months = 3) {
    return request<CalendarDay[]>(`/api/analytics/calendar?months=${months}`)
  },
  getRestock(_businessId: number) {
    return request<RestockReminder[]>('/api/analytics/restock')
  },
  getSeasonal(_businessId: number) {
    return request<SeasonalTrend>('/api/analytics/seasonal')
  },
  getLoanEligibility(_businessId: number) {
    return request<LoanEligibility>('/api/analytics/loan')
  },
  exportTransactions(_businessId: number, format: 'csv' | 'json' = 'csv') {
    return request<string>(`/api/analytics/export?format=${format}`)
  },

  // ── Savings ──
  listSavings(_businessId: number) {
    return request<SavingsGoal[]>('/api/savings')
  },
  createSavingsGoal(body: { name: string; target_amount: number; auto_save_pct?: number }) {
    return request<SavingsGoal>('/api/savings', { method: 'POST', body: JSON.stringify(body) })
  },
  depositToGoal(goalId: number, amount: number) {
    return request<SavingsGoal>(`/api/savings/${goalId}/deposit`, {
      method: 'POST', body: JSON.stringify({ amount }),
    })
  },
  deleteSavingsGoal(goalId: number) {
    return request<{ message: string }>(`/api/savings/${goalId}`, { method: 'DELETE' })
  },

  // ── Alerts ──
  listAlerts(_businessId: number) {
    return request<ExpenseAlert[]>('/api/alerts')
  },
  createAlert(body: { category: string; threshold: number; period: string }) {
    return request<ExpenseAlert>('/api/alerts', { method: 'POST', body: JSON.stringify(body) })
  },
  checkAlerts(_businessId: number) {
    return request<AlertCheck>('/api/alerts/check')
  },
  deleteAlert(alertId: number) {
    return request<{ message: string }>(`/api/alerts/${alertId}`, { method: 'DELETE' })
  },

  // ── Competitor Prices ──
  listPrices(_businessId: number) {
    return request<CompetitorPrice[]>('/api/prices')
  },
  addPrice(body: { product_name: string; our_price: number; competitor_name?: string; competitor_price?: number }) {
    return request<CompetitorPrice>('/api/prices', { method: 'POST', body: JSON.stringify(body) })
  },

  // ── Wema ──
  getWemaAccount(_businessId: number) {
    return request<WemaAccount>('/api/wema/account')
  },
  createWemaAccount(_businessId: number) {
    return request<WemaAccount>('/api/wema/account', { method: 'POST' })
  },
  getWemaTransactions(_businessId: number, days = 30) {
    return request<Transaction[]>(`/api/wema/transactions?days=${days}`)
  },
  reconcile(_businessId: number) {
    return request<ReconcileResult>('/api/wema/reconcile')
  },
  payout(body: { amount: number; destination?: string }) {
    return request<PayoutResult>('/api/wema/payout', { method: 'POST', body: JSON.stringify(body) })
  },

  // ── Profile (alias) ──
  profile: {
    getBusiness(): Business | null {
      const raw = localStorage.getItem(BUSINESS_KEY)
      if (!raw) return null
      try { return JSON.parse(raw) as Business } catch { return null }
    },
  },
}

const BUSINESS_KEY = 'fiengine.business'

export const auth = {
  getBusiness(): Business | null {
    const raw = localStorage.getItem(BUSINESS_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) as Business } catch { return null }
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
