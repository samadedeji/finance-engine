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
      <div className="rounded-lg border border-brand-100 bg-white p-5">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-brand-100 bg-white">
      <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-brand-900">Transaction history</h2>
        <span className="text-xs text-brand-400">{transactions.length} records</span>
      </div>

      {transactions.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-brand-400">
          No transactions yet. Log your first sale or expense.
        </p>
      ) : (
        <ul className="divide-y divide-brand-50">
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-5 py-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                  t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                {t.type === 'income' ? '+' : '-'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brand-900">
                  {t.note || t.category}
                </p>
                <p className="text-xs text-brand-400 capitalize">
                  {t.category} &middot; {dateLabel(t.date)}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold ${
                  t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {t.type === 'income' ? '+' : '-'}
                {formatNaira(t.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
