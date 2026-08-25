import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { WemaAccount, ReconcileResult, PayoutResult } from '../api/types'

export default function Wema() {
  const business = auth.getBusiness()!
  const [account, setAccount] = useState<WemaAccount | null>(null)
  const [reconcile, setReconcile] = useState<ReconcileResult | null>(null)
  const [payout, setPayout] = useState<PayoutResult | null>(null)
  const [payoutAmt, setPayoutAmt] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let acc: WemaAccount
      try {
        acc = await api.getWemaAccount(business.id)
      } catch {
        acc = await api.createWemaAccount(business.id)
      }
      setAccount(acc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load account')
    }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleReconcile = async () => {
    const res = await api.reconcile(business.id)
    setReconcile(res)
  }

  const handlePayout = async () => {
    if (!payoutAmt || Number(payoutAmt) <= 0) return
    const res = await api.payout({ amount: Number(payoutAmt) })
    setPayout(res)
    setPayoutAmt('')
    void refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wema Integration</h1>
        <p className="text-sm text-slate-500">Virtual account, reconciliation, and instant payouts via ALAT.</p>
      </div>

      {error && <div className="rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          {/* Virtual Account Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">₦</div>
              <div>
                <p className="text-sm text-slate-500">Virtual Account</p>
                <p className="text-lg font-bold text-slate-900">{account?.account_number ?? '—'}</p>
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-500">{account?.account_name}</p>
            <p className="mt-3 text-3xl font-bold text-brand-700">{formatNaira(account?.balance ?? 0)}</p>
            <p className="text-xs text-slate-400">{account?.bank_name}</p>
          </div>

          {/* Reconcile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Bank Reconciliation</h2>
            <p className="mt-1 text-sm text-slate-500">Compare logged sales with your actual bank balance.</p>
            <button
              onClick={handleReconcile}
              className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              <RefreshCw size={14} /> Run Reconciliation
            </button>

            {reconcile && (
              <div className={`mt-4 rounded-xl p-4 ${reconcile.status === 'matched' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-2">
                  {reconcile.status === 'matched' ? (
                    <CheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-600" />
                  )}
                  <span className={`text-sm font-medium ${reconcile.status === 'matched' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {reconcile.status === 'matched' ? 'Accounts match' : 'Discrepancy detected'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{reconcile.message}</p>
              </div>
            )}
          </div>

          {/* Instant Payout */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Instant Payout</h2>
            <p className="mt-1 text-sm text-slate-500">Transfer funds from your virtual account via ALAT.</p>
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                value={payoutAmt}
                onChange={(e) => setPayoutAmt(e.target.value)}
                placeholder="Amount to withdraw (₦)"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                onClick={handlePayout}
                disabled={!payoutAmt}
                className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                <ArrowRight size={14} /> Send
              </button>
            </div>

            {payout && (
              <div className={`mt-3 rounded-xl p-3 text-sm ${payout.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {payout.message ?? payout.error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
