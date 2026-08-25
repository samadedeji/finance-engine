import { useCallback, useEffect, useState } from 'react'
import { Bell, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { api, auth } from '../api/client'
import type { ExpenseAlert, AlertCheck } from '../api/types'
import { CATEGORIES } from '../api/types'

export default function Alerts() {
  const business = auth.getBusiness()!
  const [alerts, setAlerts] = useState<ExpenseAlert[]>([])
  const [checkResult, setCheckResult] = useState<AlertCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [a, c] = await Promise.all([api.listAlerts(business.id), api.checkAlerts(business.id)])
      setAlerts(a)
      setCheckResult(c)
    } catch { /* */ }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.createAlert({
      category: String(fd.get('category')),
      threshold: Number(fd.get('threshold')),
      period: String(fd.get('period')),
    })
    setShowForm(false)
    void refresh()
  }

  const handleDelete = async (id: number) => {
    await api.deleteAlert(id)
    void refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expense Alerts</h1>
          <p className="text-sm text-slate-500">Get notified when spending crosses your thresholds.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Bell size={16} /> New Alert
        </button>
      </div>

      {/* Triggered alerts */}
      {checkResult && checkResult.triggered.length > 0 && (
        <div className="space-y-2">
          {checkResult.triggered.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">{t.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <select name="category" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm capitalize focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100">
            {CATEGORIES.filter((c) => c !== 'sales').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input name="threshold" type="number" required min={1} placeholder="Threshold amount (₦)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <select name="period" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Alerts list */}
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <Bell size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No alerts set. Create one to monitor spending.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.triggered ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {a.triggered ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 capitalize">{a.category}</p>
                <p className="text-xs text-slate-400">{a.period}ly threshold: ₦{a.threshold.toLocaleString()}</p>
              </div>
              <button onClick={() => void handleDelete(a.id)} className="text-slate-300 hover:text-rose-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
