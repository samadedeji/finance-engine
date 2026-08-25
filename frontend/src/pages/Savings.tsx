import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, ArrowUp } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { SavingsGoal } from '../api/types'

export default function Savings() {
  const business = auth.getBusiness()!
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [depositId, setDepositId] = useState<number | null>(null)
  const [depositAmt, setDepositAmt] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setGoals(await api.listSavings(business.id)) } catch { /* */ }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.createSavingsGoal({ name: String(fd.get('name')), target_amount: Number(fd.get('target_amount')), auto_save_pct: Number(fd.get('auto_save_pct')) || undefined })
    setShowForm(false)
    void refresh()
  }

  const handleDeposit = async (goalId: number) => {
    if (!depositAmt || Number(depositAmt) <= 0) return
    await api.depositToGoal(goalId, Number(depositAmt))
    setDepositId(null)
    setDepositAmt('')
    void refresh()
  }

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Savings goals</h1>
          <p className="text-sm text-brand-500">Track progress toward your financial targets.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">
          <Plus size={16} /> New goal
        </button>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Total saved</p>
        <p className="mt-1 text-2xl font-bold text-brand-900">{formatNaira(totalSaved)}</p>
        <p className="text-xs text-brand-400">of {formatNaira(totalTarget)} across all goals</p>
        <div className="mt-3 h-2 overflow-hidden rounded bg-brand-100">
          <div className="h-full rounded bg-brand-600 transition-all duration-500" style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }} />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border border-brand-100 bg-white p-5 space-y-3">
          <input name="name" required placeholder="Goal name" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <input name="target_amount" type="number" required min={1} placeholder="Target amount" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <input name="auto_save_pct" type="number" min={0} max={100} placeholder="Auto-save % per sale (optional)" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="py-8 text-center"><div className="spinner mx-auto" /></div> : goals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 p-10 text-center">
          <p className="text-sm text-brand-500">No savings goals yet. Create one to start saving.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <div key={g.id} className="rounded-lg border border-brand-100 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-brand-900">{g.name}</h3>
                  {g.auto_save_pct && <span className="text-xs text-brand-500">Auto-save: {g.auto_save_pct}%</span>}
                </div>
                <button onClick={() => void api.deleteSavingsGoal(g.id).then(refresh)} className="text-brand-300 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
              <div className="mt-3">
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-brand-900">{formatNaira(g.current_amount)}</span>
                  <span className="text-sm text-brand-400">of {formatNaira(g.target_amount)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-brand-100">
                  <div className="h-full rounded bg-brand-600 transition-all duration-500" style={{ width: `${Math.min(g.progress_pct, 100)}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-brand-400">{g.progress_pct}%</p>
              </div>
              {depositId === g.id ? (
                <div className="mt-3 flex gap-2">
                  <input type="number" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} placeholder="Amount" className="flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
                  <button onClick={() => void handleDeposit(g.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Save</button>
                  <button onClick={() => { setDepositId(null); setDepositAmt('') }} className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-600">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDepositId(g.id)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-brand-200 bg-brand-50 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100">
                  <ArrowUp size={14} /> Deposit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
