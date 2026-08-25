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

  const handleExport = () => { window.open('/api/analytics/export?format=csv', '_blank') }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Analytics</h1>
          <p className="text-sm text-brand-500">Seasonal trends and data export.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {loading ? <div className="py-16 text-center"><div className="spinner mx-auto" /></div> : seasonal ? (
        <>
          <div className="rounded-lg border border-brand-100 bg-white p-6">
            <div className="flex items-center gap-2">
              {seasonal.trend === 'growing' ? <TrendingUp size={18} className="text-emerald-600" /> : seasonal.trend === 'declining' ? <TrendingDown size={18} className="text-rose-600" /> : <Minus size={18} className="text-brand-400" />}
              <h2 className="text-sm font-semibold text-brand-900">Trend: {seasonal.trend}</h2>
            </div>
            <p className="mt-2 text-sm text-brand-500">
              Average monthly income: {formatNaira(seasonal.avg_monthly_income)}. Expenses: {formatNaira(seasonal.avg_monthly_expenses)}.
            </p>
          </div>

          <div className="rounded-lg border border-brand-100 bg-white p-5">
            <h2 className="text-sm font-semibold text-brand-900">Month-by-month</h2>
            <div className="mt-4 space-y-2">
              <div className="rounded-lg bg-brand-50 p-3">
                <p className="text-xs font-medium text-brand-600">This month</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-emerald-600">Income: {formatNaira(seasonal.current_month.income)}</span>
                  <span className="text-sm text-rose-600">Expenses: {formatNaira(seasonal.current_month.expenses)}</span>
                </div>
              </div>
              {seasonal.previous_months.map((m) => (
                <div key={m.month} className="flex items-center justify-between rounded-lg bg-brand-50/50 px-3 py-2">
                  <span className="text-sm font-medium text-brand-600">{m.month}</span>
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
        <div className="rounded-lg border border-dashed border-brand-200 p-10 text-center">
          <p className="text-sm text-brand-500">Not enough data for seasonal analysis yet.</p>
        </div>
      )}
    </div>
  )
}
