import type { TopCategory } from '../../api/types'
import { formatNaira } from '../../api/client'

interface Props {
  categories: TopCategory[]
  totalExpenses: number
}

const COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-brand-400']

export default function DonutChart({ categories, totalExpenses }: Props) {
  if (!categories.length || totalExpenses === 0) return null

  let cumulative = 0
  const segments: string[] = []
  const colorVars = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#a855f7', '#627d98']

  categories.forEach((cat, i) => {
    const pct = (cat.amount / totalExpenses) * 100
    const start = cumulative
    cumulative += pct
    segments.push(`${colorVars[i % colorVars.length]} ${start}% ${cumulative}%`)
  })
  if (cumulative < 100) {
    segments.push(`#e2e8f0 ${cumulative}% 100%`)
  }

  const gradient = `conic-gradient(${segments.join(', ')})`

  return (
    <div className="rounded-lg border border-brand-100 bg-white p-5">
      <h2 className="text-sm font-semibold text-brand-900">Expense breakdown</h2>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative">
          <div className="h-32 w-32 rounded-full" style={{ background: gradient }} />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white">
            <span className="text-xs font-bold text-brand-900">{formatNaira(totalExpenses)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {categories.map((cat, i) => (
            <div key={cat.category} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${COLORS[i % COLORS.length]}`} />
              <span className="flex-1 text-sm capitalize text-brand-600">{cat.category}</span>
              <span className="text-sm font-semibold text-brand-900">{formatNaira(cat.amount)}</span>
              <span className="text-xs text-brand-400">
                {((cat.amount / totalExpenses) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
