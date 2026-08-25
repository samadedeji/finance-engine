import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string
  trend?: number
  icon: React.ReactNode
  tone?: 'neutral' | 'income' | 'expense' | 'net'
}

const toneStyles = {
  neutral: 'bg-brand-50 text-brand-600',
  income: 'bg-emerald-50 text-emerald-600',
  expense: 'bg-rose-50 text-rose-600',
  net: 'bg-brand-50 text-brand-700',
}

export default function StatCard({ label, value, trend, icon, tone = 'neutral' }: Props) {
  return (
    <div className="rounded-lg border border-brand-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-400">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-brand-900">{value}</p>
      {trend !== undefined && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-brand-400'
          }`}
        >
          {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
          {Math.abs(trend)}% vs previous period
        </p>
      )}
    </div>
  )
}
