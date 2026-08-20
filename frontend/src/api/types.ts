export interface Business {
  id: number
  name: string
  business_type: string | null
  phone_number: string
  created_at: string | null
}

export type TxnType = 'income' | 'expense'

export interface Transaction {
  id: number
  business_id: number
  type: TxnType
  category: string
  amount: number
  note: string | null
  source: string
  date: string
  created_at: string | null
}

export interface TopCategory {
  category: string
  amount: number
}

export type Period = 'day' | 'week'

export interface Report {
  period: Period
  range: { start: string; end: string }
  total_income: number
  total_expenses: number
  net: number
  income_trend_pct: number
  expense_trend_pct: number
  top_expense_categories: TopCategory[]
  insights: string[]
  advice: string[]
}

export interface ChatResponse {
  reply: string
  report?: Report
  transaction?: Transaction
}

export const CATEGORIES = ['sales', 'rent', 'supplies', 'transport', 'salaries', 'other'] as const