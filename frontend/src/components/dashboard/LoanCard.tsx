import type { LoanEligibility } from '../../api/types'
import { formatNaira } from '../../api/client'

interface Props {
  loan: LoanEligibility | null
}

export default function LoanCard({ loan }: Props) {
  if (!loan) return null

  const barColor = loan.score >= 70 ? 'bg-emerald-500' : loan.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  const badge = loan.eligible
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-brand-50 text-brand-500'

  return (
    <div className="rounded-lg border border-brand-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-900">Loan readiness</h2>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge}`}>
          {loan.eligible ? 'Eligible' : 'Building history'}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-brand-900">{loan.score}</span>
          <span className="mb-0.5 text-sm text-brand-400">/ 100</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded bg-brand-100">
          <div
            className={`h-full rounded transition-all duration-700 ${barColor}`}
            style={{ width: `${loan.score}%` }}
          />
        </div>
      </div>

      {loan.eligible && (
        <p className="mt-3 text-sm font-medium text-brand-700">
          Up to {formatNaira(loan.max_loan_estimate)} available
        </p>
      )}

      {loan.factors.length > 0 && (
        <ul className="mt-3 space-y-1">
          {loan.factors.map((f, i) => (
            <li key={i} className="flex gap-2 text-xs text-brand-500">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
