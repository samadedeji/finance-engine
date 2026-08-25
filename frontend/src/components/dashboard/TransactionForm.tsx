import { useState } from 'react'
import { api } from '../../api/client'
import { CATEGORIES, type TxnType } from '../../api/types'

interface Props {
  onSaved: () => void
}

export default function TransactionForm({ onSaved }: Props) {
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
    <form onSubmit={handleSubmit} className="rounded-lg border border-brand-100 bg-white p-5">
      <h2 className="text-sm font-semibold text-brand-900">Log a transaction</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(['income', 'expense'] as TxnType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => resetCategory(t)}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              type === t
                ? t === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
                : 'bg-brand-50 text-brand-500 hover:bg-brand-100'
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
          placeholder="Amount (N)"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm capitalize text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        disabled={saving}
        className="mt-4 w-full rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save transaction'}
      </button>
    </form>
  )
}
