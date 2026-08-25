import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { Period, Report } from '../api/types'

function TrendBadge({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600">
        <TrendingUp size={12} />+{value}%
      </span>
    )
  if (value < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-600">
        <TrendingDown size={12} />
        {value}%
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-400">
      <Minus size={12} />0%
    </span>
  )
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="capitalize text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{formatNaira(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  )
}

export default function Reports() {
  const business = auth.getBusiness()!
  const [period, setPeriod] = useState<Period>('week')
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rep = await api.getReport(business.id, period)
      setReport(rep)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load report')
    } finally {
      setLoading(false)
    }
  }, [business.id, period])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const maxCategory = report
    ? Math.max(...report.top_expense_categories.map((c) => c.amount), 1)
    : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500">
            Period: {report?.range.start ?? '—'} to {report?.range.end ?? '—'}
          </p>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-white p-1">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                period === p ? 'bg-brand-700 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {loading && !report ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading report…</p>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total Income</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                {formatNaira(report.total_income)}
              </p>
              <div className="mt-1">
                <TrendBadge value={report.income_trend_pct} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <ArrowDownRight size={18} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
                {formatNaira(report.total_expenses)}
              </p>
              <div className="mt-1">
                <TrendBadge value={report.expense_trend_pct} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Net Profit</p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    report.net >= 0 ? 'bg-brand-50 text-brand-800' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <span className="text-lg">💰</span>
                </span>
              </div>
              <p
                className={`mt-2 text-2xl font-bold tracking-tight ${
                  report.net >= 0 ? 'text-brand-700' : 'text-rose-600'
                }`}
              >
                {formatNaira(report.net)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {report.total_income > 0
                  ? `${Math.round((report.net / report.total_income) * 100)}% margin`
                  : 'No income yet'}
              </p>
            </div>
          </div>

          {/* Income vs Expenses Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Income vs Expenses</h2>
            <div className="mt-4 space-y-4">
              <BarRow
                label="Income"
                value={report.total_income}
                max={Math.max(report.total_income, report.total_expenses)}
                color="bg-emerald-500"
              />
              <BarRow
                label="Expenses"
                value={report.total_expenses}
                max={Math.max(report.total_income, report.total_expenses)}
                color="bg-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Expense Categories */}
            {report.top_expense_categories.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">Top Expense Categories</h2>
                <div className="mt-4 space-y-3">
                  {report.top_expense_categories.map((c) => (
                    <BarRow
                      key={c.category}
                      label={c.category}
                      value={c.amount}
                      max={maxCategory}
                      color="bg-brand-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Insights & Advice */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">💡 Insights</h2>
                <ul className="mt-3 space-y-2">
                  {report.insights.length === 0 ? (
                    <li className="text-sm text-slate-400">Not enough data yet — keep tracking.</li>
                  ) : (
                    report.insights.map((i, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        {i}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900">💬 Advice</h2>
                <ul className="mt-3 space-y-2">
                  {report.advice.map((a, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
