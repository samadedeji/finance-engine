import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string
  trend?: number
  icon: React.ReactNode
  tone?: 'neutral' | 'income' | 'expense' | 'net'
}

const toneStyles = {
  neutral: 'bg-slate-50 text-slate-700',
  income: 'bg-emerald-50 text-emerald-700',
  expense: 'bg-rose-50 text-rose-700',
  net: 'bg-brand-50 text-brand-800',
}

export default function StatCard({ label, value, trend, icon, tone = 'neutral' }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {trend !== undefined && (
        <p
          className={`mt-1 flex items-center gap-1 text-xs font-medium ${
            trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
          {Math.abs(trend)}% vs previous period
        </p>
      )}
    </div>
  )
}