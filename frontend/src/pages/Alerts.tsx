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
    await api.createAlert({ category: String(fd.get('category')), threshold: Number(fd.get('threshold')), period: String(fd.get('period')) })
    setShowForm(false)
    void refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Expense alerts</h1>
          <p className="text-sm text-brand-500">Get notified when spending crosses your thresholds.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">
          <Bell size={16} /> New alert
        </button>
      </div>

      {checkResult && checkResult.triggered.length > 0 && checkResult.triggered.map((t) => (
        <div key={t.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">{t.message}</p>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-brand-100 bg-white p-5 space-y-3">
          <select name="category" className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm capitalize text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
            {CATEGORIES.filter((c) => c !== 'sales').map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="threshold" type="number" required min={1} placeholder="Threshold amount" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <select name="period" className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="py-8 text-center"><div className="spinner mx-auto" /></div> : alerts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 p-10 text-center">
          <p className="text-sm text-brand-500">No alerts set.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-lg border border-brand-100 bg-white px-5 py-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.triggered ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {a.triggered ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-brand-900 capitalize">{a.category}</p>
                <p className="text-xs text-brand-400">{a.period}ly threshold: {a.threshold.toLocaleString()}</p>
              </div>
              <button onClick={() => void api.deleteAlert(a.id).then(refresh)} className="text-brand-300 hover:text-rose-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
