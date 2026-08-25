import { useCallback, useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Wallet, Download } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { Period, Report, Transaction, SalesStreak, CalendarDay, RestockReminder, LoanEligibility } from '../api/types'
import StatCard from '../components/dashboard/StatCard'
import StreakCard from '../components/dashboard/StreakCard'
import MarginGauge from '../components/dashboard/MarginGauge'
import TransactionForm from '../components/dashboard/TransactionForm'
import TransactionList from '../components/dashboard/TransactionList'
import InsightPanel from '../components/dashboard/InsightPanel'
import DonutChart from '../components/dashboard/DonutChart'
import CalendarHeatmap from '../components/dashboard/CalendarHeatmap'
import RestockPanel from '../components/dashboard/RestockPanel'
import LoanCard from '../components/dashboard/LoanCard'

export default function Dashboard() {
  const business = auth.getBusiness()!
  const [period, setPeriod] = useState<Period>('week')
  const [report, setReport] = useState<Report | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [streak, setStreak] = useState<SalesStreak | null>(null)
  const [calendar, setCalendar] = useState<CalendarDay[]>([])
  const [restock, setRestock] = useState<RestockReminder[]>([])
  const [loan, setLoan] = useState<LoanEligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rep, txns, str, cal, res, lo] = await Promise.all([
        api.getReport(business.id, period),
        api.listTransactions(business.id),
        api.getStreak(business.id),
        api.getCalendar(business.id, 3),
        api.getRestock(business.id),
        api.getLoanEligibility(business.id),
      ])
      setReport(rep)
      setTransactions(txns)
      setStreak(str)
      setCalendar(cal)
      setRestock(res)
      setLoan(lo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your data')
    } finally {
      setLoading(false)
    }
  }, [business.id, period])

  useEffect(() => { void refresh() }, [refresh])

  const handleExport = () => {
    window.open('/api/analytics/export?format=csv', '_blank')
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">
            {greeting}, {business.name}
          </h1>
          <p className="text-sm text-brand-500">Here is how your business is doing.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
          >
            <Download size={12} /> Export
          </button>
          <div className="flex rounded-lg border border-brand-200 bg-white p-0.5">
            {(['day', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  period === p ? 'bg-brand-800 text-white' : 'text-brand-500 hover:text-brand-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {loading && !report ? (
        <div className="py-16 text-center"><div className="spinner mx-auto" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Income" value={formatNaira(report?.total_income ?? 0)} trend={report?.income_trend_pct} tone="income" icon={<ArrowUpRight size={18} />} />
            <StatCard label="Expenses" value={formatNaira(report?.total_expenses ?? 0)} trend={report?.expense_trend_pct} tone="expense" icon={<ArrowDownRight size={18} />} />
            <StatCard label="Net" value={formatNaira(report?.net ?? 0)} tone={report && report.net >= 0 ? 'net' : 'expense'} icon={<Wallet size={18} />} />
            <StreakCard streak={streak} />
            <MarginGauge income={report?.total_income ?? 0} expenses={report?.total_expenses ?? 0} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <TransactionForm onSaved={() => void refresh()} />
            </div>
            <div className="space-y-4">
              <InsightPanel report={report} />
            </div>
            <div className="space-y-4">
              <RestockPanel reminders={restock} />
              <LoanCard loan={loan} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DonutChart categories={report?.top_expense_categories ?? []} totalExpenses={report?.total_expenses ?? 0} />
            <CalendarHeatmap data={calendar} />
          </div>

          <TransactionList transactions={transactions} loading={loading} />
        </>
      )}
    </div>
  )
}
