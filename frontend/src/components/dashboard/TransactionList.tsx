import { formatNaira } from '../../api/client'
import type { Transaction } from '../../api/types'

interface Props {
  transactions: Transaction[]
  loading: boolean
}

function dateLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function TransactionList({ transactions, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-400">Loading transactions…</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Transaction history</h2>
        <span className="text-xs font-medium text-slate-400">{transactions.length} records</span>
      </div>

      {transactions.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-400">
          No transactions yet. Log your first sale or expense.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {t.type === 'income' ? '+' : '−'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium capitalize text-slate-900">
                  {t.note || t.category}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {t.category} · {dateLabel(t.date)}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold ${
                  t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {t.type === 'income' ? '+' : '−'}
                {formatNaira(t.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}