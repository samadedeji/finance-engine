interface Props {
  income: number
  expenses: number
}

export default function MarginGauge({ income, expenses }: Props) {
  if (income === 0) return null

  const margin = ((income - expenses) / income) * 100
  const clamped = Math.max(0, Math.min(100, margin))
  const color =
    margin > 20 ? 'text-emerald-600' : margin > 10 ? 'text-amber-600' : margin > 0 ? 'text-orange-600' : 'text-rose-600'
  const barColor =
    margin > 20 ? 'bg-emerald-500' : margin > 10 ? 'bg-amber-500' : margin > 0 ? 'bg-orange-500' : 'bg-rose-500'
  const label =
    margin > 20 ? 'Healthy' : margin > 10 ? 'Good' : margin > 0 ? 'Slim' : 'Negative'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Profit Margin</p>
      <div className="mt-2 flex items-end gap-2">
        <span className={`text-3xl font-bold tracking-tight ${color}`}>
          {margin.toFixed(0)}%
        </span>
        <span className={`mb-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          margin > 20 ? 'bg-emerald-50 text-emerald-700' :
          margin > 10 ? 'bg-amber-50 text-amber-700' :
          margin > 0 ? 'bg-orange-50 text-orange-700' :
          'bg-rose-50 text-rose-700'
        }`}>
          {label}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
