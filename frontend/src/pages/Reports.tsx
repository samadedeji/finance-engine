import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { Period, Report } from '../api/types'

function TrendBadge({ value }: { value: number }) {
  if (value > 0) return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600"><TrendingUp size={12} />+{value}%</span>
  if (value < 0) return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-600"><TrendingDown size={12} />{value}%</span>
  return <span className="inline-flex items-center gap-0.5 text-xs font-medium text-brand-400"><Minus size={12} />0%</span>
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="capitalize text-brand-600">{label}</span>
        <span className="font-semibold text-brand-900">{formatNaira(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-brand-100">
        <div className={`h-full rounded transition-all duration-500 ${color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
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
    try { setReport(await api.getReport(business.id, period)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load report') }
    finally { setLoading(false) }
  }, [business.id, period])

  useEffect(() => { void refresh() }, [refresh])

  const maxCategory = report ? Math.max(...report.top_expense_categories.map((c) => c.amount), 1) : 1

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Reports</h1>
          <p className="text-sm text-brand-500">{report?.range.start ?? '--'} to {report?.range.end ?? '--'}</p>
        </div>
        <div className="flex rounded-lg border border-brand-200 bg-white p-0.5">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${period === p ? 'bg-brand-800 text-white' : 'text-brand-500 hover:text-brand-700'}`}>{p}</button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-lg bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>}

      {loading && !report ? <div className="py-16 text-center"><div className="spinner mx-auto" /></div> : report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-brand-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Total Income</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{formatNaira(report.total_income)}</p>
              <div className="mt-1"><TrendBadge value={report.income_trend_pct} /></div>
            </div>
            <div className="rounded-lg border border-brand-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Total Expenses</p>
              <p className="mt-2 text-2xl font-bold text-rose-600">{formatNaira(report.total_expenses)}</p>
              <div className="mt-1"><TrendBadge value={report.expense_trend_pct} /></div>
            </div>
            <div className="rounded-lg border border-brand-100 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Net Profit</p>
              <p className={`mt-2 text-2xl font-bold ${report.net >= 0 ? 'text-brand-700' : 'text-rose-600'}`}>{formatNaira(report.net)}</p>
              <p className="mt-1 text-xs text-brand-400">{report.total_income > 0 ? `${Math.round((report.net / report.total_income) * 100)}% margin` : 'No income yet'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-brand-100 bg-white p-5">
            <h2 className="text-sm font-semibold text-brand-900">Income vs Expenses</h2>
            <div className="mt-4 space-y-4">
              <BarRow label="Income" value={report.total_income} max={Math.max(report.total_income, report.total_expenses)} color="bg-emerald-500" />
              <BarRow label="Expenses" value={report.total_expenses} max={Math.max(report.total_income, report.total_expenses)} color="bg-rose-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {report.top_expense_categories.length > 0 && (
              <div className="rounded-lg border border-brand-100 bg-white p-5">
                <h2 className="text-sm font-semibold text-brand-900">Top expense categories</h2>
                <div className="mt-4 space-y-3">
                  {report.top_expense_categories.map((c) => <BarRow key={c.category} label={c.category} value={c.amount} max={maxCategory} color="bg-brand-500" />)}
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="rounded-lg border border-brand-100 bg-white p-5">
                <h2 className="text-sm font-semibold text-brand-900">Insights</h2>
                <ul className="mt-3 space-y-2">
                  {report.insights.length === 0 ? <li className="text-sm text-brand-400">Not enough data yet.</li> : report.insights.map((i, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-brand-600"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />{i}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-brand-100 bg-white p-5">
                <h2 className="text-sm font-semibold text-brand-900">Advice</h2>
                <ul className="mt-3 space-y-2">
                  {report.advice.map((a, idx) => <li key={idx} className="flex gap-2 text-sm text-brand-600"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />{a}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
