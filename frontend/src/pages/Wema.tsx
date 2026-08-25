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
      try { acc = await api.getWemaAccount(business.id) } catch { acc = await api.createWemaAccount(business.id) }
      setAccount(acc)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load account') }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleReconcile = async () => { setReconcile(await api.reconcile(business.id)) }
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
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">Wema Integration</h1>
        <p className="text-sm text-brand-500">Virtual account, reconciliation, and payouts via ALAT.</p>
      </div>

      {error && <div className="rounded-lg bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>}

      {loading ? <div className="py-16 text-center"><div className="spinner mx-auto" /></div> : (
        <>
          <div className="rounded-lg border border-brand-100 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-800 text-sm font-bold text-white">FE</div>
              <div>
                <p className="text-xs text-brand-400">Virtual account</p>
                <p className="text-lg font-bold text-brand-900">{account?.account_number ?? '--'}</p>
              </div>
            </div>
            <p className="mt-1 text-sm text-brand-500">{account?.account_name}</p>
            <p className="mt-3 text-3xl font-bold text-brand-900">{formatNaira(account?.balance ?? 0)}</p>
            <p className="text-xs text-brand-400">{account?.bank_name}</p>
          </div>

          <div className="rounded-lg border border-brand-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-brand-900">Bank reconciliation</h2>
            <p className="mt-1 text-sm text-brand-500">Compare logged sales with your actual bank balance.</p>
            <button onClick={handleReconcile} className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100">
              <RefreshCw size={14} /> Run reconciliation
            </button>
            {reconcile && (
              <div className={`mt-4 rounded-lg p-4 ${reconcile.status === 'matched' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-2">
                  {reconcile.status === 'matched' ? <CheckCircle size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                  <span className={`text-sm font-medium ${reconcile.status === 'matched' ? 'text-emerald-700' : 'text-amber-700'}`}>{reconcile.status === 'matched' ? 'Accounts match' : 'Discrepancy detected'}</span>
                </div>
                <p className="mt-2 text-sm text-brand-600">{reconcile.message}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-brand-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-brand-900">Instant payout</h2>
            <p className="mt-1 text-sm text-brand-500">Transfer funds from your virtual account via ALAT.</p>
            <div className="mt-4 flex gap-2">
              <input type="number" value={payoutAmt} onChange={(e) => setPayoutAmt(e.target.value)} placeholder="Amount to withdraw" className="flex-1 rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              <button onClick={handlePayout} disabled={!payoutAmt} className="flex items-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-50">
                <ArrowRight size={14} /> Send
              </button>
            </div>
            {payout && (
              <div className={`mt-3 rounded-lg p-3 text-sm ${payout.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {payout.message ?? payout.error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
