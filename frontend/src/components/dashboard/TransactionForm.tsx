import { useState } from 'react'
import { api, auth } from '../../api/client'
import { CATEGORIES, type TxnType } from '../../api/types'

interface Props {
  onSaved: () => void
}

export default function TransactionForm({ onSaved }: Props) {
  const business = auth.getBusiness()!
  const [type, setType] = useState<TxnType>('income')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>('sales')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const resetCategory = (t: TxnType) => {
    setType(t)
    setCategory(t === 'income' ? 'sales' : 'other')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setError('Enter a valid amount')
      return
    }
    setSaving(true)
    try {
      await api.createTransaction({
        business_id: business.id,
        type,
        amount: amt,
        category,
        date: date || undefined,
        note: note || undefined,
      })
      setAmount('')
      setDate('')
      setNote('')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold text-slate-900">Log a transaction</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(['income', 'expense'] as TxnType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => resetCategory(t)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
              type === t
                ? t === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="Amount (₦)"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm capitalize focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save transaction'}
      </button>
    </form>
  )
}