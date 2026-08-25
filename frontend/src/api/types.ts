export interface Business {
  id: number
  name: string
  business_type: string | null
  phone_number: string
  created_at: string | null
}

export interface AuthResponse {
  business: Business
  access_token: string
  refresh_token: string
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

export type Period = 'day' | 'week' | 'month'

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
  transactions?: Transaction[]
  deleted?: Transaction
  count?: number
}

// ── Savings ──
export interface SavingsGoal {
  id: number
  business_id: number
  name: string
  target_amount: number
  current_amount: number
  auto_save_pct: number | null
  active: boolean
  progress_pct: number
  created_at: string | null
}

// ── Alerts ──
export interface ExpenseAlert {
  id: number
  business_id: number
  category: string
  threshold: number
  period: string
  active: boolean
  triggered: boolean
  created_at: string | null
}

export interface AlertCheck {
  triggered: (ExpenseAlert & { spent: number; message: string })[]
  total_active: number
}

// ── Competitor Prices ──
export interface CompetitorPrice {
  id: number
  business_id: number
  product_name: string
  our_price: number
  competitor_name: string | null
  competitor_price: number | null
  date: string
  created_at: string | null
}

// ── Wema ──
export interface WemaAccount {
  account_number: string
  account_name: string
  bank_name: string
  balance: number
  formatted_balance?: string
}

export interface ReconcileResult {
  account_number: string
  logged_income: number
  bank_balance: number
  discrepancy: number
  status: 'matched' | 'discrepancy'
  message: string
}

export interface PayoutResult {
  success: boolean
  reference?: string
  amount?: number
  remaining_balance?: number
  message?: string
  error?: string
}

// ── Analytics ──
export interface SalesStreak {
  current_streak: number
  longest_streak: number
  last_sale_date: string | null
}

export interface CalendarDay {
  date: string
  income: number
  expense: number
  net: number
}

export interface RestockReminder {
  category: string
  recent_sales: number
  previous_sales: number
  velocity_change_pct: number
  message: string
}

export interface SeasonalTrend {
  current_month: { income: number; expenses: number }
  previous_months: { month: string; income: number; expenses: number }[]
  trend: string
  avg_monthly_income: number
  avg_monthly_expenses: number
}

export interface LoanEligibility {
  score: number
  eligible: boolean
  max_loan_estimate: number
  total_income_6m: number
  total_expenses_6m: number
  margin_pct: number
  factors: string[]
  message: string
}

export interface CategorySuggestion {
  category: string
  count: number
}

export const CATEGORIES = ['sales', 'rent', 'supplies', 'transport', 'salaries', 'other'] as const
