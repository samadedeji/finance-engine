import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { SeasonalTrend } from '../api/types'

export default function Analytics() {
  const business = auth.getBusiness()!
  const [seasonal, setSeasonal] = useState<SeasonalTrend | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setSeasonal(await api.getSeasonal(business.id)) } catch { /* */ }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleExport = async () => {
    try {
      const csv = await api.exportTransactions(business.id, 'csv')
      // csv is returned as a JSON string from the API; parse it
      const blob = new Blob([csv as unknown as string], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transactions.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open the endpoint directly
      window.open(`/api/analytics/export?format=csv`, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500">Seasonal trends and data export.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading…</p>
      ) : seasonal ? (
        <>
          {/* Trend summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              {seasonal.trend === 'growing' ? (
                <TrendingUp size={18} className="text-emerald-600" />
              ) : seasonal.trend === 'declining' ? (
                <TrendingDown size={18} className="text-rose-600" />
              ) : (
                <Minus size={18} className="text-slate-400" />
              )}
              <h2 className="text-base font-semibold text-slate-900">Trend: {seasonal.trend}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Your average monthly income is {formatNaira(seasonal.avg_monthly_income)},
              with expenses of {formatNaira(seasonal.avg_monthly_expenses)}.
            </p>
          </div>

          {/* Month comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Month-by-Month</h2>
            <div className="mt-4 space-y-3">
              {/* Current month */}
              <div className="rounded-xl bg-brand-50 p-3">
                <p className="text-xs font-medium text-brand-700">This month</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-emerald-600">Income: {formatNaira(seasonal.current_month.income)}</span>
                  <span className="text-sm text-rose-600">Expenses: {formatNaira(seasonal.current_month.expenses)}</span>
                </div>
              </div>

              {seasonal.previous_months.map((m) => (
                <div key={m.month} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-600">{m.month}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-emerald-600">+{formatNaira(m.income)}</span>
                    <span className="text-rose-600">-{formatNaira(m.expenses)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">Not enough data for seasonal analysis yet.</p>
        </div>
      )}
    </div>
  )
}
