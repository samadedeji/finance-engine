import type { CalendarDay } from '../../api/types'
import { formatNaira } from '../../api/client'

interface Props {
  data: CalendarDay[]
}

function getIntensity(value: number, max: number): string {
  if (value === 0) return 'bg-slate-100'
  const ratio = value / max
  if (ratio < 0.25) return 'bg-emerald-100'
  if (ratio < 0.5) return 'bg-emerald-200'
  if (ratio < 0.75) return 'bg-emerald-400'
  return 'bg-emerald-600'
}

function getExpenseIntensity(value: number, max: number): string {
  if (value === 0) return 'bg-slate-100'
  const ratio = value / max
  if (ratio < 0.25) return 'bg-rose-100'
  if (ratio < 0.5) return 'bg-rose-200'
  if (ratio < 0.75) return 'bg-rose-400'
  return 'bg-rose-600'
}

export default function CalendarHeatmap({ data }: Props) {
  if (!data.length) return null

  const maxIncome = Math.max(...data.map((d) => d.income), 1)
  const maxExpense = Math.max(...data.map((d) => d.expense), 1)

  // Group by week for display (last 12 weeks)
  const recent = data.slice(-84)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Cash Flow Calendar</h2>
      <p className="mt-1 text-xs text-slate-400">Last 12 weeks — green = income, red = expenses</p>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-slate-400">{d}</div>
        ))}
        {recent.map((day, i) => {
          const d = new Date(day.date + 'T00:00:00')
          const padLeft = i === 0 ? (d.getDay() + 6) % 7 : 0
          if (i === 0 && padLeft > 0) {
            const blanks = Array.from({ length: padLeft }, (_, j) => (
              <div key={`blank-${j}`} />
            ))
            return (
              <>
                {blanks}
                <Cell key={day.date} day={day} maxIncome={maxIncome} maxExpense={maxExpense} />
              </>
            )
          }
          return <Cell key={day.date} day={day} maxIncome={maxIncome} maxExpense={maxExpense} />
        })}
      </div>
    </div>
  )
}

function Cell({ day, maxIncome, maxExpense }: { day: CalendarDay; maxIncome: number; maxExpense: number }) {
  const incomeColor = getIntensity(day.income, maxIncome)
  const expenseColor = getExpenseIntensity(day.expense, maxExpense)

  return (
    <div className="group relative">
      <div className="flex flex-col gap-0.5">
        <div className={`h-3 w-3 rounded-sm ${incomeColor}`} />
        <div className={`h-3 w-3 rounded-sm ${expenseColor}`} />
      </div>
      <div className="invisible absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:visible">
        {day.date}
        <br />
        In: {formatNaira(day.income)}
        <br />
        Out: {formatNaira(day.expense)}
      </div>
    </div>
  )
}
