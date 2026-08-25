import { Lightbulb, MessageSquareQuote } from 'lucide-react'
import { formatNaira } from '../../api/client'
import type { Report } from '../../api/types'

interface Props {
  report: Report | null
}

export default function InsightPanel({ report }: Props) {
  if (!report) return null

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500" />
          <h2 className="text-base font-semibold text-slate-900">Insights</h2>
        </div>
        <ul className="mt-3 space-y-2">
          {report.insights.length === 0 ? (
            <li className="text-sm text-slate-400">Not enough data yet — keep tracking.</li>
          ) : (
            report.insights.map((i, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-slate-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {i}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageSquareQuote size={16} className="text-brand-600" />
          <h2 className="text-base font-semibold text-slate-900">Advice</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {report.advice[0] ?? 'Your finances look stable this period.'}
        </p>
      </div>

      {report.top_expense_categories.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Top expenses</h2>
          <ul className="mt-3 space-y-2">
            {report.top_expense_categories.map((c) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-600">{c.category}</span>
                <span className="font-semibold text-slate-900">{formatNaira(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}