import type { TopCategory } from '../../api/types'
import { formatNaira } from '../../api/client'

interface Props {
  categories: TopCategory[]
  totalExpenses: number
}

const COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-slate-500']

export default function DonutChart({ categories, totalExpenses }: Props) {
  if (!categories.length || totalExpenses === 0) return null

  // Build conic gradient segments
  let cumulative = 0
  const segments: string[] = []
  categories.forEach((cat, i) => {
    const pct = (cat.amount / totalExpenses) * 100
    const start = cumulative
    cumulative += pct
    segments.push(`var(--color-${i}) ${start}% ${cumulative}%`)
  })
  // Remaining as grey
  if (cumulative < 100) {
    segments.push(`#e2e8f0 ${cumulative}% 100%`)
  }

  const gradient = `conic-gradient(${segments.join(', ')})`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Expense Breakdown</h2>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative">
          <div
            className="h-32 w-32 rounded-full"
            style={{
              background: gradient,
              // CSS custom properties for the segments
              ['--color-0' as string]: '#10b981',
              ['--color-1' as string]: '#3b82f6',
              ['--color-2' as string]: '#f59e0b',
              ['--color-3' as string]: '#f43f5e',
              ['--color-4' as string]: '#a855f7',
              ['--color-5' as string]: '#64748b',
            }}
          />
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white">
            <span className="text-sm font-bold text-slate-900">{formatNaira(totalExpenses)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {categories.map((cat, i) => (
            <div key={cat.category} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${COLORS[i % COLORS.length]}`} />
              <span className="flex-1 text-sm capitalize text-slate-600">{cat.category}</span>
              <span className="text-sm font-semibold text-slate-900">{formatNaira(cat.amount)}</span>
              <span className="text-xs text-slate-400">
                {((cat.amount / totalExpenses) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
