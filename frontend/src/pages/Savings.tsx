import { useCallback, useEffect, useState } from 'react'
import { Target, Plus, Trash2, ArrowUp } from 'lucide-react'
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
    try {
      const data = await api.listSavings(business.id)
      setGoals(data)
    } catch { /* */ }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.createSavingsGoal({
      name: String(fd.get('name')),
      target_amount: Number(fd.get('target_amount')),
      auto_save_pct: Number(fd.get('auto_save_pct')) || undefined,
    })
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

  const handleDelete = async (goalId: number) => {
    await api.deleteSavingsGoal(goalId)
    void refresh()
  }

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Savings Goals</h1>
          <p className="text-sm text-slate-500">Track progress toward your financial targets.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-brand-600" />
          <span className="text-sm font-medium text-slate-500">Total Saved</span>
        </div>
        <p className="mt-1 text-2xl font-bold text-brand-700">{formatNaira(totalSaved)}</p>
        <p className="text-xs text-slate-400">of {formatNaira(totalTarget)} across all goals</p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <input name="name" required placeholder="Goal name (e.g. New Stock)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input name="target_amount" type="number" required min={1} placeholder="Target amount (₦)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input name="auto_save_pct" type="number" min={0} max={100} placeholder="Auto-save % per sale (optional)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Goals list */}
      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Loading goals…</p>
      ) : goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <Target size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No savings goals yet. Create one to start saving.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{g.name}</h3>
                  {g.auto_save_pct && (
                    <span className="text-xs text-brand-600">Auto-save: {g.auto_save_pct}%</span>
                  )}
                </div>
                <button onClick={() => void handleDelete(g.id)} className="text-slate-300 hover:text-rose-500">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-slate-900">{formatNaira(g.current_amount)}</span>
                  <span className="text-sm text-slate-400">of {formatNaira(g.target_amount)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${Math.min(g.progress_pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-slate-400">{g.progress_pct}%</p>
              </div>

              {depositId === g.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                  <button onClick={() => void handleDeposit(g.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Save</button>
                  <button onClick={() => { setDepositId(null); setDepositAmt('') }} className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setDepositId(g.id)}
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-brand-200 bg-brand-50 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
                >
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
