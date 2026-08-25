import { formatNaira } from '../../api/client'
import type { Report } from '../../api/types'

interface Props {
  report: Report | null
}

export default function InsightPanel({ report }: Props) {
  if (!report) return null

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-brand-900">Insights</h2>
        <ul className="mt-3 space-y-2">
          {report.insights.length === 0 ? (
            <li className="text-sm text-brand-400">Not enough data yet. Keep tracking.</li>
          ) : (
            report.insights.map((i, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-brand-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                {i}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-lg border border-brand-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-brand-900">Advice</h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-600">
          {report.advice[0] ?? 'Your finances look stable this period.'}
        </p>
      </div>

      {report.top_expense_categories.length > 0 && (
        <div className="rounded-lg border border-brand-100 bg-white p-5">
          <h2 className="text-sm font-semibold text-brand-900">Top expenses</h2>
          <ul className="mt-3 space-y-2">
            {report.top_expense_categories.map((c) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="capitalize text-brand-600">{c.category}</span>
                <span className="font-semibold text-brand-900">{formatNaira(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
